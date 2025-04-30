import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../Common/DataTable";
import FormSelect from "../../Common/FormSelect";
import FormInput from "../../Common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const API_URL = "http://localhost:7000/api";

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// Function to fetch UOMs from API
const fetchUOMs = async () => {
  try {
    const response = await axios.get(`${API_URL}/uoms`);
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

  // Notify parent component when parcels change
  useEffect(() => {
    if (onParcelsChange) {
      onParcelsChange(parcels);
    }
  }, [parcels, onParcelsChange]);

  // Define columns for DataTable
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    // Only show actions column if not in readOnly mode
    ...(readOnly ? [] : [
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => handleEditParcel(params.row.id)}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteParcel(params.row.id)}
            >
              Delete
            </Button>
          </Box>
        ),
      }
    ]),
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
      if (!salesRFQId) return;
      
      try {
        setLoadingExistingParcels(true);
        console.log("Attempting to load parcels for SalesRFQ ID:", salesRFQId);
        
        // Try different endpoint formats that might be available
        let response;
        try {
          // First try the direct endpoint
          response = await axios.get(`${API_URL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`);
        } catch (err) {
          console.log("First endpoint attempt failed, trying alternative...");
          try {
            // Try alternative endpoint format
            response = await axios.get(`${API_URL}/sales-rfq/${salesRFQId}/parcels`);
          } catch (err2) {
            console.log("Second endpoint attempt failed, trying final alternative...");
            // Try one more format
            response = await axios.get(`${API_URL}/sales-rfq-parcels/salesrfq/${salesRFQId}`);
          }
        }
        
        if (response && response.data) {
          let parcelData = [];
          
          // Handle different response formats
          if (response.data.data && Array.isArray(response.data.data)) {
            parcelData = response.data.data;
          } else if (Array.isArray(response.data)) {
            parcelData = response.data;
          } else if (response.data.parcels && Array.isArray(response.data.parcels)) {
            parcelData = response.data.parcels;
          }
          
          console.log("Received parcel data:", parcelData);
          
          // Format the parcels data for our component
          const formattedParcels = parcelData.map(parcel => {
            // Get item and UOM details
            let itemName = "Unknown Item";
            let uomName = "Unknown UOM";
            
            try {
              // Try to find item name from our items list
              const item = items.find(i => i.value === String(parcel.ItemID));
              if (item) {
                itemName = item.label;
              }
              
              // Try to find UOM name from our UOMs list
              const uom = uoms.find(u => u.value === String(parcel.UOMID));
              if (uom) {
                uomName = uom.label;
              }
            } catch (err) {
              console.error("Error formatting parcel data:", err);
            }
            
            return {
              id: parcel.SalesRFQParcelID || parcel.id || Date.now(),
              itemId: String(parcel.ItemID),
              uomId: String(parcel.UOMID),
              quantity: String(parcel.ItemQuantity || parcel.Quantity),
              itemName,
              uomName
            };
          });
          
          setParcels(formattedParcels);
          console.log("Loaded existing parcels:", formattedParcels);
        } else {
          console.warn("No parcel data found in response");
        }
      } catch (error) {
        console.error("Error loading existing parcels:", error);
        console.log("This might be a new record without parcels yet");
      } finally {
        setLoadingExistingParcels(false);
      }
    };
    
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
    if (!parcelToEdit) return;

    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: parcelToEdit.itemId,
        uomId: parcelToEdit.uomId,
        quantity: parcelToEdit.quantity,
        editIndex: parcels.findIndex((p) => p.id === id),
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

    const newParcel = {
      id: form.editIndex !== undefined ? parcels[form.editIndex].id : formId,
      itemId: form.itemId,
      uomId: form.uomId,
      quantity: form.quantity,
      itemName: selectedItem ? selectedItem.label : "Unknown Item",
      uomName: selectedUOM ? selectedUOM.label : "Unknown UOM",
    };

    if (form.editIndex !== undefined) {
      // Update existing parcel
      setParcels((prev) =>
        prev.map((p, index) => (index === form.editIndex ? newParcel : p))
      );
    } else {
      // Add new parcel
      setParcels((prev) => [...prev, newParcel]);
    }

    // Remove the form
    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
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
    <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Parcels
      </Typography>

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

          {/* Display parcels in DataTable */}
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
          />

          {/* Parcel forms */}
          {parcelForms.map((form) => (
            <Box
              key={form.id}
              sx={{
                mt: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {form.editIndex !== undefined ? "Edit Parcel" : "New Parcel"}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
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
                
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
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
                
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
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
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this parcel? This action cannot be undone.
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
