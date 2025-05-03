import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import axios from "axios";
import {
  createSalesRFQ,
  updateSalesRFQ,
  getSalesRFQById,
  fetchCompanies,
  fetchCustomers,
  fetchSuppliers,
  fetchServiceTypes,
  fetchAddresses,
  fetchMailingPriorities,
  fetchCurrencies,
} from "./SalesRFQAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";
import ParcelTab from "./ParcelTab";

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

const SalesRFQForm = ({ salesRFQId, onClose, onSave, readOnly = false }) => {
  const DEFAULT_COMPANY = { value: 1, label: "Dung Beetle Company" };

  const [formData, setFormData] = useState({
    Series: "",
    CompanyID: DEFAULT_COMPANY.value,
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
    CreatedByID: "",
    CreatedDateTime: null,
    IsDeleted: false,
    DeletedDateTime: null,
    DeletedByID: "",
    RowVersionColumn: "",
  });
  // Fix the state variable name - use camelCase consistently
  const [parcels, setParcels] = useState([]);
  const [isApproved, setIsApproved] = useState(false); // Replace checkApprovalStatus with isApproved
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [mailingPriorities, setMailingPriorities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Change this line to make the form editable when opened for editing
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  // const [loadSalesRFQ, setLoadSalesRFQ] = useState([]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [
          companiesData,
          customersData,
          suppliersData,
          serviceTypesData,
          addressesData,
          prioritiesData,
          currenciesData,
        ] = await Promise.all([
          fetchCompanies().catch((err) => {
            console.error("Failed to fetch companies:", err);
            toast.error("Failed to load companies");
            return [];
          }),
          fetchCustomers().catch((err) => {
            console.error("Failed to fetch customers:", err);
            toast.error("Failed to load customers");
            return [];
          }),
          fetchSuppliers().catch((err) => {
            console.error("Failed to fetch suppliers:", err);
            toast.error("Failed to load suppliers");
            return [];
          }),
          fetchServiceTypes().catch((err) => {
            console.error("Failed to fetch service types:", err);
            toast.error("Failed to load service types");
            return [];
          }),
          fetchAddresses().catch((err) => {
            console.error("Failed to fetch addresses:", err);
            toast.error("Failed to load addresses");
            return [];
          }),
          fetchMailingPriorities().catch((err) => {
            console.error("Failed to fetch mailing priorities:", err);
            toast.error("Failed to load mailing priorities");
            return [];
          }),
          fetchCurrencies().catch((err) => {
            console.error("Failed to fetch currencies:", err);
            toast.error("Failed to load currencies");
            return [];
          }),
        ]);

        const companiesOptions = [
          { value: "", label: "Select an option" },
          ...companiesData.map((company) => ({
            value: String(company.CompanyID),
            label: company.CompanyName,
          })),
        ];
        const customersOptions = [
          { value: "", label: "Select an option" },
          ...customersData.map((customer) => ({
            value: String(customer.CustomerID),
            label: customer.CustomerName,
          })),
        ];
        const suppliersOptions = [
          { value: "", label: "Select an option" },
          ...suppliersData.map((supplier) => ({
            value: String(supplier.SupplierID),
            label: supplier.SupplierName,
          })),
        ];
        const serviceTypesOptions = [
          { value: "", label: "Select an option" },
          ...serviceTypesData.map((type) => ({
            value: String(type.ServiceTypeID),
            label:
              type.ServiceType ||
              type.ServiceTypeName ||
              "Unknown Service Type",
          })),
        ];
        const addressesOptions = [
          { value: "", label: "Select an option" },
          ...addressesData.map((address) => ({
            value: String(address.AddressID),
            label: `${address.AddressLine1}, ${address.City}, ${address.PostCode}`,
          })),
        ];
        const prioritiesOptions = [
          { value: "", label: "Select an option" },
          ...prioritiesData.map((priority) => ({
            value: String(priority.MailingPriorityID),
            label:
              priority.PriorityName ||
              priority.MailingPriorityName ||
              "Unknown Priority",
          })),
        ];
        const currenciesOptions = [
          { value: "", label: "Select an option" },
          ...currenciesData.map((currency) => ({
            value: String(currency.CurrencyID),
            label: currency.CurrencyName,
          })),
        ];

        setCompanies(companiesOptions);
        setCustomers(customersOptions);
        setSuppliers(suppliersOptions);
        setServiceTypes(serviceTypesOptions);
        setAddresses(addressesOptions);
        setMailingPriorities(prioritiesOptions);
        setCurrencies(currenciesOptions);

        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Error in loadDropdownData:", error);
        toast.error("Failed to load form data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  useEffect(() => {
    if (salesRFQId && dropdownsLoaded) {
      loadSalesRFQ();
      checkApprovalStatus(); // Now this will call the function, not the state
    }
  }, [salesRFQId, dropdownsLoaded]);

  // Add the loadSalesRFQ function
  const loadSalesRFQ = async () => {
    try {
      setLoading(true);
      const data = await getSalesRFQById(salesRFQId);
      console.log("Raw SalesRFQ data:", data);

      // Format dates from string to Date objects
      const formattedData = {
        ...data,
        DeliveryDate: data.DeliveryDate ? new Date(data.DeliveryDate) : null,
        PostingDate: data.PostingDate ? new Date(data.PostingDate) : null,
        RequiredByDate: data.RequiredByDate ? new Date(data.RequiredByDate) : null,
        DateReceived: data.DateReceived ? new Date(data.DateReceived) : null,
        // Convert numeric boolean values to actual booleans
        CollectFromSupplierYN: !!data.CollectFromSupplierYN,
        PackagingRequiredYN: !!data.PackagingRequiredYN,
        FormCompletedYN: !!data.FormCompletedYN,
      };

      setFormData(formattedData);
      
      // If there are parcels in the response, set them
      if (data.parcels && Array.isArray(data.parcels)) {
        setParcels(data.parcels);
      }
    } catch (error) {
      console.error("Error loading SalesRFQ:", error);
      toast.error("Failed to load SalesRFQ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a proper function to check approval status
  const checkApprovalStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/sales-rfq-approvals?salesRFQID=${salesRFQId}`
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // Check if any approval has ApprovedYN = 1 (approved)
        const hasApproval = response.data.data.some(approval => {
          const approvedValue =
            approval.ApprovedYN === 1 ||
            approval.ApprovedYN === true ||
            approval.ApprovedYN === "1" ||
            approval.ApprovedYN === "true";
          return approvedValue;
        });
        
        setIsApproved(hasApproval);
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
    }
  };

  // Add a function to handle creating a Purchase RFQ
  const handleCreatePurchaseRFQ = () => {
    // Navigate to create Purchase RFQ page with SalesRFQ data
    toast.info("Creating Purchase RFQ from Sales RFQ...");
    // Implement the actual navigation or API call here
  };

  // Add the validateForm function before handleSubmit
  const validateForm = () => {
    const newErrors = {};

    // Only validate Series if editing an existing record
    if (
      salesRFQId &&
      formData.Series &&
      (!formData.Series.trim() || formData.Series === "-")
    ) {
      newErrors.Series = "Series is required";
    }
    if (!formData.CompanyID) {
      newErrors.CompanyID = "Company is required";
    }
    if (!formData.CustomerID) {
      newErrors.CustomerID = "Customer is required";
    }
    if (!formData.SupplierID) {
      newErrors.SupplierID = "Supplier is required";
    }
    if (!formData.ServiceTypeID) {
      newErrors.ServiceTypeID = "Service Type is required";
    }
    if (!formData.CollectionAddressID) {
      newErrors.CollectionAddressID = "Collection Address is required";
    }
    if (!formData.DestinationAddressID) {
      newErrors.DestinationAddressID = "Destination Address is required";
    }
    if (!formData.ShippingPriorityID) {
      newErrors.ShippingPriorityID = "Shipping Priority is required";
    }
    if (!formData.CurrencyID) {
      newErrors.CurrencyID = "Currency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the handleSubmit function to ensure proper redirection
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      const apiData = {
        ...formData,
        Series: formData.Series === "-" ? null : formData.Series,
        ExternalRefNo:
          formData.ExternalRefNo === "-" ? null : formData.ExternalRefNo,
        Terms: formData.Terms === "-" ? null : formData.Terms,
        CreatedByID: formData.CreatedByID === "-" ? null : formData.CreatedByID,
        DeletedByID: formData.DeletedByID === "-" ? null : formData.DeletedByID,
        RowVersionColumn:
          formData.RowVersionColumn === "-" ? null : formData.RowVersionColumn,
        DeliveryDate: formData.DeliveryDate
          ? formData.DeliveryDate.toISOString()
          : null,
        PostingDate: formData.PostingDate
          ? formData.PostingDate.toISOString()
          : null,
        RequiredByDate: formData.RequiredByDate
          ? formData.RequiredByDate.toISOString()
          : null,
        DateReceived: formData.DateReceived
          ? formData.DateReceived.toISOString()
          : null,
        // Ensure boolean values are sent as 1/0 for the API
        CollectFromSupplierYN: formData.CollectFromSupplierYN ? 1 : 0,
        PackagingRequiredYN: formData.PackagingRequiredYN ? 1 : 0,
        FormCompletedYN: formData.FormCompletedYN ? 1 : 0,
        // Add parcels data to the API request
        parcels: parcels,
      };

      console.log("Submitting with parcels data:", parcels);

      if (salesRFQId) {
        // Update existing SalesRFQ
        await updateSalesRFQ(salesRFQId, apiData);
        toast.success("SalesRFQ updated successfully");
      } else {
        // Create new SalesRFQ
        const result = await createSalesRFQ(apiData);
        toast.success("SalesRFQ created successfully");
      }

      // Ensure we call onSave and onClose to redirect back to the list
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(
        `Failed to ${salesRFQId ? "update" : "create"} SalesRFQ: ` +
          (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Add a handler for parcels changes
  const handleParcelsChange = (newParcels) => {
    setParcels(newParcels);
  };

  // Update the FormPage component to add proper spacing
  return (
    <FormPage
      title={
        salesRFQId
          ? isEditing
            ? "Edit Sales RFQ"
            : "View Sales RFQ"
          : "Create Sales RFQ"
      }
      onCancel={onClose}
      onSubmit={isEditing ? handleSubmit : null}
      loading={loading}
      readOnly={!isEditing}
      onEdit={salesRFQId && !isEditing ? toggleEdit : null}
      additionalButtons={
        isApproved && salesRFQId ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCreatePurchaseRFQ}
            sx={{ mr: 1 }}
          >
            Create Purchase RFQ
          </Button>
        ) : null
      }
    >
      <Grid
        container
        spacing={1}
        sx={{
          width: "100%",
          margin: 0,
          overflow: "hidden",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Only show Series field when editing an existing record */}
        {salesRFQId && (
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            {isEditing ? (
              <FormInput
                name="Series"
                label="Series"
                value={formData.Series || ""}
                onChange={handleChange}
                error={!!errors.Series}
                helperText={errors.Series}
                disabled={true}
              />
            ) : (
              <ReadOnlyField label="Series" value={formData.Series} />
            )}
          </Grid>
        )}

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="CompanyID"
              label="Company"
              value={formData.CompanyID || ""}
              onChange={() => {}}
              options={[DEFAULT_COMPANY]}
              disabled={true}
              readOnly={true}
            />
          ) : (
            <ReadOnlyField label="Company" value={DEFAULT_COMPANY.label} />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="CustomerID"
              label="Customer"
              value={formData.CustomerID || ""}
              onChange={handleChange}
              options={customers}
              error={!!errors.CustomerID}
              helperText={errors.CustomerID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Customer"
              value={
                customers.find((c) => c.value === formData.CustomerID)?.label ||
                "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="SupplierID"
              label="Supplier"
              value={formData.SupplierID || ""}
              onChange={handleChange}
              options={suppliers}
              error={!!errors.SupplierID}
              helperText={errors.SupplierID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Supplier"
              value={
                suppliers.find((s) => s.value === formData.SupplierID)?.label ||
                "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormInput
              name="ExternalRefNo"
              label="External Ref No."
              value={formData.ExternalRefNo || ""}
              onChange={handleChange}
              error={!!errors.ExternalRefNo}
              helperText={errors.ExternalRefNo}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="External Ref No."
              value={formData.ExternalRefNo}
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormDatePicker
              name="DeliveryDate"
              label="Delivery Date"
              value={formData.DeliveryDate}
              onChange={(date) => handleDateChange("DeliveryDate", date)}
              error={!!errors.DeliveryDate}
              helperText={errors.DeliveryDate}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Delivery Date"
              value={
                formData.DeliveryDate
                  ? formData.DeliveryDate.toLocaleDateString()
                  : "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormDatePicker
              name="PostingDate"
              label="Posting Date"
              value={formData.PostingDate}
              onChange={(date) => handleDateChange("PostingDate", date)}
              error={!!errors.PostingDate}
              helperText={errors.PostingDate}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Posting Date"
              value={
                formData.PostingDate
                  ? formData.PostingDate.toLocaleDateString()
                  : "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormDatePicker
              name="RequiredByDate"
              label="Required By Date"
              value={formData.RequiredByDate}
              onChange={(date) => handleDateChange("RequiredByDate", date)}
              error={!!errors.RequiredByDate}
              helperText={errors.RequiredByDate}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Required By Date"
              value={
                formData.RequiredByDate
                  ? formData.RequiredByDate.toLocaleDateString()
                  : "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormDatePicker
              name="DateReceived"
              label="Date Received"
              value={formData.DateReceived}
              onChange={(date) => handleDateChange("DateReceived", date)}
              error={!!errors.DateReceived}
              helperText={errors.DateReceived}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Date Received"
              value={
                formData.DateReceived
                  ? formData.DateReceived.toLocaleDateString()
                  : "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="ServiceTypeID"
              label="Service Type"
              value={formData.ServiceTypeID || ""}
              onChange={handleChange}
              options={serviceTypes}
              error={!!errors.ServiceTypeID}
              helperText={errors.ServiceTypeID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Service Type"
              value={
                serviceTypes.find((st) => st.value === formData.ServiceTypeID)
                  ?.label || "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="CollectionAddressID"
              label="Collection Address"
              value={formData.CollectionAddressID || ""}
              onChange={handleChange}
              options={addresses}
              error={!!errors.CollectionAddressID}
              helperText={errors.CollectionAddressID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Collection Address"
              value={
                addresses.find((a) => a.value === formData.CollectionAddressID)
                  ?.label || "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="DestinationAddressID"
              label="Destination Address"
              value={formData.DestinationAddressID || ""}
              onChange={handleChange}
              options={addresses}
              error={!!errors.DestinationAddressID}
              helperText={errors.DestinationAddressID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Destination Address"
              value={
                addresses.find((a) => a.value === formData.DestinationAddressID)
                  ?.label || "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="ShippingPriorityID"
              label="Shipping Priority"
              value={formData.ShippingPriorityID || ""}
              onChange={handleChange}
              options={mailingPriorities}
              error={!!errors.ShippingPriorityID}
              helperText={errors.ShippingPriorityID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Shipping Priority"
              value={
                mailingPriorities.find(
                  (p) => p.value === formData.ShippingPriorityID
                )?.label || "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormInput
              name="Terms"
              label="Terms"
              value={formData.Terms || ""}
              onChange={handleChange}
              error={!!errors.Terms}
              helperText={errors.Terms}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField label="Terms" value={formData.Terms} />
          )}
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          {isEditing ? (
            <FormSelect
              name="CurrencyID"
              label="Currency"
              value={formData.CurrencyID || ""}
              onChange={handleChange}
              options={currencies}
              error={!!errors.CurrencyID}
              helperText={errors.CurrencyID}
              disabled={!isEditing}
            />
          ) : (
            <ReadOnlyField
              label="Currency"
              value={
                currencies.find(
                  (c) => String(c.value) === String(formData.CurrencyID)
                )?.label || "-"
              }
            />
          )}
        </Grid>

        <Grid item xs={12} sx={{ width: "100%" }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={3} sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="CollectFromSupplierYN"
                      checked={formData.CollectFromSupplierYN}
                      onChange={handleCheckboxChange("CollectFromSupplierYN")}
                      disabled={!isEditing}
                    />
                  }
                  label="Collect From Supplier"
                />
              ) : (
                <ReadOnlyField
                  label="Collect From Supplier"
                  value={formData.CollectFromSupplierYN ? "Yes" : "No"}
                />
              )}
            </Grid>
            <Grid item xs={12} md={3} sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="PackagingRequiredYN"
                      checked={formData.PackagingRequiredYN}
                      onChange={handleCheckboxChange("PackagingRequiredYN")}
                      disabled={!isEditing}
                    />
                  }
                  label="Packaging Required"
                />
              ) : (
                <ReadOnlyField
                  label="Packaging Required"
                  value={formData.PackagingRequiredYN ? "Yes" : "No"}
                />
              )}
            </Grid>
            <Grid item xs={12} md={3} sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="FormCompletedYN"
                      checked={formData.FormCompletedYN}
                      onChange={handleCheckboxChange("FormCompletedYN")}
                      disabled={!isEditing}
                    />
                  }
                  label="Form Completed"
                />
              ) : (
                <ReadOnlyField
                  label="Form Completed"
                  value={formData.FormCompletedYN ? "Yes" : "No"}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ParcelTab
        salesRFQId={salesRFQId}
        onParcelsChange={handleParcelsChange}
        readOnly={!isEditing}
      />
    </FormPage>
  );
};

export default SalesRFQForm;
