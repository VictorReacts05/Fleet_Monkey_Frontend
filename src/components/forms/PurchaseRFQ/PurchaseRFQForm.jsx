// Update the PurchaseRFQForm component to load and display all details
import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {
  createPurchaseRFQ,
  updatePurchaseRFQ,
  getPurchaseRFQById,
  fetchSalesRFQs
} from "./PurchaseRFQAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";

const ReadOnlyField = ({ label, value }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
};

const PurchaseRFQForm = ({ purchaseRFQId, onClose, onSave, readOnly = false }) => {
  const [formData, setFormData] = useState({
    Series: "",
    SalesRFQID: "",
    CompanyID: "",
    CustomerID: "",
    SupplierID: "",
    ExternalRefNo: "",
    DeliveryDate: null,
    PostingDate: null,
    RequiredByDate: null,
    DateReceived: null,
    ServiceTypeID: "",
    CollectionAddressID: "",
    DestinationAddressID: "",
    ShippingPriorityID: "",
    Terms: "",
    CurrencyID: "",
    CollectFromSupplierYN: false,
    PackagingRequiredYN: false,
    FormCompletedYN: false,
  });
  
  const [salesRFQs, setSalesRFQs] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load sales RFQs for dropdown
        const salesRFQsData = await fetchSalesRFQs();
        const salesRFQOptions = salesRFQsData.map(rfq => ({
          value: rfq.id,
          label: `${rfq.series} - ${rfq.customerName}`
        }));
        setSalesRFQs(salesRFQOptions);

        // If editing existing purchase RFQ, load its data
        if (purchaseRFQId) {
          const purchaseRFQData = await getPurchaseRFQById(purchaseRFQId);
          if (purchaseRFQData) {
            setFormData({
              ...purchaseRFQData,
              DeliveryDate: purchaseRFQData.DeliveryDate ? new Date(purchaseRFQData.DeliveryDate) : null,
              PostingDate: purchaseRFQData.PostingDate ? new Date(purchaseRFQData.PostingDate) : null,
              RequiredByDate: purchaseRFQData.RequiredByDate ? new Date(purchaseRFQData.RequiredByDate) : null,
              DateReceived: purchaseRFQData.DateReceived ? new Date(purchaseRFQData.DateReceived) : null,
              CollectFromSupplierYN: Boolean(purchaseRFQData.CollectFromSupplierYN),
              PackagingRequiredYN: Boolean(purchaseRFQData.PackagingRequiredYN),
              FormCompletedYN: Boolean(purchaseRFQData.FormCompletedYN),
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [purchaseRFQId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const result = purchaseRFQId
        ? await updatePurchaseRFQ(purchaseRFQId, formData)
        : await createPurchaseRFQ(formData);
      
      if (result.success) {
        toast.success(`Purchase RFQ ${purchaseRFQId ? "updated" : "created"} successfully`);
        if (onSave) onSave(result.purchaseRFQId || result.data?.PurchaseRFQID);
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(typeof error === 'string' ? error : "Failed to save Purchase RFQ");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <FormPage
      title={`${purchaseRFQId ? (isEditing ? "Edit" : "View") : "Create"} Purchase RFQ ${formData.Series ? `- ${formData.Series}` : ""}`}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
      readOnly={!isEditing}
      onEdit={purchaseRFQId && !isEditing ? toggleEdit : null}
    >
      <Grid container spacing={2}>
        {isEditing ? (
          <>
            <Grid item xs={12} md={6}>
              <FormSelect
                name="SalesRFQID"
                label="Sales RFQ"
                value={formData.SalesRFQID}
                onChange={handleChange}
                options={salesRFQs}
                required
                disabled={!!purchaseRFQId}
                error={errors.SalesRFQID}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormInput
                name="Series"
                label="Series"
                value={formData.Series}
                onChange={handleChange}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDatePicker
                name="PostingDate"
                label="Posting Date"
                value={formData.PostingDate}
                onChange={(date) => handleDateChange("PostingDate", date)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDatePicker
                name="RequiredByDate"
                label="Required By Date"
                value={formData.RequiredByDate}
                onChange={(date) => handleDateChange("RequiredByDate", date)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDatePicker
                name="DeliveryDate"
                label="Delivery Date"
                value={formData.DeliveryDate}
                onChange={(date) => handleDateChange("DeliveryDate", date)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormInput
                name="ExternalRefNo"
                label="External Reference No"
                value={formData.ExternalRefNo}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormInput
                name="Terms"
                label="Terms"
                value={formData.Terms}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.CollectFromSupplierYN}
                    onChange={handleCheckboxChange}
                    name="CollectFromSupplierYN"
                  />
                }
                label="Collect From Supplier"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.PackagingRequiredYN}
                    onChange={handleCheckboxChange}
                    name="PackagingRequiredYN"
                  />
                }
                label="Packaging Required"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.FormCompletedYN}
                    onChange={handleCheckboxChange}
                    name="FormCompletedYN"
                  />
                }
                label="Form Completed"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <ReadOnlyField label="Series" value={formData.Series} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField label="Sales RFQ ID" value={formData.SalesRFQID} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Posting Date" 
                value={formData.PostingDate ? new Date(formData.PostingDate).toLocaleDateString() : "-"} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Required By Date" 
                value={formData.RequiredByDate ? new Date(formData.RequiredByDate).toLocaleDateString() : "-"} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Delivery Date" 
                value={formData.DeliveryDate ? new Date(formData.DeliveryDate).toLocaleDateString() : "-"} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField label="External Reference No" value={formData.ExternalRefNo} />
            </Grid>
            
            <Grid item xs={12}>
              <ReadOnlyField label="Terms" value={formData.Terms} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Collect From Supplier" 
                value={formData.CollectFromSupplierYN ? "Yes" : "No"} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Packaging Required" 
                value={formData.PackagingRequiredYN ? "Yes" : "No"} 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ReadOnlyField 
                label="Form Completed" 
                value={formData.FormCompletedYN ? "Yes" : "No"} 
              />
            </Grid>
          </>
        )}
      </Grid>
    </FormPage>
  );
};

export default PurchaseRFQForm;