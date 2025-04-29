import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../Common/DataTable";
import FormSelect from "../../Common/FormSelect";
import FormInput from "../../Common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";

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

const ParcelTab = ({ salesRFQId }) => {
  const [parcels, setParcels] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleAddParcel = () => {
    setParcelForms([
      ...parcelForms,
      {
        id: Date.now(),
        itemId: "",
        uomId: "",
        quantity: "",
      },
    ]);
  };

  const handleEditParcel = (id) => {
    const index = parcels.findIndex((parcel) => parcel.id === id);
    const parcel = parcels[index];
    setParcelForms([
      ...parcelForms,
      {
        id: Date.now(),
        itemId: parcel.itemId,
        uomId: parcel.uomId,
        quantity: parcel.quantity,
        editIndex: index,
      },
    ]);
  };

  const handleDeleteParcel = (id) => {
    const index = parcels.findIndex((parcel) => parcel.id === id);
    const updatedParcels = [...parcels];
    updatedParcels.splice(index, 1);
    setParcels(updatedParcels);
    toast.success("Parcel removed");
  };

  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setParcelForms((prevForms) =>
      prevForms.map((form) =>
        form.id === formId ? { ...form, [name]: value } : form
      )
    );
  };

  const validateForm = (form) => {
    const newErrors = {};

    if (!form.itemId) {
      newErrors.itemId = "Item is required";
    }

    if (!form.uomId) {
      newErrors.uomId = "UOM is required";
    }

    if (!form.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(form.quantity) || Number(form.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a positive number";
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSave = (formId) => {
    const formIndex = parcelForms.findIndex((form) => form.id === formId);
    if (formIndex === -1) return;

    const form = parcelForms[formIndex];
    const { isValid, errors: formErrors } = validateForm(form);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, [formId]: formErrors }));
      toast.error("Please fix the form errors");
      return;
    }

    const itemName =
      items.find((item) => item.value === form.itemId)?.label || "";
    const uomName = uoms.find((uom) => uom.value === form.uomId)?.label || "";

    const newParcel = {
      id:
        form.editIndex !== undefined ? parcels[form.editIndex].id : Date.now(),
      itemId: form.itemId,
      uomId: form.uomId,
      quantity: form.quantity,
      itemName,
      uomName,
    };

    if (form.editIndex !== undefined) {
      const updatedParcels = [...parcels];
      updatedParcels[form.editIndex] = newParcel;
      setParcels(updatedParcels);
      toast.success("Parcel updated");
    } else {
      setParcels([...parcels, newParcel]);
      toast.success("Parcel added");
    }

    setParcelForms((prevForms) => prevForms.filter((f) => f.id !== formId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[formId];
      return newErrors;
    });
  };

  const handleCancel = (formId) => {
    setParcelForms((prevForms) => prevForms.filter((f) => f.id !== formId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[formId];
      return newErrors;
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Tab-style header */}
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box
          sx={{
            py: 1.5,
            px: 3,
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            borderTop: "1px solid #ccc",
            borderLeft: "1px solid #ccc",
            borderRight: "1px solid #ccc",
            fontWeight: "medium",
          }}
        >
          <Typography variant="subtitle1" component="span">
            Parcels
          </Typography>
        </Box>
      </Box>

      {/* Content area with border */}
      <Box
        sx={{
          border: "1px solid #ccc",
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "8px",
          borderBottomRightRadius: "8px",
          borderBottomLeftRadius: "8px",
          padding: "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          mb: 4,
        }}
      >
        {/* Add Parcel button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddParcel}
            sx={{
              "&:hover": {
                backgroundColor: "#0056b3",
              },
            }}
          >
            Add Parcel
          </Button>
        </Box>

        {/* Render parcel forms */}
        {parcelForms.map((form) => (
          <Box
            key={form.id}
            sx={{
              mb: 3,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {form.editIndex !== undefined ? "Edit Parcel" : "Add New Parcel"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: 1, minWidth: "250px" }}>
                <FormSelect
                  fullWidth
                  name="itemId"
                  label="Item Name"
                  value={form.itemId}
                  onChange={(e) => handleChange(e, form.id)}
                  options={items}
                  error={!!errors[form.id]?.itemId}
                  helperText={errors[form.id]?.itemId}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: "250px" }}>
                <FormSelect
                  fullWidth
                  name="uomId"
                  label="UOM"
                  value={form.uomId}
                  onChange={(e) => handleChange(e, form.id)}
                  options={uoms}
                  error={!!errors[form.id]?.uomId}
                  helperText={errors[form.id]?.uomId}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: "250px" }}>
                <FormInput
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  value={form.quantity}
                  onChange={(e) => handleChange(e, form.id)}
                  type="number"
                  inputProps={{ min: "0.01", step: "0.01" }}
                  error={!!errors[form.id]?.quantity}
                  helperText={errors[form.id]?.quantity}
                  disabled={loading}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleCancel(form.id)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSave(form.id)}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </Box>
          </Box>
        ))}

        {/* Parcel list using DataTable, rendered only when parcels exist */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : parcels.length > 0 ? (
          <DataTable
            columns={columns}
            rows={parcels}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onEdit={handleEditParcel}
            onDelete={handleDeleteParcel}
            totalRows={parcels.length}
            loading={loading}
            emptyMessage="No parcels added yet. Click 'Add Parcel' to get started."
          />
        ) : parcelForms.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3, color: "#666" }}>
            <Typography>
              No parcels added yet. Click "Add Parcel" to get started.
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default ParcelTab;
