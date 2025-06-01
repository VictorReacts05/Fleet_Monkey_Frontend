import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  useTheme,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
import { debounce } from "lodash";
import { getAuthHeader } from "./SupplierQuotationAPI";

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/items`, { headers });
    console.log("Items response:", response.data); // Debug log
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
    console.log("UOMs response:", response.data); // Debug log
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

// Function to fetch a single parcel by supplierQuotationParcelId
const fetchParcels = async (supplierQuotationParcelId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching parcel with ID:", supplierQuotationParcelId); // Debug log
    const response = await axios.get(
      `${APIBASEURL}/api/supplier-Quotation-Parcel/${supplierQuotationParcelId}`,
      { headers }
    );
    console.log("Parcel fetch response:", response.data); // Debug log
    // Wrap single parcel in an array for table rendering
    return response.data.data ? [response.data.data] : [];
  } catch (error) {
    console.error("Error fetching parcel:", error);
    throw error;
  }
};

const SupplierQuotationParcelTab = ({
  supplierQuotationId,
  supplierQuotationParcelId,
  onParcelsChange,
  readOnly = false,
  isEditing = false,
}) => {
  const theme = useTheme();
  const [parcels, setParcels] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const [loadingExistingParcels, setLoadingExistingParcels] = useState(false);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [itemsData, uomsData] = await Promise.all([
          fetchItems().catch((err) => {
            toast.error("Failed to load items");
            console.error("Items fetch error:", err);
            return [];
          }),
          fetchUOMs().catch((err) => {
            toast.error("Failed to load UOMs");
            console.error("UOMs fetch error:", err);
            return [];
          }),
        ]);

        const itemOptions = [
          { value: "", label: "Select an item" },
          ...itemsData.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        ];

        const uomOptions = [
          { value: "", label: "Select a UOM" },
          ...uomsData.map((uom) => ({
            value: String(uom.id),
            label: uom.name || "Unknown UOM",
          })),
        ];

        setItems(itemOptions);
        setUOMs(uomOptions);
        console.log("Items set:", itemOptions); // Debug log
        console.log("UOMs set:", uomOptions); // Debug log
      } catch (error) {
        toast.error("Failed to load dropdown data: " + error.message);
        console.error("Dropdown load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load existing parcel
  useEffect(() => {
    const loadExistingParcels = async () => {
      if (!supplierQuotationParcelId) {
        console.log("No supplierQuotationParcelId provided, skipping fetch"); // Debug log
        setParcels([]);
        return;
      }

      try {
        setLoadingExistingParcels(true);
        const parcelData = await fetchParcels(supplierQuotationParcelId);

        const formattedParcels = parcelData.map((parcel, index) => {
          const itemId = String(parcel.ItemID || "");
          const uomId = String(parcel.UOMID || "");
          const item = items.find((i) => i.value === itemId) || {
            label: `Item #${itemId}`,
          };
          const uom = uoms.find((u) => u.value === uomId) || {
            label: `UOM #${uomId}`,
          };

          return {
            SupplierQuotationParcelID: parcel.SupplierQuotationParcelID || parcel.id,
            SupplierQuotationID: supplierQuotationId,
            ItemID: parseInt(itemId) || 0,
            itemName: item.label,
            UOMID: parseInt(uomId) || 0,
            uomName: uom.label,
            ItemQuantity: parseFloat(parcel.ItemQuantity) || 0,
            Rate: parseFloat(parcel.Rate) || 0,
            Amount: parseFloat(parcel.Amount) || 0,
            srNo: index + 1,
            CountryOfOriginID: parcel.CountryOfOriginID || null,
            CreatedByID: parcel.CreatedByID || null,
            IsDeleted: Boolean(parcel.IsDeleted) || false,
          };
        });

        setParcels(formattedParcels);
        console.log("Formatted parcels:", formattedParcels); // Debug log
        if (onParcelsChange) {
          onParcelsChange(formattedParcels);
        }
      } catch (error) {
        toast.error("Failed to load parcel: " + error.message);
        setParcels([]);
      } finally {
        setLoadingExistingParcels(false);
      }
    };

    console.log("useEffect check:", {
      itemsLength: items.length,
      uomsLength: uoms.length,
      supplierQuotationParcelId,
    }); // Debug log

    if (supplierQuotationParcelId) {
      loadExistingParcels();
    } else if (items.length > 1 && uoms.length > 1) {
      // Fallback to show empty state if no parcel ID
      setParcels([]);
    }
  }, [supplierQuotationParcelId, supplierQuotationId, items, uoms, onParcelsChange]);

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
        rate: "",
      },
    ]);
  };

  // Handle editing an existing parcel
  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find((p) => p.SupplierQuotationParcelID === id);
    if (!parcelToEdit) {
      toast.error("Parcel not found for editing");
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
        rate: String(parcelToEdit.Rate),
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
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
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
      srNo: form.editIndex !== undefined ? parcels[form.editIndex].srNo : parcels.length + 1,
      CountryOfOriginID: null,
      CreatedByID: null,
      IsDeleted: false,
    };

    let updatedParcels;
    if (form.editIndex !== undefined) {
      updatedParcels = [...parcels];
      updatedParcels[form.editIndex] = newParcel;
    } else {
      updatedParcels = [...parcels, newParcel];
    }

    setParcels(updatedParcels);
    if (onParcelsChange) {
      onParcelsChange(updatedParcels);
    }

    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
  };

  // Handle deleting a parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedParcels = parcels.filter((p) => p.SupplierQuotationParcelID !== deleteParcelId);
    setParcels(updatedParcels);
    if (onParcelsChange) {
      onParcelsChange(updatedParcels);
    }
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

  // Handle rate change with debouncing
  const handleRateChange = useCallback(
    debounce((parcelId, value) => {
      const updatedParcels = parcels.map((parcel) => {
        if (parcel.SupplierQuotationParcelID === parcelId) {
          const rate = parseFloat(value) || 0;
          const amount = parcel.ItemQuantity * rate;
          return { ...parcel, Rate: rate, Amount: amount };
        }
        return parcel;
      });
      setParcels(updatedParcels);
      if (onParcelsChange) {
        onParcelsChange(updatedParcels);
      }
    }, 300),
    [parcels, onParcelsChange]
  );

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", borderRadius: 1 }}>
      {/* Tab header */}
      <Box sx={{ display: "flex", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
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
            backgroundColor: theme.palette.mode === "dark" ? "#1f2529" : "#f3f8fd",
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
        {loading || loadingExistingParcels ? (
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
              >
                Add Parcel
              </Button>
            )}

            {parcels.length === 0 && parcelForms.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                <Typography variant="body1">
                  No parcels found for this Supplier Quotation.{" "}
                  {!readOnly && isEditing && "Click 'Add Parcel' to add a new parcel."}
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setParcelForms((prev) => prev.filter((f) => f.id !== form.id))
                    }
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={() => handleSave(form.id)}>
                    Save
                  </Button>
                </Box>
              </Box>
            ))}

            {parcels.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 2px 4px rgba(0,0,0,0.7)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "#1976d2",
                      height: "56px",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        Sr. No.
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        Item
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        UOM
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        Quantity
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        Rate
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "white", py: 2 }}
                      >
                        Amount
                      </TableCell>
                      {!readOnly && isEditing && (
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", color: "white", py: 2 }}
                        >
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcels.map((row) => (
                      <TableRow
                        key={row.SupplierQuotationParcelID}
                        sx={{
                          height: "52px",
                          "&:nth-of-type(odd)": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            cursor: "default",
                            transition: "all 0.3s ease",
                          },
                        }}
                      >
                        <TableCell align="center">{row.srNo}</TableCell>
                        <TableCell align="center">{row.itemName}</TableCell>
                        <TableCell align="center">{row.uomName}</TableCell>
                        <TableCell align="center">{row.ItemQuantity}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField
                              type="number"
                              value={row.Rate || ""}
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
                          ) : row.Rate ? (
                            parseFloat(row.Rate).toFixed(2)
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {typeof row.Amount === "number" && !isNaN(row.Amount)
                            ? row.Amount.toFixed(2)
                            : "-"}
                        </TableCell>
                        {!readOnly && isEditing && (
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => handleEditParcel(row.SupplierQuotationParcelID)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteParcel(row.SupplierQuotationParcelID)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this parcel? This action cannot be undone.
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