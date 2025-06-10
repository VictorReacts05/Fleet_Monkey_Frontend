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
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { getAuthHeader } from "./PurchaseInvoiceAPI";
import { useNavigate } from "react-router-dom";
import { fetchPurchaseInvoiceItems } from "./PurchaseInvoiceAPI";

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/Items`, { headers });
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
    const response = await axios.get(`${APIBASEURL}/UOMs`, { headers });
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

const PurchaseInvoiceParcelsTab = ({
  purchaseInvoiceId,
  onItemsChange,
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const [itemsList, setItemsList] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemForms, setItemForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [loadingExistingItems, setLoadingExistingItems] = useState(false);
  const [activeTab] = useState("items");

  const theme = useTheme();

  // Define columns for DataTable
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "rate", headerName: "Rate", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
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
              uom.UOMName ||
              uom.uomName ||
              uom.Name ||
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

  // Load existing items when purchaseInvoiceId is provided
  useEffect(() => {
    const loadExistingItems = async () => {
      if (!purchaseInvoiceId) {
        setItemsList([]);
        return;
      }

      try {
        setLoadingExistingItems(true);
        const response = await fetchPurchaseInvoiceItems(purchaseInvoiceId);

        let itemData = [];
        if (response && Array.isArray(response)) {
          itemData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          itemData = response.data;
        } else {
          console.warn("Unexpected response format:", response);
        }

        const filteredItems = itemData.filter((item) => {
          const itemPIID =
            item.PIID || item.PiId || item.piId || item.PurchaseInvoiceID;
          return String(itemPIID) === String(purchaseInvoiceId);
        });

        if (filteredItems.length === 0) {
          setItemsList([]);
          return;
        }

        let itemsToUse = items;
        let uomsToUse = uoms;

        if (items.length <= 1) {
          try {
            const itemsResponse = await fetchItems();
            itemsToUse = [
              { value: "", label: "Select an item" },
              ...itemsResponse.map((item) => ({
                value: String(item.ItemID),
                label: item.ItemName,
              })),
            ];
          } catch (err) {
            console.error("Failed to fetch items directly:", err);
          }
        }

        if (uoms.length <= 1) {
          try {
            const uomsResponse = await fetchUOMs();
            uomsToUse = [
              { value: "", label: "Select a UOM" },
              ...uomsResponse.map((uom) => ({
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
                  uom.UOMName ||
                  uom.uomName ||
                  uom.Name ||
                  uom.name ||
                  String(uom.UOMDescription || uom.Description || "Unknown UOM"),
              })),
            ];
          } catch (err) {
            console.error("Failed to fetch UOMs directly:", err);
          }
        }

        const formattedItems = filteredItems.map((item, index) => {
          let itemName = "Unknown Item";
          let uomName = "Unknown UOM";

          try {
            const itemId = String(item.ItemID || "");
            const uomId = String(item.UOMID || "");

            const itemOption = itemsToUse.find((i) => i.value === itemId);
            if (itemOption) {
              itemName = itemOption.label;
            } else if (item.ItemName) {
              itemName = item.ItemName;
            } else {
              itemName = `Item #${itemId}`;
            }

            const uomOption = uomsToUse.find((u) => u.value === uomId);
            if (uomOption) {
              uomName = uomOption.label;
            } else if (item.UOMName) {
              uomName = item.UOMName;
            } else {
              uomName = `UOM #${uomId}`;
            }
          } catch (err) {
            console.error("Error formatting item data:", err);
          }

          return {
            id: item.PurchaseInvoiceItemID || item.id || Date.now() + index,
            itemId: String(item.ItemID || ""),
            uomId: String(item.UOMID || ""),
            quantity: String(item.ItemQuantity || item.Quantity || "0"),
            rate: String(item.Rate || "0"),
            amount: String(item.Amount || "0"),
            itemName,
            uomName,
            srNo: index + 1,
            PurchaseInvoiceItemID: item.PurchaseInvoiceItemID,
            PIID: purchaseInvoiceId,
          };
        });

        setItemsList(formattedItems);
        if (onItemsChange) {
          onItemsChange(formattedItems);
        }
      } catch (error) {
        console.error("Error loading existing items:", error);
        setItemsList([]);
        toast.error("Failed to load items: " + (error.message || "Unknown error"));
      } finally {
        setLoadingExistingItems(false);
      }
    };

    setItemsList([]);
    loadExistingItems();
  }, [purchaseInvoiceId, items, uoms, onItemsChange]);

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
        // Auto-calculate Amount when Quantity or Rate changes
        if (name === "quantity" || name === "rate") {
          const qty = name === "quantity" ? value : form.quantity;
          const rate = name === "rate" ? value : form.rate;
          updatedForm.amount = (Number(qty) * Number(rate)).toFixed(2);
        }
        return updatedForm;
      })
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
  const handleSave = (formId) => {
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

    const { personId } = getAuthHeader();
    if (!personId) {
      toast.error("User authentication data missing. Please log in again.");
      navigate("/login");
      return;
    }

    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);

    const originalItem =
      form.editIndex !== undefined ? itemsList[form.editIndex] : null;

    const newItem = {
      id: form.originalId || form.id,
      PurchaseInvoiceItemID:
        originalItem?.PurchaseInvoiceItemID || originalItem?.id,
      PIID: purchaseInvoiceId,
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
      PurchaseInvoiceItem: {
        PurchaseInvoiceItemID:
          originalItem?.PurchaseInvoiceItemID || originalItem?.id,
        PIID: purchaseInvoiceId,
        ItemID: parseInt(form.itemId, 10),
        UOMID: parseInt(form.uomId, 10),
        ItemQuantity: parseInt(form.quantity, 10),
        Rate: parseFloat(form.rate),
        Amount: parseFloat(form.amount),
        CreatedByID: personId ? parseInt(personId, 10) : null,
      },
    };

    let updatedItems;
    if (form.editIndex !== undefined) {
      updatedItems = [...itemsList];
      updatedItems[form.editIndex] = newItem;
    } else {
      updatedItems = [...itemsList, newItem];
    }

    setItemsList(updatedItems);
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }

    setItemForms((prev) => prev.filter((f) => f.id !== formId));
  };

  // Handle deleting an item
  const handleDeleteItem = (id) => {
    setDeleteItemId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedItems = itemsList.filter((p) => p.id !== deleteItemId);
    setItemsList(updatedItems);
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteItemId(null);
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
        {loading || loadingExistingItems ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mb: 2 }}
              >
                Add Item
              </Button>
            )}

            {itemsList.length === 0 && itemForms.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                <Typography variant="body1">
                  No items added yet.{" "}
                  {!readOnly && "Click 'Add Item' to add a new item."}
                </Typography>
              </Box>
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