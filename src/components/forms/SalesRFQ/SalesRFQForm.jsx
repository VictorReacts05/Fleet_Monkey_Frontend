import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  approveSalesRFQ,
  fetchSalesRFQApprovalStatus,
} from "./SalesRFQAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";
import ParcelTab from "./ParcelTab";
import { createPurchaseRFQFromSalesRFQ } from "../PurchaseRFQ/PurchaseRFQAPI";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const DEFAULT_COMPANY = { value: 48, label: "Dung Beetle Logistics" };

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
  const [parcels, setParcels] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [mailingPriorities, setMailingPriorities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [purchaseRFQDialogOpen, setPurchaseRFQDialogOpen] = useState(false);
  const [creatingPurchaseRFQ, setCreatingPurchaseRFQ] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);

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

  const loadSalesRFQ = useCallback(async () => {
    try {
      const response = await getSalesRFQById(salesRFQId);
      const data = response.data;
      console.log("SalesRFQ data for ID", salesRFQId, ":", data);

      const displayValue = (value) =>
        value === null || value === undefined ? "-" : value;

      console.log("Raw SalesRFQ data:", data);

      const formattedData = {
        Series: displayValue(data.Series),
        CompanyID: DEFAULT_COMPANY.value,
        CustomerID: customers.find(
          (c) => String(c.value) === String(data.CustomerID)
        )
          ? String(data.CustomerID)
          : "",
        SupplierID: suppliers.find(
          (s) => String(s.value) === String(data.SupplierID)
        )
          ? String(data.SupplierID)
          : "",
        ExternalRefNo: displayValue(data.ExternalRefNo),
        DeliveryDate: data.DeliveryDate ? new Date(data.DeliveryDate) : null,
        PostingDate: data.PostingDate ? new Date(data.PostingDate) : null,
        RequiredByDate: data.RequiredByDate
          ? new Date(data.RequiredByDate)
          : null,
        DateReceived: data.DateReceived ? new Date(data.DateReceived) : null,
        ServiceTypeID: serviceTypes.find(
          (st) => String(st.value) === String(data.ServiceTypeID)
        )
          ? String(data.ServiceTypeID)
          : "",
        CollectionAddressID: addresses.find(
          (a) => String(a.value) === String(data.CollectionAddressID)
        )
          ? String(data.CollectionAddressID)
          : "",
        DestinationAddressID: addresses.find(
          (a) => String(a.value) === String(data.DestinationAddressID)
        )
          ? String(data.DestinationAddressID)
          : "",
        ShippingPriorityID: mailingPriorities.find(
          (p) => String(p.value) === String(data.ShippingPriorityID)
        )
          ? String(data.ShippingPriorityID)
          : "",
        Terms: displayValue(data.Terms),
        CurrencyID: String(data.CurrencyID) || "",
        CollectFromSupplierYN: Boolean(data.CollectFromSupplierYN),
        PackagingRequiredYN: Boolean(data.PackagingRequiredYN),
        FormCompletedYN: Boolean(data.FormCompletedYN),
        CreatedByID: displayValue(data.CreatedByID),
        CreatedDateTime: data.CreatedDateTime
          ? new Date(data.CreatedDateTime)
          : null,
        IsDeleted: data.IsDeleted || false,
        DeletedDateTime: data.DeletedDateTime
          ? new Date(data.DeletedDateTime)
          : null,
        DeletedByID: displayValue(data.DeletedByID),
        RowVersionColumn: displayValue(data.RowVersionColumn),
      };

      setFormData(formattedData);
    } catch (error) {
      console.error("Failed to load SalesRFQ:", error);
      toast.error("Failed to load SalesRFQ: " + error.message);
    }
  }, [
    salesRFQId,
    customers,
    suppliers,
    serviceTypes,
    addresses,
    mailingPriorities,
    DEFAULT_COMPANY.value,
  ]);

  const loadApprovalStatus = useCallback(async () => {
    if (!salesRFQId) return;
    try {
      const approvalData = await fetchSalesRFQApprovalStatus(salesRFQId);
      console.log("Approval data received:", approvalData);

      setApprovalRecord(approvalData);

      if (approvalData && approvalData.ApprovedYN !== undefined) {
        const newStatus =
          approvalData.ApprovedYN === 1 || approvalData.ApprovedYN === true
            ? "approved"
            : approvalData.ApprovedYN === 0 || approvalData.ApprovedYN === false
            ? "disapproved"
            : null;
        setApprovalStatus(newStatus);
        console.log("Set approvalStatus to:", newStatus);
      } else {
        setApprovalStatus(null);
        console.log("Set approvalStatus to null: No valid approval data");
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      setApprovalStatus(null);
      setApprovalRecord(null);
      console.log("Set approvalStatus to null: Error fetching status");
    }
  }, [salesRFQId]);

  useEffect(() => {
    if (salesRFQId && dropdownsLoaded) {
      loadSalesRFQ();
      loadApprovalStatus();
    }
  }, [salesRFQId, dropdownsLoaded, loadSalesRFQ, loadApprovalStatus]);

  const validateForm = () => {
    const newErrors = {};

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
        CollectFromSupplierYN: formData.CollectFromSupplierYN ? 1 : 0,
        PackagingRequiredYN: formData.PackagingRequiredYN ? 1 : 0,
        FormCompletedYN: formData.FormCompletedYN ? 1 : 0,
        parcels: parcels,
      };

      console.log("Submitting with parcels data:", parcels);

      if (salesRFQId) {
        await updateSalesRFQ(salesRFQId, apiData);
        toast.success("SalesRFQ updated successfully");
      } else {
        const result = await createSalesRFQ(apiData);
        toast.success("SalesRFQ created successfully");
      }

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

  const handleParcelsChange = (newParcels) => {
    setParcels(newParcels);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleApprove = () => {
    handleMenuClose();
    setConfirmAction("approve");
    setConfirmMessage("Do you want to approve this Sales RFQ?");
    setConfirmDialogOpen(true);
  };

  const handleDisapprove = () => {
    handleMenuClose();
    setConfirmAction("disapprove");
    setConfirmMessage("Do you want to disapprove this Sales RFQ?");
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    setConfirmDialogOpen(false);

    try {
      setLoading(true);

      const isApproved = confirmAction === "approve";
      await approveSalesRFQ(salesRFQId, isApproved);

      toast.success(
        `SalesRFQ ${isApproved ? "approved" : "disapproved"} successfully`
      );
      const newStatus = isApproved ? "approved" : "disapproved";
      setApprovalStatus(newStatus);
      console.log("Set approvalStatus after approval:", newStatus);
      // Optionally reload status after a delay to ensure backend sync
      setTimeout(() => loadApprovalStatus(), 1000);
    } catch (error) {
      console.error(
        `Error ${
          confirmAction === "approve" ? "approving" : "disapproving"
        } SalesRFQ:`,
        error
      );
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error(`Failed to ${confirmAction} SalesRFQ: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchaseRFQ = () => {
    setPurchaseRFQDialogOpen(true);
  };

  const handleConfirmCreatePurchaseRFQ = async () => {
    try {
      setCreatingPurchaseRFQ(true);

      const result = await createPurchaseRFQFromSalesRFQ(salesRFQId);

      if (result.success) {
        toast.success("Purchase RFQ created successfully");
        setPurchaseRFQDialogOpen(false);

        // Navigate to the Purchase RFQ list
        navigate("/purchase-rfq");
      } else {
        toast.error(result.message || "Failed to create Purchase RFQ");
      }
    } catch (error) {
      console.error("Error creating Purchase RFQ:", error);
      toast.error(
        typeof error === "string" ? error : "Failed to create Purchase RFQ"
      );
    } finally {
      setCreatingPurchaseRFQ(false);
      setPurchaseRFQDialogOpen(false);
    }
  };

  return (
    <FormPage
      title={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h6">
            {salesRFQId
              ? isEditing
                ? "Edit Sales RFQ"
                : "View Sales RFQ"
              : "Create Sales RFQ"}
          </Typography>
          {!isEditing && salesRFQId && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {approvalStatus !== null ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      approvalStatus === "approved" ? "#e6f7e6" : "#ffebee",
                    color:
                      approvalStatus === "approved" ? "#2e7d32" : "#d32f2f",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontWeight: "medium",
                  }}
                >
                  <Typography variant="body2">
                    Status:{" "}
                    {approvalStatus === "approved" ? "Approved" : "Disapproved"}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleMenuOpen}
                    endIcon={<MoreVertIcon />}
                    sx={{ ml: 1 }}
                  >
                    Status
                  </Button>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleApprove}>Approve</MenuItem>
                    <MenuItem onClick={handleDisapprove}>Disapprove</MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          )}
        </Box>
      }
      onCancel={onClose}
      onSubmit={isEditing ? handleSubmit : null}
      loading={loading}
      readOnly={!isEditing}
      onEdit={salesRFQId && !isEditing ? toggleEdit : null}
      onCreatePurchaseRFQ={handleCreatePurchaseRFQ}
      isApproved={approvalStatus === "approved"}
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
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmAction === "approve" ? "primary" : "error"}
            variant="contained"
          >
            {confirmAction === "approve" ? "Approve" : "Disapprove"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={purchaseRFQDialogOpen}
        onClose={() => !creatingPurchaseRFQ && setPurchaseRFQDialogOpen(false)}
      >
        <DialogTitle>Create Purchase RFQ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to create Purchase RFQ for this Sales RFQ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPurchaseRFQDialogOpen(false)}
            color="secondary"
            disabled={creatingPurchaseRFQ}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCreatePurchaseRFQ}
            color="primary"
            variant="contained"
            disabled={creatingPurchaseRFQ}
          >
            {creatingPurchaseRFQ ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </FormPage>
  );
};

export default SalesRFQForm;
