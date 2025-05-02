import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";
import {
  createPurchaseRFQ,
  updatePurchaseRFQ,
  getPurchaseRFQById,
  fetchSalesRFQs
} from "./PurchaseRFQAPI";
import { toast } from "react-toastify";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";

const PurchaseRFQForm = ({ purchaseRFQId, onClose, onSave, readOnly = false }) => {
  const [formData, setFormData] = useState({
    SalesRFQID: "",
  });
  const [salesRFQs, setSalesRFQs] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);

  useEffect(() => {
    loadSalesRFQs();
    if (purchaseRFQId) {
      loadPurchaseRFQ();
    }
  }, [purchaseRFQId]);

  const loadSalesRFQs = async () => {
    try {
      setLoading(true);
      const data = await fetchSalesRFQs();
      
      const salesRFQOptions = [
        { value: "", label: "Select a Sales RFQ" },
        ...data.map((rfq) => ({
          value: String(rfq.SalesRFQID),
          label: rfq.Series || `RFQ #${rfq.SalesRFQID}`
        }))
      ];
      
      setSalesRFQs(salesRFQOptions);
    } catch (error) {
      console.error("Error loading Sales RFQs:", error);
      toast.error("Failed to load Sales RFQs");
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseRFQ = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseRFQById(purchaseRFQId);
      
      if (response.success && response.data) {
        setFormData({
          SalesRFQID: String(response.data.SalesRFQID) || "",
        });
      }
    } catch (error) {
      console.error("Error loading Purchase RFQ:", error);
      toast.error("Failed to load Purchase RFQ details");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.SalesRFQID) {
      newErrors.SalesRFQID = "Sales RFQ is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (purchaseRFQId) {
        await updatePurchaseRFQ(purchaseRFQId, formData);
        toast.success("Purchase RFQ updated successfully");
      } else {
        await createPurchaseRFQ(formData);
        toast.success("Purchase RFQ created successfully");
      }
      
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error("Error saving Purchase RFQ:", error);
      toast.error(`Failed to save Purchase RFQ: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <FormPage
      title={purchaseRFQId ? "Edit Purchase RFQ" : "Create Purchase RFQ"}
      isLoading={loading}
      onSave={handleSubmit}
      onCancel={onClose}
      readOnly={readOnly}
      onEdit={() => setIsEditing(true)}
      isEditing={isEditing}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormSelect
            name="SalesRFQID"
            label="Sales RFQ"
            value={formData.SalesRFQID}
            onChange={handleChange}
            options={salesRFQs}
            error={!!errors.SalesRFQID}
            helperText={errors.SalesRFQID}
            disabled={loading || readOnly || !isEditing}
            required
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default PurchaseRFQForm;