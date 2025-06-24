import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchPurchaseOrderParcels,
  fetchItems,
  fetchUOMs,
} from "./PurchaseOrderAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";

const PurchaseOrderParcelsTab = ({
  purchaseOrderId,
  onParcelsChange,
  user,
  readOnly = !user,
}) => {
  const navigate = useNavigate();
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
  const [activeTab] = useState("parcels");

  const theme = useTheme();

  // Track if dropdown data and parcels have been loaded
  const isDropdownLoaded = useRef(false);
  const isParcelsLoaded = useRef(false);

  // Memoize items and uoms to prevent reference changes
  const memoizedItems = useMemo(() => items, [items]);
  const memoizedUOMs = useMemo(() => uoms, [uoms]);

  // Define columns for DataTable
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "rate", headerName: "Rate", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
  ];

  const loadDropdownData = useCallback(async () => {
    if (!user) {
      console.log("Please log in to access this page");
      navigate("/login");
      return;
    }
    if (isDropdownLoaded.current) {
      console.log("Dropdown data already loaded");
      return;
    }

    try {
      setLoading(true);
      const [itemsData, uomsData] = await Promise.all([
        fetchItems(user).catch((err) => {
          console.error("Failed to fetch items:", err);
          console.log("Failed to load items");
          return [];
        }),
        fetchUOMs(user).catch((err) => {
          console.error("Failed to fetch UOMs:", err);
          console.log("Failed to load UOMs");
          return [];
        }),
      ]);

      console.log("Fetched items raw:", itemsData);
      console.log("Fetched UOMs raw:", uomsData);

      // Convert itemsData to array if it's an object (e.g., ItemMap)
      const itemsArray = Array.isArray(itemsData)
        ? itemsData
        : Object.entries(itemsData || {}).map(([key, value]) => ({
            ItemID: key,
            ItemName: value,
          }));

      const itemOptions = [
        { value: "", label: "Select an item" },
        ...itemsArray.map((item) => ({
          value: String(item.ItemID || ""),
          label: item.ItemName || "Unknown Item",
        })),
      ];

      // Convert uomsData to array if needed
      const uomsArray = Array.isArray(uomsData)
        ? uomsData
        : Object.entries(uomsData || {}).map(([key, value]) => ({
            UOMID: key,
            UOM: value,
          }));

      const uomOptions = [
        { value: "", label: "Select a UOM" },
        ...uomsArray.map((uom) => ({
          value: String(uom.UOMID || ""),
          label:
            uom.UOM ||
            uom.UOMName ||
            uom.Name ||
            uom.Description ||
            "Unknown UOM",
        })),
      ];

      console.log("Item options:", itemOptions);
      console.log("UOM options:", uomOptions);

      setItems(itemOptions);
      setUOMs(uomOptions);
      isDropdownLoaded.current = true;
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      console.log("Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const loadExistingParcels = useCallback(async () => {
    if (!purchaseOrderId || !user || isParcelsLoaded.current) {
      console.log("Skipping parcel load:", {
        purchaseOrderId,
        user: !!user,
        isParcelsLoaded: isParcelsLoaded.current,
      });
      return;
    }

    try {
      setLoading(true);
      const parcelResponse = await fetchPurchaseOrderParcels(
        purchaseOrderId,
        user
      );
      console.log("Raw parcel response:", parcelResponse);

      // Handle both array and object responses
      const parcelData = Array.isArray(parcelResponse)
        ? parcelResponse
        : parcelResponse?.data || [];
      console.log("Parcel data:", parcelData);

      const formattedParcels = parcelData.map((parcel, index) => {
        const itemId = String(parcel.ItemID || "");
        const uomId = String(parcel.UOMID || "");

        const item = memoizedItems.find((i) => i.value === itemId);
        const uom = memoizedUOMs.find((u) => u.value === uomId);

        const formattedParcel = {
          id: parcel.POParcelID ? String(parcel.POParcelID) : `Parcel-${index}`,
          itemId,
          uomId,
          quantity: String(parseFloat(parcel.ItemQuantity) || 0),
          rate: String(parseFloat(parcel.Rate) || 0),
          amount: String(parseFloat(parcel.Amount) || 0),
          itemName: item?.label || parcel.ItemName || `Item-${itemId}`,
          uomName: uom?.label || parcel.UOM || `UOM-${uomId}`,
          srNo: index + 1,
          PurchaseOrderParcelID: parcel.POParcelID,
          POID: parseInt(purchaseOrderId, 10),
        };

        console.log("Formatted parcel:", formattedParcel);
        return formattedParcel;
      });

      console.log("Setting parcels:", formattedParcels);
      setParcels(formattedParcels);
      if (onParcelsChange) {
        onParcelsChange(formattedParcels);
      }
      isParcelsLoaded.current = true;
    } catch (error) {
      console.error("Error loading parcels:", error);
      console.log("Failed to load parcels");
      setParcels([]);
      isParcelsLoaded.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, user, memoizedItems, memoizedUOMs, onParcelsChange]);

  useEffect(() => {
    if (!purchaseOrderId || !user) {
      console.log("Missing purchaseOrderId or user, skipping load");
      return;
    }
    loadDropdownData();
    loadExistingParcels();
  }, [purchaseOrderId, user, loadDropdownData, loadExistingParcels]);

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
        amount: "",
      },
    ]);
  };

  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find((p) => p.id === id);
    if (!parcelToEdit) {
      console.log("Parcel not found");
      return;
    }

    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: parcelToEdit.itemId,
        uomId: parcelToEdit.uomId,
        quantity: parcelToEdit.quantity,
        rate: parcelToEdit.rate,
        amount: parcelToEdit.amount,
        editIndex: parcels.findIndex((p) => p.id === id),
        originalId: id,
      },
    ]);
  };

  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setParcelForms((prev) =>
      prev.map((form) => {
        if (form.id !== formId) {
          return form;
        }
        const updatedForm = { ...form, [name]: value };
        if (name === "quantity" || name === "rate") {
          const qty = name === "quantity" ? value : form.quantity;
          const rate = name === "rate" ? value : form.rate;
          updatedForm.amount = (Number(qty) * Number(rate)).toFixed(2);
        }
        return updatedForm;
      })
    );

    setErrors((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [name]: undefined,
      },
    }));
  };

  const validateParcelForm = (form) => {
    const formErrors = {};
    if (!form.itemId) {
      formErrors.itemId = "Item is required";
    }
    if (!form.uomId) {
      formErrors.uomId = "UOM is required";
    }
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
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      formErrors.amount = "Amount must be a non-negative number";
    }
    return formErrors;
  };

  const handleSave = async (formId) => {
    const form = parcelForms.find((f) => f.id === formId);
    if (!form) {
      return;
    }

    const formErrors = validateParcelForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [formId]: formErrors,
      }));
      return;
    }

    if (!user?.personId) {
      console.log("User authentication data missing. Please log in");
      navigate("/login");
      return;
    }

    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);

    const originalParcel =
      form.editIndex !== undefined ? parcels[form.editIndex] : null;

    const newParcel = {
      id: form.originalId || form.id,
      PurchaseOrderParcelID: originalParcel?.PurchaseOrderParcelID || form.id,
      POID: parseInt(purchaseOrderId, 10),
      ItemID: parseInt(form.itemId, 10),
      itemId: parseInt(form.itemId, 10),
      UOMID: parseInt(form.uomId, 10),
      uomId: parseInt(form.uomId, 10),
      ItemQuantity: parseFloat(form.quantity),
      Quantity: parseFloat(form.quantity),
      quantity: parseFloat(form.quantity),
      Rate: parseFloat(form.rate),
      rate: parseFloat(form.rate),
      Amount: parseFloat(form.amount),
      amount: parseFloat(form.amount),
      itemName: selectedItem?.label || "Unknown Item",
      uomName: selectedUOM?.label || "Unknown UOM",
      srNo: originalParcel?.srNo || parcels.length + 1,
      isModified: true,
      CreatedByID: user?.personId ? parseInt(user.personId, 10) : null,
      PurchaseOrderParcel: {
        PurchaseOrderParcelID: originalParcel?.PurchaseOrderParcelID || null,
        POID: parseInt(purchaseOrderId, 10),
        ItemID: parseInt(form.itemId, 10),
        UOMID: parseInt(form.uomId, 10),
        ItemQuantity: parseFloat(form.quantity),
        Rate: parseFloat(form.rate),
        Amount: parseFloat(form.amount),
        CreatedByID: user?.personId ? parseInt(user.personId, 10) : null,
      },
    };

    try {
      const { headers } = getAuthHeader(user);
      if (originalParcel) {
        await axios.put(
          `${APIBASEURL}/PO-Parcel/${newParcel.PurchaseOrderParcelID}`,
          newParcel.PurchaseOrderParcel,
          { headers }
        );
      } else {
        await axios.post(
          `${APIBASEURL}/PO-Parcel`,
          newParcel.PurchaseOrderParcel,
          { headers }
        );
      }
      setParcels((prev) => {
        let updatedParcels;
        if (form.editIndex !== undefined) {
          updatedParcels = [...prev];
          updatedParcels[form.editIndex] = newParcel;
        } else {
          updatedParcels = [...prev, newParcel];
        }
        if (onParcelsChange) {
          onParcelsChange(updatedParcels);
        }
        console.log("Saved parcels:", updatedParcels);
        return updatedParcels;
      });
      toast.success("Parcel saved successfully");
    } catch (error) {
      console.error("Error saving parcel:", error);
      console.log("Failed to save parcel");
    }

    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
  };

  const handleDeleteParcel = (id) => {
    setDeleteConfirmOpen(true);
    setDeleteParcelId(id);
    console.log("Opening delete dialog for id:", id);
  };

  const handleConfirmDelete = async () => {
    try {
      const parcelToDelete = parcels.find((p) => p.id === deleteParcelId);
      if (parcelToDelete?.PurchaseOrderParcelID) {
        const { headers } = getAuthHeader(user);
        await axios.delete(
          `${APIBASEURL}/PO-Parcel/${parcelToDelete.PurchaseOrderParcelID}`,
          { headers }
        );
      }

      const updatedParcels = parcels.filter((p) => p.id !== deleteParcelId);
      console.log("Deleted parcel, updated parcels:", updatedParcels);
      setParcels(updatedParcels);
      if (onParcelsChange) {
        onParcelsChange(updatedParcels);
      }
      toast.success("Parcel deleted successfully");
    } catch (error) {
      console.error("Error deleting parcel:", error);
      console.log("Failed to delete parcel");
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
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            py: "12px",
            px: "24px",
            fontWeight: "600",
            border: "1px solid #e0e0e0",
            borderBottom: "0",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            backgroundColor:
              theme.palette.mode === "light" ? "#f5f8fc" : "#1e293b",
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="h6" component="p">
            Items
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: "16px",
          border: "1px solid #e0e0e0",
          borderTop: "none",
          borderRadius: "0 8px 8px 8px",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddParcel}
                sx={{
                  mb: 2,
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                }}
              >
                Add Parcel
              </Button>
            )}

            {parcels.length === 0 && parcelForms.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: "12px",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1">
                  No delivery items added yet.{" "}
                  {!readOnly && 'Click "Add Parcel" to start.'}
                </Typography>
              </Box>
            )}

            {parcelForms.map((form) => (
              <Box
                key={form.id}
                sx={{
                  mt: "8px",
                  mb: "16px",
                  p: "16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {form.editIndex !== undefined
                    ? "Edit Delivery Item"
                    : "New Delivery Item"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "16px",
                    mb: "16px",
                  }}
                >
                  <Box sx={{ flex: "1 1 250px", minWidth: "200px" }}>
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

                  <Box sx={{ flex: "1 1 250px", minWidth: "200px" }}>
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

                  <Box sx={{ flex: "1 1 250px", minWidth: "200px" }}>
                    <FormInput
                      name="quantity"
                      label="Quantity"
                      value={form.quantity}
                      onChange={(e) => handleChange(e, form.id)}
                      error={!!errors[form.id]?.quantity}
                      helperText={errors[form.id]?.quantity}
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                  </Box>

                  <Box sx={{ flex: "1 1 250px", minWidth: "200px" }}>
                    <FormInput
                      name="rate"
                      label="Rate"
                      value={form.rate}
                      onChange={(e) => handleChange(e, form.id)}
                      error={!!errors[form.id]?.rate}
                      helperText={errors[form.id]?.rate}
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                  </Box>

                  <Box sx={{ flex: "1 1 250px", minWidth: "200px" }}>
                    <FormInput
                      name="amount"
                      label="Amount"
                      value={form.amount}
                      error={!!errors[form.id]?.amount}
                      helperText={errors[form.id]?.amount}
                      type="number"
                      disabled
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setParcelForms((prev) =>
                        prev.filter((f) => f.id !== form.id)
                      )
                    }
                    sx={{
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      "&:hover": { borderColor: "#1565c0", bgcolor: "#f0f7ff" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleSave(form.id)}
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    Save Item
                  </Button>
                </Box>
              </Box>
            ))}

            {parcels.length > 0 && (
              <DataTable
                rows={parcels}
                columns={columns}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(newPage) => setPage(newPage)}
                onRowsPerPageChange={(newRowsPerPage) =>
                  setRowsPerPage(newRowsPerPage)
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
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                }}
              />
            )}
          </>
        )}
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          {"Confirm Item Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            Are you sure you want to delete this delivery item? This action is
            permanent.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} sx={{ color: "#1976d2" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
          >
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderParcelsTab;
