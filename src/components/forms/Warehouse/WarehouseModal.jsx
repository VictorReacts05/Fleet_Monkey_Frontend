import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import FormInput from "../../Common/FormInput";
import {
  createWarehouse,
  updateWarehouse,
  fetchWarehouses,
  fetchAddresses,
} from "./WarehouseAPI";
import { toast } from "react-toastify";

const WarehouseModal = ({
  open,
  onClose,
  warehouseId,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    warehouseName: "",
    warehouseAddressId: "",
  });
  const [errors, setErrors] = useState({
    warehouseName: "",
    warehouseAddressId: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load addresses
        const addressResponse = await fetchAddresses();
        const addressData = Array.isArray(addressResponse.data)
          ? addressResponse.data
          : [addressResponse.data].filter(Boolean);
        setAddresses(addressData);

        // Load warehouse if editing
        if (warehouseId && initialData) {
          setFormData({
            warehouseName: initialData.warehouseName || "",
            warehouseAddressId: initialData.address?.AddressID || "",
          });
        } else {
          setFormData({
            warehouseName: "",
            warehouseAddressId: addressData[0]?.AddressID || "",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [warehouseId, open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "warehouseAddressId" ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prevState) => ({
        ...prevState,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse Name is required";
    } else if (formData.warehouseName.length < 3) {
      newErrors.warehouseName =
        "Warehouse Name must be at least 3 characters long";
    }

    if (!formData.warehouseAddressId) {
      newErrors.warehouseAddressId = "Please select an address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const personId = user?.personId || user?.id || user?.userId;

    if (!personId) {
      toast.error("You must be logged in to save a warehouse");
      return;
    }

    try {
      setLoading(true);
      const warehouseData = {
        warehouseName: formData.warehouseName,
        warehouseAddressId: formData.warehouseAddressId,
        createdById: Number(personId),
      };

      if (warehouseId) {
        await updateWarehouse(warehouseId, warehouseData);
        toast.success("Warehouse updated successfully");
      } else {
        await createWarehouse(warehouseData);
        toast.success("Warehouse created successfully");
      }

      setLoading(false);
      onClose();
      setTimeout(() => onSave(), 300);
    } catch (error) {
      console.error("Error saving warehouse:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      if (errorMessage.toLowerCase().includes("warehouse name")) {
        setErrors({ warehouseName: errorMessage });
      } else {
        toast.error("Failed to save warehouse: " + errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {warehouseId ? "Edit Warehouse" : "Add Warehouse"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormInput
              label="Warehouse Name"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              error={isSubmitted && !!errors.warehouseName}
              helperText={isSubmitted && errors.warehouseName}
            />
            <FormControl
              fullWidth
              sx={{ mt: 2 }}
              error={isSubmitted && !!errors.warehouseAddressId}
            >
              <InputLabel id="address-select-label">Address</InputLabel>
              <Select
                labelId="address-select-label"
                name="warehouseAddressId"
                value={formData.warehouseAddressId}
                onChange={handleChange}
                disabled={loading}
                label="Address"
              >
                {addresses.map((address) => (
                  <MenuItem key={address.AddressID} value={address.AddressID}>
                    {`${address.AddressName} - ${address.AddressLine1}, ${address.AddressLine2}`}
                  </MenuItem>
                ))}
              </Select>
              {isSubmitted && errors.warehouseAddressId && (
                <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                  {errors.warehouseAddressId}
                </Box>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {warehouseId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WarehouseModal;
