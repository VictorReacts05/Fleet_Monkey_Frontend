import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  TextField,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FormSelect from "../../common/FormSelect";
import FormInput from "../../common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { getAuthHeader } from "./SupplierQuotationAPI";
import DataTable from "../../common/DataTable";
import { useNavigate } from "react-router-dom";
import ApprovalTab from "../../Common/ApprovalTab"; // Adjusted path as needed

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/items`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// Function to fetch UOMs from API
const fetchUOMs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/uoms`, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

const SupplierQuotationParcelTab = ({
  supplierQuotationId,
  initialParcels,
  onParcelsChange,
  readOnly = false,
  isEditing = false,
  refreshApprovals,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [parcels, setParcels] = useState(initialParcels || []);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeView, setActiveView] = useState("items");

  // Reset activeView to "items" when in create mode (supplierQuotationId is undefined/null)
  useEffect(() => {
    if (!supplierQuotationId) {
      setActiveView("items");
    }
  }, [supplierQuotationId]);

  // Update parcels when initialParcels changes
  useEffect(() => {
    setParcels(initialParcels || []);
  }, [initialParcels]);

  const columns = [
    { id: "itemName", label: "Item" },
    { id: "uomName", label: "UOM" },
    {
      id: "ItemQuantity",
      label: "Quantity",
      renderCell: ({ value }) => value.toFixed(2),
    },
    {
      id: "Rate",
      label: "Rate",
      renderCell: ({ row, value }) =>
        isEditing ? (
          <TextField
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleRateChange(row.SupplierQuotationParcelID, e.target.value)
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
        ) : value ? (
          value.toFixed(2)
        ) : (
          "-"
        ),
    },
    {
      id: "Amount",
      label: "Amount",
      renderCell: ({ value }) => (value ? value.toFixed(2) : "-"),
    },
  ];

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [itemsData, uomsData] = await Promise.all([
          fetchItems().catch((err) => {
            console.log("Failed to load items");
            return [];
          }),
          fetchUOMs().catch((err) => {
            console.log("Failed to load UOMs");
            return [];
          }),
        ]);

        const itemOptions = [
          { value: "", label: "Select an item" },
          ...itemsData.map((item) => ({
            value: String(item.ItemID || item.id),
            label: item.ItemName || item.name || "Unknown Item",
          })),
        ];

        const uomOptions = [
          { value: "", label: "Select a UOM" },
          ...uomsData.map((uom) => ({
            value: String(uom.UOMID || uom.id),
            label: uom.UOM || uom.name || "Unknown UOM",
          })),
        ];

        setItems(itemOptions);
        setUOMs(uomOptions);
      } catch (error) {
        console.log("Failed to load dropdown data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Add new parcel form
  const handleAddParcel = () => {
    const newFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: newFormId,
        itemId: "",
        uomId: "",
        quantity: "",
        rate: "",
      },
    ]);
  };

  // Handle editing an existing parcel
  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find(
      (p) => p.SupplierQuotationParcelID === id
    );
    if (!parcelToEdit) {
      console.log("Parcel not found for editing");
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
        rate: String(parcelToEdit.Rate || ""),
        editIndex: parcels.findIndex((p) => p.SupplierQuotationParcelID === id),
        originalId: id,
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

    setErrors((prev) => ({
      ...prev,
      [formId]: { ...prev[formId], [name]: undefined },
    }));
  };

  // Validate parcel form
  const validateParcelForm = (form) => {
    const formErrors = {};
    if (!form.itemId) formErrors.itemId = "Item is required";
    if (!form.uomId) formErrors.uomId = "UOM is required";
    if (
      !form.quantity ||
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    ) {
      formErrors.quantity = "Quantity must be a positive number";
    }
    if (!form.rate || isNaN(Number(form.rate)) || Number(form.rate) < 0) {
      formErrors.rate = "Rate must be a non-negative number";
    }
    return formErrors;
  };

  // Handle saving a parcel form
  const handleSave = (formId) => {
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
    const quantity = parseFloat(form.quantity);
    const rate = parseFloat(form.rate);
    const amount = quantity * rate;

    const newParcel = {
      SupplierQuotationParcelID: form.originalId || Date.now(),
      SupplierQuotationID: supplierQuotationId,
      ItemID: parseInt(form.itemId) || 0,
      itemName: selectedItem ? selectedItem.label : "Unknown Item",
      UOMID: parseInt(form.uomId) || 0,
      uomName: selectedUOM ? selectedUOM.label : "Unknown UOM",
      ItemQuantity: quantity,
      Rate: rate,
      Amount: amount,
      srNo:
        form.editIndex !== undefined
          ? parcels[form.editIndex]?.srNo
          : parcels.length + 1,
      CountryOfOriginID: null,
      CreatedByID: personId ? parseInt(personId) : null,
      IsDeleted: false,
      id: form.originalId || Date.now(),
    };

    setParcels((prevParcels) => {
      let updatedParcels;
      if (form.editIndex !== undefined) {
        updatedParcels = [...prevParcels];
        updatedParcels[form.editIndex] = newParcel;
      } else {
        updatedParcels = [...prevParcels, newParcel];
      }
      if (onParcelsChange) {
        onParcelsChange(updatedParcels);
      }
      return updatedParcels;
    });

    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
    toast.success(
      form.originalId ? "Parcel updated locally" : "Parcel added locally"
    );
  };

  // Handle deleting a parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setParcels((prevParcels) => {
      const updatedParcels = prevParcels.filter(
        (p) => p.SupplierQuotationParcelID !== deleteParcelId
      );
      if (onParcelsChange) {
        onParcelsChange(updatedParcels);
      }
      return updatedParcels;
    });
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
    toast.info("Parcel deleted locally");
  };

  // Handle rate change without API call
  const handleRateChange = (parcelId, value) => {
    setParcels((prevParcels) => {
      const updatedParcels = prevParcels.map((p) => {
        if (p.SupplierQuotationParcelID === parcelId) {
          const rate = parseFloat(value) || 0;
          const amount = p.ItemQuantity * rate;
          return {
            ...p,
            Rate: rate,
            Amount: amount,
            id: p.SupplierQuotationParcelID,
          };
        }
        return p;
      });
      if (onParcelsChange) {
        onParcelsChange(updatedParcels);
      }
      return updatedParcels;
    });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Slice parcels for pagination
  const displayedParcels = parcels.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{ mt: 2, display: "flex", flexDirection: "column", borderRadius: 1 }}
    >
      {/* Tab header */}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onClick={() => setActiveView("items")}
        >
          <Typography variant="h6" component="div">
            Items
          </Typography>
        </Box>
        {supplierQuotationId && (
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
            <Typography
              variant="subtitle1"
              sx={{ fontSize: "1.25rem" }}
            >
              Approvals
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content area */}
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
          loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!readOnly && isEditing && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddParcel}
                  sx={{ mb: 2 }}
                  disabled={items.length <= 1 || uoms.length <= 1}
                >
                  Add Parcel
                </Button>
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
                    color: "text.secondary",
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
                    <Box sx={{ flex: "1 1 24%", minWidth: "200px" }}>
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
                    <Box sx={{ flex: "1 1 24%", minWidth: "200px" }}>
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
                    <Box sx={{ flex: "1 1 24%", minWidth: "200px" }}>
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
                    <Box sx={{ flex: "1 1 24%", minWidth: "200px" }}>
                      <FormInput
                        name="rate"
                        label="Rate"
                        value={form.rate}
                        onChange={(e) => handleChange(e, form.id)}
                        error={!!errors[form.id]?.rate}
                        helperText={errors[form.id]?.rate}
                        type="number"
                        inputProps={{ step: "0.01" }}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
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

              <DataTable
                columns={columns}
                rows={displayedParcels}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={parcels.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onEdit={isEditing && !readOnly ? handleEditParcel : undefined}
                onDelete={isEditing && !readOnly ? handleDeleteParcel : undefined}
                loading={loading}
                emptyMessage={`No parcels found for this Supplier Quotation. ${
                  !readOnly && isEditing
                    ? "Click 'Add Parcel' to add a new parcel."
                    : ""
                }`}
                hideActions={readOnly || !isEditing}
                isPagination={true}
              />
            </>
          )
        ) : supplierQuotationId ? (
          <ApprovalTab
            moduleType="supplier-quotation"
            moduleId={supplierQuotationId}
            refreshTrigger={refreshApprovals}
          />
        ) : null}
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
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
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierQuotationParcelTab;