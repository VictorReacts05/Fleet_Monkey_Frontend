import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { createWarehouse, updateWarehouse, fetchWarehouses } from "./WarehouseAPI";
import { toast } from "react-toastify";

const WarehouseForm = ({ warehouseId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    warehouseName: "",
  });

  const [errors, setErrors] = useState({
    warehouseName: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (warehouseId) {
      loadWarehouse();
    }
  }, [warehouseId]);

  const loadWarehouse = async () => {
    try {
      setLoading(true);
      // Since there's no direct getWarehouseById, we'll fetch all and filter
      const response = await fetchWarehouses(1, 100);
      const warehouses = response.data || [];
      const warehouse = warehouses.find(w => w.WarehouseID === warehouseId);
      
      if (warehouse) {
        setFormData({
          warehouseName: warehouse.WarehouseName || '',
        });
      }
    } catch (error) {
      console.error('Error loading warehouse:', error);
      toast.error('Failed to load warehouse details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Warehouse Name validation
    if (!formData.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse name is required";
      isValid = false;
    } else if (formData.warehouseName.length < 2) {
      newErrors.warehouseName = "Warehouse name must be at least 2 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);
        
        const warehouseData = {
          WarehouseName: formData.warehouseName
        };
        
        if (warehouseId) {
          // Update existing warehouse
          await updateWarehouse(warehouseId, warehouseData);
          // toast.success("Warehouse updated successfully");
          showToast("Warehouse updated successfully", "success");
        } else {
          // Create new warehouse
          await createWarehouse(warehouseData);
          // toast.success("Warehouse created successfully");
          showToast("Warehouse created successfully", "success");
        }
        
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error('Error saving warehouse:', error);
        toast.error(`Failed to save warehouse: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (isSubmitted) {
      validateForm();
    }
  };

  return (
    <FormPage
      title={warehouseId ? "Edit Warehouse" : "Add Warehouse"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Warehouse Name"
        name="warehouseName"
        value={formData.warehouseName}
        onChange={handleChange}
        error={errors.warehouseName}
        
      />
    </FormPage>
  );
};

export default WarehouseForm;
