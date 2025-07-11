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
import DataTable from "../../common/DataTable";
import FormSelect from "../../common/FormSelect";
import FormInput from "../../common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { getAuthHeader,fetchSalesQuotationParcels } from "./SalesQuotationAPI";
import { useNavigate } from "react-router-dom";
import ApprovalTab from "../../Common/ApprovalTab";

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

// Function to fetch certifications from API
const fetchCertifications = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/certifications?pageSize=500`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw error;
  }
};

// ErrorBoundary to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="error" variant="body1">
            Error rendering parcels:{" "}
            {this.state.error?.message || "Unknown error"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const ParcelTab = ({
  salesQuotationId,
  parcels: initialParcels,
  readOnly = false,
  isEdit = false,
  error,
  onSalesRateChange,
  onParcelsChange,
  refreshApprovals,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [parcels, setParcels] = useState(initialParcels || []);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const [loadingExistingParcels, setLoadingExistingParcels] = useState(false);
  const [activeView, setActiveView] = useState("items");

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [itemsData, uomsData, certificationsData] = await Promise.all([
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
          fetchCertifications().catch((err) => {
            console.error("Error fetching certifications:", err);
            return [];
          }),
        ]);

        setItems([
          { value: "", label: "Select an item" },
          ...itemsData.map((item) => ({
            value: String(item.ItemID),
            label: item.ItemName,
          })),
        ]);
        setUOMs([
          { value: "", label: "Select a UOM" },
          ...uomsData.map((uom) => ({
            value: String(uom.UOMID || uom.UOMId || uom.id),
            label: uom.UOM || uom.UOMName || uom.Description || "Unknown UOM",
          })),
        ]);
        setCertifications([
          { value: "", label: "Select a certification" },
          ...certificationsData.map((cert) => ({
            value: String(cert.CertificationID || cert.id),
            label: cert.CertificationName || cert.name || "Unknown Certification",
          })),
        ]);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load form data: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadDropdownData();
  }, []);

  // Load existing parcels when salesQuotationId is provided
  useEffect(() => {
    const loadExistingParcels = async () => {
      if (!salesQuotationId) return;

      try {
        setLoadingExistingParcels(true);
        const parcelData = await fetchSalesQuotationParcels(salesQuotationId);
        const formattedParcels = parcelData.map((parcel, index) => ({
          id: parcel.SalesQuotationParcelID || `parcel-${index}`,
          itemId: String(parcel.ItemID || ""),
          uomId: String(parcel.UOMID || ""),
          certificationId: String(parcel.CertificationID || ""),
          quantity: String(parcel.Quantity || "0"),
          rate: Number(parcel.SupplierRate) || 0,
          amount: Number(parcel.SupplierAmount) || 0,
          salesRate: Number(parcel.SalesRate) || 0,
          salesAmount: Number(parcel.SalesAmount) || 0,
          itemName: items.find((i) => i.value === String(parcel.ItemID))?.label || parcel.ItemName || "Unknown Item",
          uomName: uoms.find((u) => u.value === String(parcel.UOMID))?.label || parcel.UOMName || "Unknown UOM",
          certificationName: certifications.find((c) => c.value === String(parcel.CertificationID))?.label || parcel.CertificationName || "None",
          srNo: index + 1,
        }));
        setParcels(formattedParcels);
        if (onParcelsChange) onParcelsChange(formattedParcels);
      } catch (error) {
        console.error("Error loading existing parcels:", error);
        toast.error("Failed to load parcels: " + error.message);
      } finally {
        setLoadingExistingParcels(false);
      }
    };
    if (salesQuotationId) loadExistingParcels();
  }, [salesQuotationId, items, uoms, certifications, onParcelsChange]);

  // Handle adding a new parcel form
  const handleAddParcel = () => {
    const newFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: newFormId,
        itemId: "",
        uomId: "",
        certificationId: "",
        quantity: "",
        rate: "",
        amount: "",
        salesRate: "",
        salesAmount: "",
      },
    ]);
  };

  // Handle editing an existing parcel
  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find((p) => p.id === id);
    if (!parcelToEdit) return;

    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        ...parcelToEdit,
        id: editFormId,
        editIndex: parcels.findIndex((p) => p.id === id),
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
    if (errors[formId]?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [formId]: { ...prev[formId], [name]: undefined },
      }));
    }
  };

  // Validate a parcel form
  const validateParcelForm = (form) => {
    const formErrors = {};
    if (!form.itemId) formErrors.itemId = "Item is required";
    if (!form.uomId) formErrors.uomId = "UOM is required";
    // Certification is optional, so no validation unless required
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      formErrors.quantity = "Quantity must be a positive number";
    if (!form.rate || isNaN(Number(form.rate)) || Number(form.rate) < 0)
      formErrors.rate = "Supplier Rate must be a non-negative number";
    if (
      !form.salesRate ||
      isNaN(Number(form.salesRate)) ||
      Number(form.salesRate) < 0
    )
      formErrors.salesRate = "Sales Rate must be a non-negative number";
    return formErrors;
  };

  // Handle saving a parcel form
  const handleSave = (formId) => {
    const form = parcelForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateParcelForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [formId]: formErrors }));
      return;
    }

    const { personId } = getAuthHeader();
    if (!personId) {
      navigate("/login");
      return;
    }

    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);
    const selectedCertification = certifications.find((c) => c.value === form.certificationId);

    const newParcel = {
      id: form.originalId || form.id,
      itemId: form.itemId,
      uomId: form.uomId,
      certificationId: form.certificationId || "",
      quantity: Number(form.quantity),
      rate: Number(form.rate),
      amount: Number(form.rate) * Number(form.quantity),
      salesRate: Number(form.salesRate),
      salesAmount: Number(form.salesRate) * Number(form.quantity),
      itemName: selectedItem?.label || "Unknown Item",
      uomName: selectedUOM?.label || "Unknown UOM",
      certificationName: selectedCertification?.label || "None",
      srNo: form.originalId ? parcels.find((p) => p.id === form.originalId)?.srNo : parcels.length + 1,
      CreatedByID: parseInt(personId, 10),
    };

    let updatedParcels;
    if (form.editIndex !== undefined) {
      updatedParcels = [...parcels];
      updatedParcels[form.editIndex] = newParcel;
    } else {
      updatedParcels = [...parcels, newParcel];
    }

    setParcels(updatedParcels);
    if (onParcelsChange) onParcelsChange(updatedParcels);
    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[formId];
      return newErrors;
    });
    toast.success(form.editIndex !== undefined ? "Parcel updated successfully" : "Parcel added successfully");
  };

  // Handle deleting a parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedParcels = parcels.filter((p) => p.id !== deleteParcelId);
    setParcels(updatedParcels);
    if (onParcelsChange) onParcelsChange(updatedParcels);
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
    toast.success("Parcel deleted successfully");
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

  // Handle sales rate change in the table
  const handleSalesRateChangeLocal = (parcelId, salesRateValue) => {
    console.log("handleSalesRateChangeLocal:", { parcelId, salesRateValue });
    const updatedParcels = parcels.map((parcel) => {
      if (parcel.id === parcelId) {
        const newSalesRate = Number(salesRateValue) || 0;
        return {
          ...parcel,
          salesRate: newSalesRate,
          salesAmount: newSalesRate * parcel.quantity,
        };
      }
      return parcel;
    });
    setParcels(updatedParcels);
    if (onParcelsChange) onParcelsChange(updatedParcels);
    if (onSalesRateChange) onSalesRateChange(parcelId, salesRateValue);
  };

  // Define table columns
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "certificationName", headerName: "Certification", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(2),
    },
    {
      field: "rate",
      headerName: "Supplier Rate",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
    {
      field: "amount",
      headerName: "Supplier Amount",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
    {
      field: "salesRate",
      headerName: "Sales Rate",
      flex: 1,
      renderCell: (params) =>
        isEdit ? (
          <TextField
            type="number"
            value={params.row.salesRate || ""}
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
          Number(params.row.salesRate).toFixed(6)
        ),
    },
    {
      field: "salesAmount",
      headerName: "Sales Amount",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
  ];

  return (
    <ErrorBoundary>
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
            <Typography variant="h6">Items</Typography>
          </Box>
          {salesQuotationId && (
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
          {salesQuotationId && (
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
                  activeView === "taxes"
                    ? theme.palette.mode === "dark"
                      ? "#37474f"
                      : "#e0f7fa"
                    : theme.palette.mode === "dark"
                    ? "#1f2529"
                    : "#f3f8fd",
                color: theme.palette.text.primary,
                cursor: "pointer",
              }}
              onClick={() => setActiveView("taxes")}
            >
              <Typography variant="subtitle1" sx={{ fontSize: "1.25rem" }}>
                Taxes & Other Charges
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
          {loading || loadingExistingParcels ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography color="error" variant="body1">
                Error loading parcels: {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          ) : activeView === "items" ? (
            <>
              {!readOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddParcel}
                  sx={{ mb: 2 }}
                  disabled={items.length <= 1 || uoms.length <= 1 || certifications.length <= 1}
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
                        name="certificationId"
                        label="Certification"
                        value={form.certificationId}
                        onChange={(e) => handleChange(e, form.id)}
                        options={certifications}
                        error={!!errors[form.id]?.certificationId}
                        helperText={errors[form.id]?.certificationId}
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
                        name="rate"
                        label="Supplier Rate"
                        value={form.rate}
                        onChange={(e) => handleChange(e, form.id)}
                        error={!!errors[form.id]?.rate}
                        helperText={errors[form.id]?.rate}
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
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setParcelForms((prev) => prev.filter((f) => f.id !== form.id))}
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
                  isPagination
                />
              )}
            </>
          ) : salesQuotationId ? (
            <ApprovalTab
              moduleType="sales-quotation"
              moduleId={salesQuotationId}
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
    </ErrorBoundary>
  );
};

export default ParcelTab;
