import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  useTheme,
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
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { fetchSalesInvoiceItems } from "./salesInvoice"; // Import from your salesInvoice.js

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

// Function to get auth header
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
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

const SalesInvoiceParcelTab = ({
  salesInvoiceId,
  onItemsChange,
  readOnly = false,
}) => {
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemForms, setItemForms] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
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
    if (!salesInvoiceId) {
      setError("No Sales Invoice ID provided");
      setLoading(false);
      return;
    }

    const auth = getAuthHeader();
    if (!auth) {
      setError("Please log in to view items.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      // Fetch invoice items
      const itemData = await fetchSalesInvoiceItems(salesInvoiceId);
      const formattedItems = itemData.map((item, index) => ({
        id: item.id,
        itemId: item.itemId,
        uomId: item.uomId,
        quantity: item.quantity,
        itemName: item.itemName,
        uomName: item.uomName,
        srNo: item.srNo,
      }));

      setItemsList(formattedItems);
      onItemsChange(formattedItems);
    } catch (error) {
      console.error("loadData error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setError("Failed to load items. Please try again.");
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [salesInvoiceId, onItemsChange, items.length, uoms.length]);

  useEffect(() => {
    if (!isMounted.current) return;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  // Handle add item form
  const handleAddItem = () => {
    const newFormId = Date.now();
    setItemForms((prev) => [
      ...prev,
      { id: newFormId, itemId: "", uomId: "", quantity: "" },
    ]);
  };

  // Handle edit item
  const handleEditItem = (id) => {
    const item = itemsList.find((i) => i.id === id);
    if (!item) return;
    const editFormId = Date.now();
    setItemForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: item.itemId,
        uomId: item.uomId,
        quantity: item.quantity,
        editIndex: itemsList.findIndex((i) => i.id === id),
        originalId: item.id,
      },
    ]);
  };

  // Handle form changes
  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setItemForms((prev) =>
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
    const form = itemForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateForm(form);
    if (Object.keys(formErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, [formId]: formErrors }));
      return;
    }

    const auth = getAuthHeader();
    if (!auth) {
      setError("Please log in to save items.");
      return;
    }

    try {
      const selectedItem = items.find((item) => item.value === form.itemId);
      const selectedUOM = uoms.find((u) => u.value === form.uomId);
      const originalItem =
        form.editIndex !== undefined ? itemsList[form.editIndex] : null;

      const newItemData = {
        id: form.originalId || form.id,
        itemId: form.itemId,
        ItemID: parseInt(form.itemId, 10),
        uomId: form.uomId,
        UOMID: parseInt(form.uomId, 10),
        quantity: form.quantity,
        Quantity: parseInt(form.quantity, 10),
        itemName: selectedItem ? selectedItem.label : `Item ${form.itemId}`,
        uomName: selectedUOM ? selectedUOM.label : `UOM ${form.uomId}`,
        srNo: originalItem?.srNo || itemsList.length + 1,
        isModified: true,
        CreatedByID: auth.personId ? parseInt(auth.personId, 10) : null,
        SalesInvoiceID: parseInt(salesInvoiceId, 10),
      };

      // Save to backend
      if (form.editIndex !== undefined) {
        // Update existing item
        await axios.put(
          `${APIBASEURL}/sales-invoice-items/${newItemData.id}`,
          {
            SalesInvoiceID: newItemData.SalesInvoiceID,
            ItemID: newItemData.ItemID,
            UOMID: newItemData.UOMID,
            Quantity: newItemData.Quantity,
            CreatedByID: newItemData.CreatedByID,
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
      } else {
        // Create new item
        await axios.post(
          `${APIBASEURL}/sales-invoice-items`,
          {
            SalesInvoiceID: newItemData.SalesInvoiceID,
            ItemID: newItemData.ItemID,
            UOMID: newItemData.UOMID,
            Quantity: newItemData.Quantity,
            CreatedByID: newItemData.CreatedByID,
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
      }

      const updatedItems =
        form.editIndex !== undefined
          ? itemsList.map((i, index) => (index === form.editIndex ? newItemData : i))
          : [...itemsList, newItemData];

      setItemsList(updatedItems);
      onItemsChange(updatedItems);
      setItemForms((prev) => prev.filter((f) => f.id !== formId));
      toast.success("Item saved successfully.");
    } catch (error) {
      console.error("handleSave error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to save item.");
    }
  };

  // Handle delete item
  const handleDeleteItem = (id) => {
    setDeleteItemId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const auth = getAuthHeader();
      if (!auth) {
        toast.error("Please log in to delete items.");
        return;
      }

      // Delete from backend
      await axios.delete(`${APIBASEURL}/sales-invoice-items/${deleteItemId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const updatedItems = itemsList.filter((i) => i.id !== deleteItemId);
      setItemsList(updatedItems);
      onItemsChange(updatedItems);
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
      toast.success("Item deleted successfully.");
    } catch (error) {
      console.error("handleDeleteItem error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to delete item.");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
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
            borderLeft: "1py: 1.5",
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
            Invoice Items
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
        ) : itemsList.length === 0 && itemForms.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <Typography variant="body1">No items are found</Typography>
          </Box>
        ) : (
          <>
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mb: 2 }}
                disabled={items.length <= 1 || uoms.length <= 1}
              >
                Add Item
              </Button>
            )}

            {itemForms.map((form) => (
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
                  {form.editIndex !== undefined ? "Edit Item" : "New Item"}
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
                      setItemForms((prev) =>
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
                    Save Item
                  </Button>
                </Box>
              </Box>
            ))}

            {itemsList.length > 0 && (
              <DataTable
                rows={itemsList}
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
                onEdit={!readOnly ? handleEditItem : undefined}
                onDelete={!readOnly ? handleDeleteItem : undefined}
                totalRows={itemsList.length}
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
            Are you sure you want to remove this item? This action cannot be
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

export default SalesInvoiceParcelTab;