import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  fetchCertifications,
} from "./PurchaseOrderAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";
import ApprovalTab from "../../Common/ApprovalTab";

const PurchaseOrderParcelsTab = ({
  purchaseOrderId,
  onParcelsChange,
  user,
  readOnly = !user,
  refreshApprovals,
}) => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
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
  const [activeView, setActiveView] = useState("items");

  const theme = useTheme();

  const isDropdownLoaded = useRef(false);
  const isParcelsLoaded = useRef(false);

  const memoizedItems = useMemo(() => items, [items]);
  const memoizedUOMs = useMemo(() => uoms, [uoms]);
  const memoizedCertifications = useMemo(() => certifications, [certifications]);

  useEffect(() => {
    if (!purchaseOrderId) {
      setActiveView("items");
    }
  }, [purchaseOrderId, refreshApprovals]);

  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "certificationName", headerName: "Certification", flex: 1 },
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
      const [itemsData, uomsData, certificationsData] = await Promise.all([
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
        fetchCertifications(user).catch((err) => {
          console.error("Failed to fetch certifications:", err);
          console.log("Failed to load certifications");
          return [];
        }),
      ]);

      console.log("Fetched items raw:", itemsData);
      console.log("Fetched UOMs raw:", uomsData);
      console.log("Fetched certifications raw:", certificationsData);

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

      const certificationOptions = [
        { value: "", label: "Select a certification" },
        ...certificationsData.map((cert) => ({
          value: String(cert.CertificationID || cert.id || ""),
          label: cert.CertificationName || cert.name || "Unknown Certification",
        })),
      ];

      console.log("Item options:", itemOptions);
      console.log("UOM options:", uomOptions);
      console.log("Certification options:", certificationOptions);

      setItems(itemOptions);
      setUOMs(uomOptions);
      setCertifications(certificationOptions);
      isDropdownLoaded.current = true;
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load form data: " + error.message);
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
      const parcelResponse = await fetchPurchaseOrderParcels(purchaseOrderId, user);
      console.log("Raw parcel response:", parcelResponse);

      const parcelData = Array.isArray(parcelResponse)
        ? parcelResponse
        : parcelResponse?.data || [];
      console.log("Parcel data:", parcelData);

      const formattedParcels = parcelData.map((parcel, index) => {
        const itemId = String(parcel.ItemID || "");
        const uomId = String(parcel.UOMID || "");
        const certificationId = String(parcel.CertificationID || "");

        const item = memoizedItems.find((i) => i.value === itemId);
        const uom = memoizedUOMs.find((u) => u.value === uomId);
        const certification = memoizedCertifications.find((c) => c.value === certificationId);

        return {
          id: parcel.POParcelID ? String(parcel.POParcelID) : `Parcel-${index}`,
          itemId,
          uomId,
          certificationId,
          quantity: String(parseFloat(parcel.ItemQuantity) || 0),
          rate: String(parseFloat(parcel.Rate) || 0),
          amount: String(parseFloat(parcel.Amount) || 0),
          itemName: item?.label || parcel.ItemName || `Item-${itemId}`,
          uomName: uom?.label || parcel.UOM || `UOM-${uomId}`,
          certificationName: certification?.label || parcel.CertificationName || "None",
          srNo: index + 1,
          PurchaseOrderParcelID: parcel.POParcelID,
          POID: parseInt(purchaseOrderId, 10),
        };
      });

      console.log("Setting parcels:", formattedParcels);
      setParcels(formattedParcels);
      if (onParcelsChange) {
        onParcelsChange(formattedParcels);
      }
      isParcelsLoaded.current = true;
    } catch (error) {
      console.error("Error loading parcels:", error);
      toast.error("Failed to load parcels: " + error.message);
      setParcels([]);
      isParcelsLoaded.current = false;
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, user, memoizedItems, memoizedUOMs, memoizedCertifications, onParcelsChange]);

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
        certificationId: "",
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
        certificationId: parcelToEdit.certificationId,
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
    // Certification is optional, so no validation unless required
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
    const selectedCertification = certifications.find((c) => c.value === form.certificationId);

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
      CertificationID:  parseInt(form.certificationId, 10),
      certificationId:  parseInt(form.certificationId, 10),
      ItemQuantity: parseFloat(form.quantity),
      Quantity: parseFloat(form.quantity),
      quantity: parseFloat(form.quantity),
      Rate: parseFloat(form.rate),
      rate: parseFloat(form.rate),
      Amount: parseFloat(form.amount),
      amount: parseFloat(form.amount),
      itemName: selectedItem?.label || "Unknown Item",
      uomName: selectedUOM?.label || "Unknown UOM",
      certificationName: selectedCertification?.label || "None",
      srNo: originalParcel?.srNo || parcels.length + 1,
      isModified: true,
      CreatedByID: user?.personId ? parseInt(user.personId, 10) : null,
      PurchaseOrderParcel: {
        PurchaseOrderParcelID: originalParcel?.PurchaseOrderParcelID || null,
        POID: parseInt(purchaseOrderId, 10),
        ItemID: parseInt(form.itemId, 10),
        UOMID: parseInt(form.uomId, 10),
        CertificationID: form.certificationId ? parseInt(form.certificationId, 10) : null,
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
        const response = await axios.post(
          `${APIBASEURL}/PO-Parcel`,
          newParcel.PurchaseOrderParcel,
          { headers }
        );
        newParcel.PurchaseOrderParcelID = response.data.id || response.data.PurchaseOrderParcelID || form.id;
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
      toast.error("Failed to save parcel: " + error.message);
    }

    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[formId];
      return newErrors;
    });
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
      toast.error("Failed to delete parcel: " + error.message);
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
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={() => setActiveView("items")}
          >
            Items
          </Typography>
        </Box>
        {purchaseOrderId && (
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
          >
            <Typography
              variant="subtitle1"
              sx={{ cursor: "pointer", fontSize: "1.25rem" }}
              onClick={() => setActiveView("approvals")}
            >
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
          loading ? (
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
                  disabled={items.length <= 1 || uoms.length <= 1 || certifications.length <= 1}
                >
                  Add Parcel
                </Button>
              )}

              {parcels.length === 0 && parcelForms.length === 0 && (
                <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
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

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setParcelForms((prev) => prev.filter((f) => f.id !== form.id))
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
          )
        ) : purchaseOrderId ? (
          <ApprovalTab
            moduleType="purchase-order"
            moduleId={purchaseOrderId}
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

export default PurchaseOrderParcelsTab;
// 