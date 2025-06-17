// PurchaseRFQParcelTab.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { fetchServiceTypes } from "./PurchaseRFQAPI";

// Function to fetch items from API
const fetchItems = async (token) => {
  try {
    const response = await axios.get(`${APIBASEURL}/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("fetchItems error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Function to fetch UOMs from API
const fetchUOMs = async (token) => {
  try {
    const response = await axios.get(`${APIBASEURL}/uoms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data.data || [];
    if (Array.isArray(data)) {
      return data;
    }
    console.warn("Unexpected UOM response:", data);
    return [];
  } catch (error) {
    console.error("fetchUOMs error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Function to fetch SalesRFQID and parcels from API
const fetchParcels = async (salesRFQId, token) => {
  try {
    if (!salesRFQId) {
      console.log("No SalesRFQID provided");
      return [];
    }
    console.log("Fetching parcels for SalesRFQID:", salesRFQId);
    const response = await axios.get(
      `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("fetchParcels response for SalesRFQ:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("fetchParcels error:", {
      endpoint: `/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

// Function to get auth header
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("User from localStorage:", user);
    if (!user?.personId) {
      console.warn("No valid personId found in localStorage");
      return null;
    }
    return {
      personId: user?.personId || null,
      token: user?.personId, // Use personId as token
    };
  } catch (err) {
    console.error("getAuthHeader error:", err.message);
    return null;
  }
};

const PurchaseRFQParcelTab = ({
  purchaseRFQId,
  onParcelsChange,
  readOnly = false,
}) => {
  const [parcels, setParcels] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parcelForms, setParcelForms] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const theme = useTheme();
  const isMounted = useRef(true);

  // Define columns for table
  const columns = [
    { field: "itemName", headerName: "Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  // Load data with caching
  const loadData = useCallback(async () => {
    if (!purchaseRFQId) {
      setError("No Purchase RFQ ID provided");
      setLoading(false);
      return;
    }

    const auth = getAuthHeader();
    if (!auth) {
      setError("Please log in to view parcels.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch SalesRFQID
      const rfqResponse = await axios.get(
        `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const salesRFQId = rfqResponse.data.data?.SalesRFQID;
      if (!salesRFQId) {
        console.log("No SalesRFQID found for Purchase RFQ:", purchaseRFQId);
        setParcels([]);
        onParcelsChange([]);
        setLoading(false);
        return;
      }

      // Fetch items and UOMs only if not loaded
      let itemsData = items.length > 1 ? items : [];
      let uomsData = uoms.length > 1 ? uoms : [];

      if (!itemsData.length) {
        const rawItems = await fetchItems(auth.token);
        itemsData = [
          { value: "", label: "Select an item" },
          ...rawItems.map((item) => ({
            value: String(item.ItemID),
            label: item.ItemName || "Unknown Item",
          })),
        ];
        setItems(itemsData);
      }

      if (!uomsData.length) {
        const rawUoms = await fetchUOMs(auth.token);
        uomsData = [
          { value: "", label: "Select a UOM" },
          ...rawUoms.map((uom) => ({
            value: String(uom.UOMID),
            label: uom.UOM || uom.UOMName || "Unknown UOM",
          })),
        ];
        setUOMs(uomsData);
      }

      // Fetch parcels
      const parcelData = await fetchParcels(salesRFQId, auth.token);
      const filteredParcels = Array.isArray(parcelData)
        ? parcelData.filter(
            (item) => String(item.SalesRFQID) === String(salesRFQId)
          )
        : [];

      const formattedParcels = filteredParcels.map((item, index) => {
        const itemId = String(item.ItemID || "");
        const uomId = String(item.UOMID || "");
        const itemOption = itemsData.find((i) => i.value === itemId);
        const uom = uomsData.find((u) => u.value === uomId);

        return {
          id: item.SalesRFQParcelID || Date.now() + index,
          itemId,
          uomId,
          quantity: String(item.ItemQuantity || item.Quantity || "0"),
          itemName: item.ItemName || itemOption?.label || `Item ${itemId}`,
          uomName: item.UOMName || uom?.label || `UOM ${uomId}`,
          srNo: index + 1,
        };
      });

      setParcels(formattedParcels);
      onParcelsChange(formattedParcels);
    } catch (error) {
      console.error("loadData error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setError("Failed to load parcels. Please try again.");
      toast.error("Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [purchaseRFQId, onParcelsChange, items.length, uoms.length]);

  useEffect(() => {
    if (!isMounted.current) return;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  // Handle add parcel form
  const handleAddParcel = () => {
    const newFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      { id: newFormId, itemId: "", uomId: "", quantity: "" },
    ]);
  };

  // Handle edit parcel
  const handleEditParcel = (id) => {
    const parcel = parcels.find((p) => p.id === id);
    if (!parcel) return;
    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: parcel.itemId,
        uomId: parcel.uomId,
        quantity: parcel.quantity,
        editIndex: parcels.findIndex((p) => p.id === id),
        originalId: parcel.id,
      },
    ]);
  };

  // Handle form changes
  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setParcelForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, [name]: value } : form
      )
    );
    setFormErrors((prev) => ({
      ...prev,
      [formId]: { ...prev[formId], [name]: "" },
    }));
  };

  // Validate form
  const validateForm = (formData) => {
    const errors = {};
    if (!formData.itemId) errors.itemId = "Item is required";
    if (!formData.uomId) errors.uomId = "UOM is required";
    if (!formData.quantity) {
      errors.quantity = "Quantity is required";
    } else if (
      isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) <= 0
    ) {
      errors.quantity = "Quantity must be a positive number";
    }
    return errors;
  };

  // Handle form save
  const handleSave = async (formId) => {
    const form = parcelForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateForm(form);
    if (Object.keys(formErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, [formId]: formErrors }));
      return;
    }

    const auth = getAuthHeader();
    if (!auth) {
      setError("Please log in to save parcels.");
      return;
    }

    try {
      // Fetch SalesRFQID for saving
      const rfqResponse = await axios.get(
        `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const salesRFQId = rfqResponse.data.data?.SalesRFQID;
      if (!salesRFQId) {
        toast.error("No associated Sales RFQ found.");
        return;
      }

      const selectedItem = items.find((item) => item.value === form.itemId);
      const selectedUOM = uoms.find((u) => u.value === form.uomId);
      const originalParcel =
        form.editIndex !== undefined ? parcels[form.editIndex] : null;

      const newParcelData = {
        id: form.originalId || form.id,
        itemId: form.itemId,
        ItemID: parseInt(form.itemId, 10),
        uomId: form.uomId,
        UOMID: parseInt(form.uomId, 10),
        quantity: form.quantity,
        ItemQuantity: parseInt(form.quantity, 10),
        itemName: selectedItem ? selectedItem.label : `Item ${form.itemId}`,
        uomName: selectedUOM ? selectedUOM.label : `UOM ${form.uomId}`,
        srNo: originalParcel?.srNo || parcels.length + 1,
        isModified: true,
        CreatedByID: auth.personId ? parseInt(auth.personId, 10) : null,
        SalesRFQID: parseInt(salesRFQId, 10),
      };

      // Save to backend (assuming Sales RFQ parcels endpoint)
      if (form.editIndex !== undefined) {
        // Update existing parcel
        await axios.put(
          `${APIBASEURL}/sales-rfq-parcels/${newParcelData.id}`,
          {
            SalesRFQID: newParcelData.SalesRFQID,
            ItemID: newParcelData.ItemID,
            UOMID: newParcelData.UOMID,
            ItemQuantity: newParcelData.ItemQuantity,
            CreatedByID: newParcelData.CreatedByID,
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
      } else {
        // Create new parcel
        await axios.post(
          `${APIBASEURL}/sales-rfq-parcels`,
          {
            SalesRFQID: newParcelData.SalesRFQID,
            ItemID: newParcelData.ItemID,
            UOMID: newParcelData.UOMID,
            ItemQuantity: newParcelData.ItemQuantity,
            CreatedByID: newParcelData.CreatedByID,
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
      }

      const updatedParcels =
        form.editIndex !== undefined
          ? parcels.map((p, i) => (i === form.editIndex ? newParcelData : p))
          : [...parcels, newParcelData];

      setParcels(updatedParcels);
      onParcelsChange(updatedParcels);
      setParcelForms((prev) => prev.filter((f) => f.id !== formId));
      toast.success("Parcel saved successfully.");
    } catch (error) {
      console.error("handleSave error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to save parcel.");
    }
  };

  // Handle delete parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const auth = getAuthHeader();
      if (!auth) {
        toast.error("Please log in to delete parcels.");
        return;
      }

      // Delete from backend
      await axios.delete(`${APIBASEURL}/sales-rfq-parcels/${deleteParcelId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const updatedParcels = parcels.filter((p) => p.id !== deleteParcelId);
      setParcels(updatedParcels);
      onParcelsChange(updatedParcels);
      setDeleteConfirmOpen(false);
      setDeleteParcelId(null);
      toast.success("Parcel deleted successfully.");
    } catch (error) {
      console.error("handleDeleteParcel error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to delete parcel.");
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
        flex: 1,
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
          }}
        >
          <Typography variant="h6" component="div">
            Items
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 3, color: "error.main" }}>
            <Typography variant="body1">{error}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={loadData}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : parcels.length === 0 && parcelForms.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <Typography variant="body1">No parcels are found</Typography>
          </Box>
        ) : (
          <>
            {!readOnly && (
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
                      error={!!formErrors[form.id]?.itemId}
                      helperText={formErrors[form.id]?.itemId}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                    <FormSelect
                      name="uomId"
                      label="UOM"
                      value={form.uomId}
                      onChange={(e) => handleChange(e, form.id)}
                      options={uoms}
                      error={!!formErrors[form.id]?.uomId}
                      helperText={formErrors[form.id]?.uomId}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                    <FormInput
                      name="quantity"
                      label="Quantity"
                      value={form.quantity}
                      onChange={(e) => handleChange(e, form.id)}
                      error={!!formErrors[form.id]?.quantity}
                      helperText={formErrors[form.id]?.quantity}
                      type="number"
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
                    Save Items
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
                onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
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
        )}
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
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseRFQParcelTab;
