import React, { useState, useEffect } from "react";
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
  useTheme,
  alpha,
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

const ParcelTab = ({ salesRFQId, onParcelsChange, readOnly = false }) => {
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
  const [activeTab] = useState("parcels"); 

  const theme = useTheme();

  // Define columns for DataTable
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
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

  // Load existing parcels when salesRFQId is provided
  useEffect(() => {
    const loadExistingParcels = async () => {
      if (!salesRFQId) {
        return;
      }

      try {
        setLoadingExistingParcels(true);
        let response;
        try {
          response = await axios.get(
            `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`
          );
        } catch (err) {
          console.log(
            "First endpoint attempt failed, trying alternative...",
            err.message
          );
          try {
            response = await axios.get(
              `${APIBASEURL}/sales-rfq/${salesRFQId}/parcels`
            );
          } catch (err2) {
            response = await axios.get(
              `${APIBASEURL}/sales-rfq-parcels/salesrfq/${salesRFQId}`
            );
          }
        }

        if (response && response.data) {
          let parcelData = [];

          // Handle different response formats
          if (response.data.data && Array.isArray(response.data.data)) {
            parcelData = response.data.data;
          } else if (Array.isArray(response.data)) {
            parcelData = response.data;
          } else if (
            response.data.parcels &&
            Array.isArray(response.data.parcels)
          ) {
            parcelData = response.data.parcels;
          } else {
            console.warn("Unexpected response format:", response.data);
          }

          const filteredParcels = parcelData.filter((parcel) => {
            const parcelSalesRFQId =
              parcel.SalesRFQID ||
              parcel.salesRFQID ||
              parcel.salesRfqId ||
              parcel.salesrfqid ||
              parcel.SalesRfqId;

            // Convert both to strings for comparison
            return String(parcelSalesRFQId) === String(salesRFQId);
          });

          if (filteredParcels.length === 0) {
            setParcels([]);
            return;
          }

          let itemsToUse = items;
          let uomsToUse = uoms;

          if (items.length <= 1) {
            try {
              const itemsResponse = await fetchItems();
              const itemsData = itemsResponse || [];
              itemsToUse = [
                { value: "", label: "Select an item" },
                ...itemsData.map((item) => ({
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
              const uomsData = uomsResponse || [];
              uomsToUse = [
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
                    String(
                      uom.UOMDescription || uom.Description || "Unknown UOM"
                    ),
                })),
              ];
            } catch (err) {
              console.error("Failed to fetch UOMs directly:", err);
            }
          }

          const formattedParcels = filteredParcels.map((parcel, index) => {
            let itemName = "Unknown Item";
            let uomName = "Unknown UOM";

            try {
              const itemId = String(parcel.ItemID || "");
              const uomId = String(parcel.UOMID || "");

              const item = itemsToUse.find((i) => i.value === itemId);
              if (item) {
                itemName = item.label;
              } else {
                itemName = `Item #${itemId}`;
              }

              const uom = uomsToUse.find((u) => u.value === uomId);
              if (uom) {
                uomName = uom.label;
              } else {
                uomName = `UOM #${uomId}`;
              }
            } catch (err) {
              console.error("Error formatting parcel data:", err);
            }

            // Add index+1 as srNo for proper numbering
            return {
              id: parcel.SalesRFQParcelID || parcel.id || Date.now() + index,
              itemId: String(parcel.ItemID || ""),
              uomId: String(parcel.UOMID || ""),
              quantity: String(parcel.ItemQuantity || parcel.Quantity || "0"),
              itemName,
              uomName,
              srNo: index + 1, 
            };
          });

          setParcels(formattedParcels);
        } else {
          console.warn("No parcel data found in response");
          setParcels([]);
        }
      } catch (error) {
        console.error("Error loading existing parcels:", error);
        setParcels([]);
      } finally {
        setLoadingExistingParcels(false);
      }
    };

    setParcels([]);

    loadExistingParcels();
  }, [salesRFQId, items, uoms]);

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
        itemId: parcelToEdit.itemId,
        uomId: parcelToEdit.uomId,
        quantity: parcelToEdit.quantity,
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

    // Get item and UOM names for display
    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);

    // Find the original parcel if we're editing
    const originalParcel =
      form.editIndex !== undefined ? parcels[form.editIndex] : null;

    // Create a completely new parcel object with all required fields
    const newParcel = {
      // Keep original ID and SalesRFQParcelID for database reference
      id: form.originalId || form.id,
      SalesRFQParcelID: originalParcel?.SalesRFQParcelID || originalParcel?.id,

      // Ensure SalesRFQID is included for proper association
      SalesRFQID: salesRFQId,

      // Include all possible field name variations for maximum compatibility
      ItemID: parseInt(form.itemId, 10), // Convert to number for backend
      itemId: form.itemId,

      UOMID: parseInt(form.uomId, 10), // Convert to number for backend
      uomId: form.uomId,

      ItemQuantity: parseInt(form.quantity, 10), // Convert to number for backend
      Quantity: parseInt(form.quantity, 10), // Convert to number for backend
      quantity: form.quantity,

      // Display values for UI
      itemName: selectedItem ? selectedItem.label : "Unknown Item",
      uomName: selectedUOM ? selectedUOM.label : "Unknown UOM",

      // Preserve srNo
      srNo: originalParcel?.srNo || parcels.length + 1,

      // Add a flag to indicate this record has been modified
      isModified: true,

      // Add any other fields that might be required by the backend
      SalesRFQParcel: {
        SalesRFQParcelID:
          originalParcel?.SalesRFQParcelID || originalParcel?.id,
        SalesRFQID: salesRFQId,
        ItemID: parseInt(form.itemId, 10),
        UOMID: parseInt(form.uomId, 10),
        ItemQuantity: parseInt(form.quantity, 10),
      },
    };

    if (form.editIndex !== undefined) {
      // Update existing parcel - create a completely new array
      const updatedParcels = [...parcels];
      updatedParcels[form.editIndex] = newParcel;
      setParcels(updatedParcels);

      // Force a notification to the parent component
      if (onParcelsChange) {
        setTimeout(() => onParcelsChange(updatedParcels), 0);

        // Also try to directly update the database
        try {
          updateParcelInDatabase(newParcel);
        } catch (error) {
          console.error("Error directly updating parcel:", error);
        }
      }
    } else {
      // Add new parcel
      const newParcelsArray = [...parcels, newParcel];
      setParcels(newParcelsArray);

      // Force a notification to the parent component
      if (onParcelsChange) {
        setTimeout(() => onParcelsChange(newParcelsArray), 0);
      }
    }

    // Remove the form
    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
  };

  // Function to directly update a parcel in the database
  const updateParcelInDatabase = async (parcel) => {
    if (!salesRFQId || !parcel.SalesRFQParcelID) {
      console.error("Missing required IDs for direct parcel update");
      return;
    }

    try {
      // Try to update using the SalesRFQParcel endpoint
      const response = await axios.put(
        `${APIBASEURL}/sales-rfq-parcels/${parcel.SalesRFQParcelID}`,
        {
          SalesRFQID: salesRFQId,
          ItemID: parseInt(parcel.ItemID, 10),
          UOMID: parseInt(parcel.UOMID, 10),
          ItemQuantity: parseInt(parcel.ItemQuantity, 10),
        }
      );

      if (response.data.success) {
        toast.success("Parcel updated successfully");
      }
    } catch (error) {
      console.error("Failed to directly update parcel:", error);
      // Try alternative endpoint
      try {
        const altResponse = await axios.put(
          `${APIBASEURL}/sales-rfq/${salesRFQId}/parcels/${parcel.SalesRFQParcelID}`,
          {
            ItemID: parseInt(parcel.ItemID, 10),
            UOMID: parseInt(parcel.UOMID, 10),
            ItemQuantity: parseInt(parcel.ItemQuantity, 10),
          }
        );
      } catch (altError) {
        console.error("Failed alternative direct update:", altError);
      }
    }
  };

  // Handle deleting a parcel
  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setParcels((prev) => prev.filter((p) => p.id !== deleteParcelId));
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
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
            Parcels
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
                  No parcels added yet.{" "}
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
