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
import { fetchItems, fetchUOMs, fetchPurchaseInvoiceItems } from "./PurchaseInvoiceAPI";
import { useNavigate } from "react-router-dom";

const PurchaseInvoiceParcelsTab = ({
  purchaseInvoiceId,
  onItemsChange,
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemForms, setItemForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const theme = useTheme();
  const isMounted = useRef(true);

  // Define columns for DataTable
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "ItemQuantity", headerName: "Quantity", flex: 1 },
    { field: "Rate", headerName: "Rate", flex: 1 },
    { field: "Amount", headerName: "Amount", flex: 1 },
  ];

  // Load data with caching
  const loadData = useCallback(async () => {
    console.log("loadData called with purchaseInvoiceId:", purchaseInvoiceId);

    if (!purchaseInvoiceId) {
      setError("No Purchase Invoice ID provided");
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
        const rawItems = await fetchItems();
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
        const rawUoms = await fetchUOMs();
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
      const parcelData = await fetchPurchaseInvoiceItems(purchaseInvoiceId);
      console.log("Parcel data after fetch:", parcelData);

      // No need to filter since fetchPurchaseInvoiceItems ensures the data matches purchaseInvoiceId
      const formattedItems = parcelData.map((item, index) => {
        const itemId = String(item.ItemID || "");
        const uomId = String(item.UOMID || "");
        const itemOption = itemsData.find((i) => i.value === itemId);
        const uomOption = uomsData.find((u) => u.value === uomId);

        return {
          id: item.PInvoiceParcelID || Date.now() + index,
          itemId,
          uomId,
          quantity: String(item.ItemQuantity || item.Quantity || "0"),
          ItemQuantity: String(item.ItemQuantity || item.Quantity || "0"),
          rate: String(item.Rate || "0"),
          Rate: String(item.Rate || "0"),
          amount: String(item.Amount || "0"),
          Amount: String(item.Amount || "0"),
          itemName: item.ItemName || itemOption?.label || `Item ${itemId}`,
          uomName: item.UOMName || uomOption?.label || `UOM ${uomId}`,
          srNo: index + 1,
          PurchaseInvoiceItemID: item.PInvoiceParcelID,
          PInvoiceID: purchaseInvoiceId,
        };
      });

      console.log("Formatted items for DataTable:", formattedItems);
      setItemsList(formattedItems);
      if (onItemsChange) {
        onItemsChange(formattedItems);
      }
    } catch (error) {
      console.error("loadData error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.message.includes("personId")) {
        setError("Please log in to view items. Click below to log in.");
      } else {
        setError("Failed to load items. Please try again.");
        toast.error("Failed to load items");
      }
    } finally {
      setLoading(false);
    }
  }, [purchaseInvoiceId, onItemsChange, items.length, uoms.length]);

  useEffect(() => {
    if (!isMounted.current) return;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  // Handle adding a new item form
  const handleAddItem = () => {
    const newFormId = Date.now();
    setItemForms((prev) => [
      ...prev,
      {
        id: newFormId,
        itemId: "",
        uomId: "",
        quantity: "",
        rate: "",
        amount: "",
      },
    ]);
  };

  // Handle editing an existing item
  const handleEditItem = (id) => {
    const itemToEdit = itemsList.find((p) => p.id === id);
    if (!itemToEdit) {
      console.error("Item not found for editing:", id);
      return;
    }

    const editFormId = Date.now();
    setItemForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: itemToEdit.itemId,
        uomId: itemToEdit.uomId,
        quantity: itemToEdit.quantity,
        rate: itemToEdit.rate,
        amount: itemToEdit.amount,
        editIndex: itemsList.findIndex((p) => p.id === id),
        originalId: id,
      },
    ]);
  };

  // Handle form field changes
  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setItemForms((prev) =>
      prev.map((form) => {
        if (form.id !== formId) return form;
        const updatedForm = { ...form, [name]: value };
        if (name === "quantity" || name === "rate") {
          const qty = name === "quantity" ? value : form.quantity;
          const rate = name === "rate" ? value : form.rate;
          updatedForm.amount = (Number(qty) * Number(rate)).toFixed(2);
        }
        return updatedForm;
      })
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

  // Validate an item form
  const validateItemForm = (form) => {
    const formErrors = {};
    if (!form.itemId) formErrors.itemId = "Item is required";
    if (!form.uomId) formErrors.uomId = "UOM is required";
    if (!form.quantity) {
      formErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      formErrors.quantity = "Quantity must be a positive number";
    }
    if (!form.rate) {
      formErrors.rate = "Rate is required";
    } else if (isNaN(Number(form.rate)) || Number(form.rate) < 0) {
      formErrors.rate = "Rate must be a non-negative number";
    }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      formErrors.amount = "Invalid Amount";
    }

    return formErrors;
  };

  // Handle saving an item form
  const handleSave = async (formId) => {
    const form = itemForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateItemForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [formId]: formErrors,
      }));
      return;
    }

    try {
      const { headers, personId } = getAuthHeader();
      const selectedItem = items.find((i) => i.value === form.itemId);
      const selectedUOM = uoms.find((u) => u.value === form.uomId);
      const originalItem =
        form.editIndex !== undefined ? itemsList[form.editIndex] : null;

      const newItem = {
        id: form.originalId || form.id,
        PurchaseInvoiceItemID:
          originalItem?.PurchaseInvoiceItemID || originalItem?.id,
        PInvoiceID: purchaseInvoiceId,
        ItemID: parseInt(form.itemId, 10),
        itemId: form.itemId,
        UOMID: parseInt(form.uomId, 10),
        uomId: form.uomId,
        ItemQuantity: parseInt(form.quantity, 10),
        Quantity: parseInt(form.quantity, 10),
        quantity: form.quantity,
        Rate: parseFloat(form.rate),
        rate: form.rate,
        Amount: parseFloat(form.amount),
        amount: form.amount,
        itemName: selectedItem ? selectedItem.label : "Unknown Item",
        uomName: selectedUOM ? selectedUOM.label : "Unknown UOM",
        srNo: originalItem?.srNo || itemsList.length + 1,
        isModified: true,
        CreatedByID: personId ? parseInt(personId, 10) : null,
      };

      // Save to backend
      if (form.editIndex !== undefined) {
        await axios.put(
          `${APIBASEURL}/pInvoice-parcel/${newItem.PurchaseInvoiceItemID}`,
          {
            PInvoiceID: purchaseInvoiceId,
            ItemID: newItem.ItemID,
            UOMID: newItem.UOMID,
            ItemQuantity: newItem.ItemQuantity,
            Rate: newItem.Rate,
            Amount: newItem.Amount,
            CreatedByID: newItem.CreatedByID,
          },
          { headers }
        );
      } else {
        await axios.post(
          `${APIBASEURL}/pInvoice-parcel`,
          {
            PInvoiceID: purchaseInvoiceId,
            ItemID: newItem.ItemID,
            UOMID: newItem.UOMID,
            ItemQuantity: newItem.ItemQuantity,
            Rate: newItem.Rate,
            Amount: newItem.Amount,
            CreatedByID: newItem.CreatedByID,
          },
          { headers }
        );
      }

      const updatedItems =
        form.editIndex !== undefined
          ? itemsList.map((p, i) => (i === form.editIndex ? newItem : p))
          : [...itemsList, newItem];

      setItemsList(updatedItems);
      if (onItemsChange) {
        onItemsChange(updatedItems);
      }
      setItemForms((prev) => prev.filter((f) => f.id !== formId));
      toast.success("Item saved successfully.");
    } catch (error) {
      console.error("handleSave error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.message.includes("personId")) {
        setError("Please log in to save items. Click below to log in.");
      } else {
        toast.error("Failed to save item.");
      }
    }
  };

  // Handle deleting an item
  const handleDeleteItem = (id) => {
    setDeleteItemId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const { headers } = getAuthHeader();
      const itemToDelete = itemsList.find((p) => p.id === deleteItemId);
      if (itemToDelete?.PurchaseInvoiceItemID) {
        await axios.delete(
          `${APIBASEURL}/pInvoice-parcel/${itemToDelete.PurchaseInvoiceItemID}`,
          { headers }
        );
      }

      const updatedItems = itemsList.filter((p) => p.id !== deleteItemId);
      setItemsList(updatedItems);
      if (onItemsChange) {
        onItemsChange(updatedItems);
      }
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
      toast.success("Item deleted successfully.");
    } catch (error) {
      console.error("handleDeleteItem error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.message.includes("personId")) {
        setError("Please log in to delete items. Click below to log in.");
      } else {
        toast.error("Failed to delete item.");
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
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
              theme.palette.mode === "dark" ? "#1f2529" : "#f3f8fd",
            color: theme.palette.text.primary,
            cursor: "pointer",
          }}
        >
          <Typography variant="h6" component="div">
            Items
          </Typography>
        </Box>
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
              onClick={error.includes("log in") ? handleLoginRedirect : loadData}
              sx={{ mt: 2 }}
            >
              {error.includes("log in") ? "Log In" : "Retry"}
            </Button>
          </Box>
        ) : itemsList.length === 0 && itemForms.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <Typography variant="body1">
              No items found.{" "}
              {!readOnly && "Click 'Add Item' to add a new item."}
            </Typography>
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
                      name="rate"
                      label="Rate"
                      value={form.rate}
                      onChange={(e) => handleChange(e, form.id)}
                      error={!!errors[form.id]?.rate}
                      helperText={errors[form.id]?.rate}
                      type="number"
                    />
                  </Box>

                  <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                    <FormInput
                      name="amount"
                      label="Amount"
                      value={form.amount}
                      error={!!errors[form.id]?.amount}
                      helperText={errors[form.id]?.amount}
                      type="number"
                      disabled
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
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(newPage) => setPage(newPage)}
                onRowsPerPageChange={(newPageSize) =>
                  setRowsPerPage(newPageSize)
                }
                rowsPerPageOptions={[5, 10, 25]}
                checkboxSelection={false}
                disableSelectionOnClick
                autoHeight
                hideActions={readOnly}
                onEdit={!readOnly ? handleEditItem : undefined}
                onDelete={!readOnly ? handleDeleteItem : undefined}
                totalRows={itemsList.length}
                isPagination={true}
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
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this item? This action cannot be
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

export default PurchaseInvoiceParcelsTab;