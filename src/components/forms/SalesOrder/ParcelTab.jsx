import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  useTheme,
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

const ParcelTab = ({ salesOrderId, onParcelsChange, readOnly = false }) => {
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

  const theme = useTheme();

  const columns = [
    { field: "ItemName", headerName: "Item Name", flex: 1 },
    { field: "UOMName", headerName: "UOM", flex: 1 },
    { field: "ItemQuantity", headerName: "Quantity", flex: 1 },
    /* { field: "SupplierRate", headerName: "Supplier Rate", flex: 1 },
    { field: "SupplierAmount", headerName: "Supplier Amount", flex: 1 }, */
    { field: "SalesRate", headerName: "Sales Rate", flex: 1 },
    { field: "SalesAmount", headerName: "Sales Amount", flex: 1 },
  ];

  // Load dropdown data when component mounts
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
            console.error("Failed to fetch UOMs:", err);
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
        toast.error("Failed to load form data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load existing Sales Order parcels when salesOrderId is provided
  useEffect(() => {
    const loadExistingSalesOrderParcels = async () => {
      if (!salesOrderId) {
        return;
      }

      try {
        setLoadingExistingParcels(true);
        console.log(`Loading parcels for Sales Order ID: ${salesOrderId}`);

        // Use the fetchSalesOrderParcels function from SalesOrderAPI
        const parcelData = await fetchSalesOrderParcels(salesOrderId);

        console.log("Sales Order Parcels received:", parcelData);

        if (parcelData && parcelData.length > 0) {
          // The fetchSalesOrderParcels function already enhances the parcels with ItemName and UOMName
          const formattedParcels = parcelData.map((parcel, index) => ({
            id: parcel.SalesOrderParcelID || parcel.id || Date.now() + index,
            SalesOrderParcelID: parcel.SalesOrderParcelID,
            SalesOrderID: parcel.SalesOrderID,
            ItemID: parcel.ItemID,
            UOMID: parcel.UOMID,
            ItemQuantity: parcel.ItemQuantity,
            ItemName: parcel.ItemName || "Unknown Item",
            UOMName: parcel.UOMName || "Unknown UOM",
            srNo: index + 1,
            /* SupplierRate: parcel.SupplierRate || 0,
            SupplierAmount: parcel.SupplierAmount || 0, */
            SalesRate: parcel.SalesRate || 0,
            SalesAmount: parcel.SalesAmount || 0,
          }));

          setParcels(formattedParcels);

          // Notify parent component
          if (onParcelsChange) {
            onParcelsChange(formattedParcels);
          }
        } else {
          console.log("No parcels found for this Sales Order");
          setParcels([]);
        }
      } catch (error) {
        console.error("Error loading Sales Order parcels:", error);
        toast.error("Failed to load Sales Order parcels: " + error.message);
        setParcels([]);
      } finally {
        setLoadingExistingParcels(false);
      }
    };

    setParcels([]);
    loadExistingSalesOrderParcels();
  }, [salesOrderId, onParcelsChange]);

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

    // Clear errors when field is changed
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

    try {
      // Get item and UOM names for display
      const selectedItem = items.find((i) => i.value === form.itemId);
      const selectedUOM = uoms.find((u) => u.value === form.uomId);

      if (form.editIndex !== undefined) {
        // Update existing parcel
        const response = await axios.put(
          `${APIBASEURL}/sales-Order-Parcel/${form.salesOrderParcelId}`,
          {
            SalesOrderID: parseInt(salesOrderId),
            ItemID: parseInt(form.itemId),
            UOMID: parseInt(form.uomId),
            ItemQuantity: parseInt(form.quantity),
          }
        );

        if (response.data.success || response.status === 200) {
          // Update the parcels state
          const updatedParcels = [...parcels];
          updatedParcels[form.editIndex] = {
            ...updatedParcels[form.editIndex],
            ItemID: parseInt(form.itemId),
            UOMID: parseInt(form.uomId),
            ItemQuantity: parseInt(form.quantity),
            ItemName: selectedItem ? selectedItem.label : "Unknown Item",
            UOMName: selectedUOM ? selectedUOM.label : "Unknown UOM",
          };
          setParcels(updatedParcels);

          if (onParcelsChange) {
            onParcelsChange(updatedParcels);
          }

          toast.success("Parcel updated successfully");
        }
      } else {
        // Create new parcel
        const response = await axios.post(`${APIBASEURL}/sales-Order-Parcel`, {
          SalesOrderID: parseInt(salesOrderId),
          ItemID: parseInt(form.itemId),
          UOMID: parseInt(form.uomId),
          ItemQuantity: parseInt(form.quantity),
        });

        if (response.data.success || response.status === 201) {
          // Add the new parcel to state
          const newParcel = {
            id: response.data.id || Date.now(),
            SalesOrderParcelID:
              response.data.id || response.data.data?.SalesOrderParcelID,
            SalesOrderID: parseInt(salesOrderId),
            ItemID: parseInt(form.itemId),
            UOMID: parseInt(form.uomId),
            ItemQuantity: parseInt(form.quantity),
            ItemName: selectedItem ? selectedItem.label : "Unknown Item",
            UOMName: selectedUOM ? selectedUOM.label : "Unknown UOM",
            srNo: parcels.length + 1,
            /* SupplierRate: 0, 
            SupplierAmount: 0, */
            SalesRate: 0, // Default value, update if API provides
            SalesAmount: 0, // Default value, update if API provides
          };

          const updatedParcels = [...parcels, newParcel];
          setParcels(updatedParcels);

          if (onParcelsChange) {
            onParcelsChange(updatedParcels);
          }

          toast.success("Parcel added successfully");
        }
      }

      // Remove the form
      setParcelForms((prev) => prev.filter((f) => f.id !== formId));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[formId];
        return newErrors;
      });
    } catch (error) {
      console.error("Error saving parcel:", error);
      toast.error(
        "Failed to save parcel: " +
          (error.response?.data?.message || error.message)
      );
    }
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
        toast.error("Parcel not found");
        setDeleteConfirmOpen(false);
        setDeleteParcelId(null);
        return;
      }

      const response = await axios.delete(
        `${APIBASEURL}/sales-Order-Parcel/${parcelToDelete.SalesOrderParcelID}`
      );

      if (response.data.success || response.status === 200) {
        const updatedParcels = parcels.filter((p) => p.id !== deleteParcelId);
        setParcels(updatedParcels);

        if (onParcelsChange) {
          onParcelsChange(updatedParcels);
        }

        toast.success("Parcel deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting parcel:", error);
      toast.error(
        "Failed to delete parcel: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteParcelId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

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
              theme.palette.mode === "dark" ? "#1f2529" : "#f3f8fd",
            color: theme.palette.text.primary,
            cursor: "pointer",
          }}
        >
          <Typography variant="h6" component="div">
            Sales Order Parcels
          </Typography>
        </Box>
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
        {loading || loadingExistingParcels ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Only show Add Parcel button if not in readOnly mode */}
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

            {/* Show message when no parcels and not in form mode */}
            {parcels.length === 0 && parcelForms.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                <Typography variant="body1">
                  No parcels found for this Sales Order.{" "}
                  {!readOnly && "Click 'Add Parcel' to add a new parcel."}
                </Typography>
              </Box>
            )}

            {/* Parcel forms */}
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
                  {form.editIndex !== undefined ? "Edit Parcel" : "New Parcel"}
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

            {/* DataTable for parcels */}
            {parcels.length > 0 && (
              <DataTable
                rows={parcels}
                columns={columns}
                pageSize={rowsPerPage}
                page={page}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
                rowsPerPageOptions={[5, 10, 25]}
                checkboxSelection={false}
                disableSelectionOnClick
                autoHeight
                hideActions={readOnly}
                onEdit={!readOnly ? handleEditParcel : undefined}
                onDelete={!readOnly ? handleDeleteParcel : undefined}
                totalRows={parcels.length}
                pagination={true}
              />
            )}
          </>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
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
