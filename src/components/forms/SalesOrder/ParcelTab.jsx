import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  useTheme,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../Common/DataTable";
import FormSelect from "../../Common/FormSelect";
import FormInput from "../../Common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { getAuthHeader } from "./SalesOrderAPI";
import { useNavigate } from "react-router-dom";
import ApprovalTab from "../../Common/ApprovalTab";
import { fetchSalesOrderParcels } from "./SalesOrderAPI";

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/items`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// Function to fetch UOMs from API
const fetchUOMs = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/uoms`);
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected UOM API response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

const ParcelTab = ({
  salesOrderId,
  onParcelsChange,
  readOnly = false,
  refreshApprovals,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [parcels, setParcels] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const [loadingExistingParcels, setLoadingExistingParcels] = useState(false);
  const [activeView, setActiveView] = useState("items");

  // Reset activeView to "items" when in create mode
  useEffect(() => {
    if (!salesOrderId) {
      setActiveView("items");
    }
  }, [salesOrderId]);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [itemsData, uomsData] = await Promise.all([
          fetchItems().catch((err) => {
            console.error("Failed to fetch items:", err);
            toast.error("Failed to load items");
            return [];
          }),
          fetchUOMs().catch((err) => {
            console.error("Error fetching UOMs:", err);
            toast.error("Failed to load UOMs");
            return [];
          }),
        ]);

        const itemOptions = [
          { value: "", label: "Select an item" },
          ...itemsData.map((item) => ({
            value: String(item.ItemID),
            label: item.ItemName,
          })),
        ];

        const uomOptions = [
          { value: "", label: "Select a UOM" },
          ...uomsData.map((uom) => ({
            value: String(
              uom.UOMID ||
                uom.UOMId ||
                uom.uomID ||
                uom.uomId ||
                uom.id ||
                uom.ID
            ),
            label:
              uom.UOM ||
              uom.uom ||
              uom.UOMName ||
              uom.uomName ||
              uom.name ||
              String(uom.UOMDescription || uom.Description || "Unknown UOM"),
          })),
        ];

        setItems(itemOptions);
        setUOMs(uomOptions);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Error loading dropdown data");
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load existing Sales Order parcels
  useEffect(() => {
    const loadExistingSalesOrderParcels = async () => {
      if (!salesOrderId) return;

      try {
        setLoadingExistingParcels(true);
        console.log(`Loading parcels for Sales Order ID: ${salesOrderId}`);
        const parcelData = await fetchSalesOrderParcels(salesOrderId);
        console.log("Sales Order Parcels received:", parcelData);

        if (parcelData && parcelData.length > 0) {
          const formattedParcels = parcelData.map((parcel, index) => ({
            id: parcel.SalesOrderParcelID || `parcel-${index}`,
            SalesOrderParcelID: parcel.SalesOrderParcelID,
            SalesOrderID: parcel.SalesOrderID,
            ItemID: String(parcel.ItemID || ""),
            UOMID: String(parcel.UOMID || ""),
            ItemQuantity: Number(parcel.ItemQuantity) || 0,
            SalesRate: Number(parcel.SalesRate) || 0,
            SalesAmount:
              Number(parcel.SalesAmount) ||
              (Number(parcel.SalesRate) || 0) * Number(parcel.ItemQuantity) ||
              0,
            ItemName:
              items.find((i) => i.value === String(parcel.ItemID))?.label ||
              parcel.ItemName ||
              "Unknown Item",
            UOMName:
              uoms.find((u) => u.value === String(parcel.UOMID))?.label ||
              parcel.UOM ||
              "Unknown UOM",
            srNo: index + 1,
          }));

          setParcels(formattedParcels);
          if (onParcelsChange) onParcelsChange(formattedParcels);
        } else {
          console.log("No parcels found for this Sales Order");
          setParcels([]);
        }
      } catch (error) {
        console.error("Error loading Sales Order parcels:", error);
        toast.error("Failed to load parcels");
      } finally {
        setLoadingExistingParcels(false);
      }
    };

    setParcels([]);
    loadExistingSalesOrderParcels();
  }, [salesOrderId, items, uoms, onParcelsChange]);

  // Handle adding a new parcel form
  const handleAddParcel = () => {
    const newFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: newFormId,
        itemId: "",
        uomId: "",
        quantity: "",
        salesRate: "",
      },
    ]);
  };

  // Handle editing an existing parcel
  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find((p) => p.id === id);
    if (!parcelToEdit) {
      console.error("Parcel not found for editing:", id);
      return;
    }

    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: String(parcelToEdit.ItemID),
        uomId: String(parcelToEdit.UOMID),
        quantity: String(parcelToEdit.ItemQuantity),
        salesRate: String(parcelToEdit.SalesRate),
        editIndex: parcels.findIndex((p) => p.id === id),
        originalId: id,
        salesOrderParcelId: parcelToEdit.SalesOrderParcelID,
      },
    ]);
  };

  // Handle form field changes
  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setParcelForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, [name]: value } : form
      )
    );

    if (errors[formId]?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          [name]: undefined,
        },
      }));
    }
  };

  // Handle sales rate change in the table
  const handleSalesRateChangeLocal = (parcelId, salesRateValue) => {
    console.log("handleSalesRateChangeLocal:", { parcelId, salesRateValue });
    const updatedParcels = parcels.map((parcel) => {
      if (parcel.id === parcelId) {
        const newSalesRate = Number(salesRateValue) || 0;
        return {
          ...parcel,
          SalesRate: newSalesRate,
          SalesAmount: newSalesRate * parcel.ItemQuantity,
        };
      }
      return parcel;
    });
    setParcels(updatedParcels);
    if (onParcelsChange) onParcelsChange(updatedParcels);
  };

  // Validate a parcel form
  const validateParcelForm = (form) => {
    const formErrors = {};
    if (!form.itemId) formErrors.itemId = "Item is required";
    if (!form.uomId) formErrors.uomId = "UOM is required";
    if (!form.quantity) {
      formErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      formErrors.quantity = "Quantity must be a positive number";
    }
    if (
      form.salesRate &&
      (isNaN(Number(form.salesRate)) || Number(form.salesRate) < 0)
    ) {
      formErrors.salesRate = "Sales Rate must be a non-negative number";
    }
    return formErrors;
  };

  // Handle saving a parcel form
  const handleSave = async (formId) => {
    const form = parcelForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateParcelForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [formId]: formErrors,
      }));
      return;
    }

    const { personId } = getAuthHeader();
    if (!personId) {
      console.log("User authentication data missing. Please log in again.");
      navigate("/login");
      return;
    }

    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);

    if (form.editIndex !== undefined) {
      const response = await axios.put(
        `${APIBASEURL}/sales-Order-Parcel/${form.salesOrderParcelId}`,
        {
          SalesOrderID: parseInt(salesOrderId),
          ItemID: parseInt(form.itemId),
          UOMID: parseInt(form.uomId),
          ItemQuantity: parseFloat(form.quantity),
          SalesRate: form.salesRate ? parseFloat(form.salesRate) : 0,
        },
        { headers: getAuthHeader() }
      );

      if (response.data.success || response.status === 200) {
        const updatedParcels = [...parcels];
        updatedParcels[form.editIndex] = {
          ...updatedParcels[form.editIndex],
          ItemID: parseInt(form.itemId),
          UOMID: parseInt(form.uomId),
          ItemQuantity: parseFloat(form.quantity),
          SalesRate: parseFloat(form.salesRate) || 0,
          SalesAmount:
            (parseFloat(form.salesRate) || 0) * parseFloat(form.quantity),
          ItemName: selectedItem ? selectedItem.label : "Unknown Item",
          UOMName: selectedUOM ? selectedUOM.label : "Unknown UOM",
        };
        setParcels(updatedParcels);
        if (onParcelsChange) onParcelsChange(updatedParcels);
        toast.success("Parcel updated successfully");
      }
    } else {
      const response = await axios.post(
        `${APIBASEURL}/sales-Order-Parcel`,
        {
          SalesOrderID: parseInt(salesOrderId),
          ItemID: parseInt(form.itemId),
          UOMID: parseInt(form.uomId),
          ItemQuantity: parseFloat(form.quantity),
          SalesRate: form.salesRate ? parseFloat(form.salesRate) : 0,
        },
        { headers: getAuthHeader() }
      );

      if (response.data.success || response.status === 201) {
        const newParcel = {
          id: response.data.id || Date.now(),
          SalesOrderParcelID:
            response.data.id || response.data.data?.SalesOrderParcelID,
          SalesOrderID: parseInt(salesOrderId),
          ItemID: parseInt(form.itemId),
          UOMID: parseInt(form.uomId),
          ItemQuantity: parseFloat(form.quantity),
          SalesRate: parseFloat(form.salesRate) || 0,
          SalesAmount:
            (parseFloat(form.salesRate) || 0) * parseFloat(form.quantity),
          ItemName: selectedItem ? selectedItem.label : "Unknown Item",
          UOMName: selectedUOM ? selectedUOM.label : "Unknown UOM",
          srNo: parcels.length + 1,
          CreatedByID: personId ? parseInt(personId, 10) : null,
        };

        const updatedParcels = [...parcels, newParcel];
        setParcels(updatedParcels);
        if (onParcelsChange) onParcelsChange(updatedParcels);
        toast.success("Parcel added successfully");
      }
    }

    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[formId];
      return newErrors;
    });
  };

  // Handle deleting a parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const parcelToDelete = parcels.find((p) => p.id === deleteParcelId);
      if (!parcelToDelete) {
        setDeleteConfirmOpen(false);
        setDeleteParcelId(null);
        return;
      }

      const response = await axios.delete(
        `${APIBASEURL}/sales-Order-Parcel/${parcelToDelete.SalesOrderParcelID}`,
        { headers: getAuthHeader() }
      );

      if (response.data.success || response.status === 200) {
        const updatedParcels = parcels.filter((p) => p.id !== deleteParcelId);
        setParcels(updatedParcels);
        if (onParcelsChange) onParcelsChange(updatedParcels);
        toast.success("Parcel deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting parcel:", error);
      toast.error("Failed to delete parcel");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteParcelId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

  // Define columns for DataTable
  const columns = [
    { field: "ItemName", headerName: "Item Name", flex: 1 },
    { field: "UOMName", headerName: "UOM", flex: 1 },
    {
      field: "ItemQuantity",
      headerName: "Quantity",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(2),
    },
    {
      field: "SalesRate",
      headerName: "Sales Rate",
      flex: 1,
      renderCell: (params) =>
        isEdit ? (
          <TextField
            type="number"
            value={params.row.SalesRate || ""}
            onChange={(e) =>
              handleSalesRateChangeLocal(params.row.id, e.target.value)
            }
            size="small"
            sx={{
              width: "100px",
              textAlign: "center",
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  "-webkit-appearance": "none",
                  margin: 0,
                },
              "& input[type=number]": {
                "-moz-appearance": "textfield",
              },
            }}
            inputProps={{ min: 0, step: "0.01" }}
            placeholder="0.00"
          />
        ) : (
          Number(params.row.SalesRate).toFixed(6)
        ),
    },
    {
      field: "SalesAmount",
      headerName: "Sales Amount",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
  ];

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Box
          sx={{
            py: 1.5,
            px: 3,
            fontWeight: "bold",
            borderTop: "1px solid #e0e0e0",
            borderRight: "1px solid #e0e0e0",
            borderLeft: "1px solid #e0e0e0",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            backgroundColor:
              activeView === "items"
                ? theme.palette.mode === "dark"
                  ? "#37474f"
                  : "#e0f7fa"
                : theme.palette.mode === "dark"
                ? "#1f2529"
                : "#f3f8fd",
            color: theme.palette.text.primary,
            cursor: "pointer",
          }}
          onClick={() => setActiveView("items")}
        >
          <Typography variant="h6" component="div">
            Items
          </Typography>
        </Box>
        {salesOrderId && (
          <Box
            sx={{
              py: 1.5,
              px: 3,
              fontWeight: "bold",
              borderTop: "1px solid #e0e0e0",
              borderRight: "1px solid #e0e0e0",
              borderLeft: "1px solid #e0e0e0",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor:
                activeView === "approvals"
                  ? theme.palette.mode === "dark"
                    ? "#37474f"
                    : "#e0f7fa"
                  : theme.palette.mode === "dark"
                  ? "#1f2529"
                  : "#f3f8fd",
              color: theme.palette.text.primary,
              cursor: "pointer",
            }}
            onClick={() => setActiveView("approvals")}
          >
            <Typography variant="subtitle1" sx={{ fontSize: "1.25rem" }}>
              Approvals
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          border: "1px solid #e0e0e0",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        {activeView === "items" ? (
          loading || loadingExistingParcels ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!readOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddParcel}
                  sx={{ mb: 2 }}
                >
                  Add Parcel
                </Button>
              )}

              {parcels.length === 0 && parcelForms.length === 0 && (
                <Box
                  sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                >
                  <Typography variant="body1">
                    No parcels added yet.{" "}
                    {!readOnly && "Click 'Add Parcel' to add a new parcel."}
                  </Typography>
                </Box>
              )}

              {parcelForms.map((form) => (
                <Box
                  key={form.id}
                  sx={{
                    mt: 2,
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {form.editIndex !== undefined
                      ? "Edit Parcel"
                      : "New Parcel"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                      <FormSelect
                        name="itemId"
                        label="Item"
                        value={form.itemId}
                        onChange={(e) => handleChange(e, form.id)}
                        options={items}
                        error={!!errors[form.id]?.itemId}
                        helperText={errors[form.id]?.itemId}
                      />
                    </Box>

                    <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                      <FormSelect
                        name="uomId"
                        label="UOM"
                        value={form.uomId}
                        onChange={(e) => handleChange(e, form.id)}
                        options={uoms}
                        error={!!errors[form.id]?.uomId}
                        helperText={errors[form.id]?.uomId}
                      />
                    </Box>

                    <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                      <FormInput
                        name="quantity"
                        label="Quantity"
                        value={form.quantity}
                        onChange={(e) => handleChange(e, form.id)}
                        error={!!errors[form.id]?.quantity}
                        helperText={errors[form.id]?.quantity}
                        type="number"
                      />
                    </Box>

                    <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                      <FormInput
                        name="salesRate"
                        label="Sales Rate"
                        value={form.salesRate}
                        onChange={(e) => handleChange(e, form.id)}
                        error={!!errors[form.id]?.salesRate}
                        helperText={errors[form.id]?.salesRate}
                        type="number"
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setParcelForms((prev) =>
                          prev.filter((f) => f.id !== form.id)
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSave(form.id)}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              ))}

              {parcels.length > 0 && (
                <DataTable
                  rows={parcels}
                  columns={columns}
                  pageSize={rowsPerPage}
                  page={page}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newPageSize) =>
                    setRowsPerPage(newPageSize)
                  }
                  rowsPerPageOptions={[5, 10, 25]}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  autoHeight
                  hideActions={readOnly}
                  onEdit={!readOnly ? handleEditParcel : undefined}
                  onDelete={!readOnly ? handleDeleteParcel : undefined}
                  totalRows={parcels.length}
                  pagination
                />
              )}
            </>
          )
        ) : salesOrderId ? (
          <ApprovalTab
            moduleType="sales-order"
            moduleId={salesOrderId}
            refreshTrigger={refreshApprovals}
          />
        ) : null}
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this parcel? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParcelTab;
