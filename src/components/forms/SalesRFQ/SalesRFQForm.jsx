import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
  fetchSalesRFQStatus,
  fetchUserApprovalStatus,
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
import { showToast } from "../../toastNotification";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import StatusIndicator from "./StatusIndicator";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import APIBASEURL from "../../../utils/apiBaseUrl";

const responsiveWidth = () => ({
  minWidth: {
    xs: '100%',     // Mobile (1 per row)
    sm: '48%',      // Small screen (2 per row with gap)
    md: '31.33%',   // Medium screen (3 per row with margin)
    lg: '23%',      // Large screen (4 per row with gap)
    xl: '18.4%',    // Extra large screen (5 per row with spacing)
  },
  maxWidth: {
    xs: '100%',
    sm: '48%',
    md: '31.33%',
    lg: '23%',
    xl: '18.4%',
  },
});

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
  const theme = useTheme();

  // Set PostingDate to current date (June 27, 2025, 03:38 PM IST) on initialization
  const currentDate = dayjs(); // Adjust timezone to IST
  const DEFAULT_COMPANY = { value: 48, label: "Dung Beetle Logistics" };

  const [formData, setFormData] = useState({
    Series: "",
    CompanyID: DEFAULT_COMPANY.value,
    CustomerID: "",
    CustomerName: "",
    SupplierID: "",
    ExternalRefNo: "",
    DeliveryDate: null,
    PostingDate: currentDate, // Autofill with current date and time
    RequiredByDate: null,
    DateReceived: null,
    ServiceTypeID: "",
    ServiceType: "",
    OriginWarehouseAddressID: "",
    CollectionAddressID: "",
    CollectionAddressTitle: "",
    DestinationAddressID: "",
    DestinationAddressTitle: "",
    DestinationWarehouseAddressID: "",
    ShippingPriorityID: "",
    ShippingPriority: "",
    Terms: "",
    CurrencyID: "",
    CurrencyName: "",
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
  const [purchaseRFQDialogOpen, setPurchaseRFQDialogOpen] = useState(false);
  const [creatingPurchaseRFQ, setCreatingPurchaseRFQ] = useState(false);
  const [status, setStatus] = useState("");
  const [userStatus, setUserStatus] = useState("Pending");
  const [purchaseRFQExists, setPurchaseRFQExists] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [fieldDisabled, setFieldDisabled] = useState({
    Series: true,
    CompanyID: true,
    CustomerID: true,
    SupplierID: true,
    ExternalRefNo: true,
    DeliveryDate: true,
    PostingDate: true, // Disable PostingDate
    RequiredByDate: true,
    DateReceived: true,
    ServiceTypeID: false,
    OriginWarehouseAddressID: true,
    CollectionAddressID: true,
    DestinationAddressID: true,
    DestinationWarehouseAddressID: true,
    ShippingPriorityID: true,
    Terms: true,
    CurrencyID: true,
    CollectFromSupplierYN: true,
    PackagingRequiredYN: true,
    FormCompletedYN: true,
  });
  const [validationMessage, setValidationMessage] = useState("");

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
          fetchCompanies().catch(() => []),
          fetchCustomers().catch(() => []),
          fetchSuppliers().catch(() => []),
          fetchServiceTypes().catch(() => []),
          fetchAddresses().catch(() => []),
          fetchMailingPriorities().catch(() => []),
          fetchCurrencies().catch(() => []),
        ]);

        setCompanies([{ value: "", label: "Select an option" }, ...companiesData.map((company) => ({ value: String(company.CompanyID), label: company.CompanyName || "-" }))]);
        setCustomers([{ value: "", label: "Select an option" }, ...customersData.map((customer) => ({ value: String(customer.CustomerID), label: customer.CustomerName || "-" }))]);
        setSuppliers([{ value: "", label: "Select an option" }, ...suppliersData.map((supplier) => ({ value: String(supplier.SupplierID), label: supplier.SupplierName || "-" }))]);
        setServiceTypes([{ value: "", label: "Select an option" }, ...serviceTypesData.map((type) => ({ value: String(type.ServiceTypeID), label: type.ServiceType || type.ServiceTypeName || "-" }))]);
        setAddresses([{ value: "", label: "Select an option" }, ...addressesData.map((address) => ({ value: String(address.AddressID), label: `${address.AddressLine1 || "Unknown Address"}, ${address.City || "Unknown City"}`, title: address.AddressTitle || address.Title || "" }))]);
        setMailingPriorities([{ value: "", label: "Select an option" }, ...prioritiesData.map((priority) => ({ value: String(priority.MailingPriorityID), label: priority.PriorityName || priority.MailingPriorityName || "-" }))]);
        setCurrencies([{ value: "", label: "Select an option" }, ...currenciesData.map((currency) => ({ value: String(currency.CurrencyID), label: currency.CurrencyName || "-" }))]);

        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Error in loadDropdownData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  const loadSalesRFQ = useCallback(async () => {
    if (!salesRFQId) return;

    try {
      const response = await getSalesRFQById(salesRFQId);
      const data = response.data || response;
      console.log("Raw SalesRFQ data for ID", salesRFQId, ":", data);

      const displayValue = (value) =>
        value === null || value === undefined ? "-" : value;

      const formattedData = {
        Series: data.Series
          ? data.Series.replace("Sales-RFQ", "Inquiry")
          : displayValue(data.Series),
        CompanyID: DEFAULT_COMPANY.value,
        CustomerID: customers.find(
          (c) => String(c.value) === String(data.CustomerID)
        )
          ? String(data.CustomerID)
          : "-",
        CustomerName: displayValue(data.CustomerName),
        SupplierID: suppliers.find(
          (s) => String(s.value) === String(data.SupplierID)
        )
          ? String(data.SupplierID)
          : "-",
        ExternalRefNo: displayValue(data.ExternalRefNo),
        DeliveryDate: data.DeliveryDate ? dayjs(data.DeliveryDate) : null,
        PostingDate: data.PostingDate ? dayjs(data.PostingDate) : currentDate, // Use current date if no data
        RequiredByDate: data.RequiredByDate ? dayjs(data.RequiredByDate) : null,
        DateReceived: data.DateReceived ? dayjs(data.DateReceived) : null,
        ServiceTypeID: serviceTypes.find(
          (st) => String(st.value) === String(data.ServiceTypeID)
        )
          ? String(data.ServiceTypeID)
          : "-",
        ServiceType: displayValue(data.ServiceType),
        OriginWarehouseAddressID: addresses.find(
          (a) => String(a.value) === String(data.OriginWarehouseAddressID)
        )
          ? String(data.OriginWarehouseAddressID)
          : "-",
        CollectionAddressID: addresses.find(
          (a) => String(a.value) === String(data.CollectionAddressID)
        )
          ? String(data.CollectionAddressID)
          : "-",
        CollectionAddressTitle:
          addresses.find(
            (a) => String(a.value) === String(data.CollectionAddressID)
          )?.label ||
          displayValue(data.CollectionAddressLine1) ||
          "-",
        DestinationAddressID: addresses.find(
          (a) => String(a.value) === String(data.DestinationAddressID)
        )
          ? String(data.DestinationAddressID)
          : "-",
        DestinationAddressTitle:
          addresses.find(
            (a) => String(a.value) === String(data.DestinationAddressID)
          )?.label ||
          displayValue(data.DestinationAddressLine1) ||
          "-",
        DestinationWarehouseAddressID: addresses.find(
          (a) => String(a.value) === String(data.DestinationWarehouseAddressID)
        )
          ? String(data.DestinationWarehouseAddressID)
          : "-",
        ShippingPriorityID: mailingPriorities.find(
          (p) => String(p.value) === String(data.ShippingPriorityID)
        )
          ? String(data.ShippingPriorityID)
          : "-",
        ShippingPriority: displayValue(data.ShippingPriority),
        Terms: displayValue(data.Terms),
        CurrencyID: currencies.find(
          (c) => String(c.value) === String(data.CurrencyID || data.currencyId)
        )
          ? String(data.CurrencyID || data.currencyId)
          : "-",
        CurrencyName: displayValue(
          data.CurrencyName || data.currencyName || data.Currency?.CurrencyName
        ),
        CollectFromSupplierYN: Boolean(data.CollectFromSupplierYN),
        PackagingRequiredYN: Boolean(data.PackagingRequiredYN),
        FormCompletedYN: Boolean(data.FormCompletedYN),
        CreatedByID: displayValue(data.CreatedByID),
        CreatedDateTime: data.CreatedDateTime
          ? dayjs(data.CreatedDateTime)
          : null,
        IsDeleted: data.IsDeleted || false,
        DeletedDateTime: data.DeletedDateTime
          ? dayjs(data.DeletedDateTime)
          : null,
        DeletedByID: displayValue(data.DeletedByID),
        RowVersionColumn: displayValue(data.RowVersionColumn),
      };

      setFormData(formattedData);
      setParcels(data.parcels || []);
      setIsSaveDisabled((data.parcels || []).length === 0);
      console.log("Formatted formData:", formattedData);
    } catch (error) {
      console.error("Failed to load SalesRFQ:", error);
    }
  }, [
    salesRFQId,
    customers,
    suppliers,
    serviceTypes,
    addresses,
    mailingPriorities,
    currencies,
    DEFAULT_COMPANY.value,
    currentDate,
  ]);

  useEffect(() => {
    if (salesRFQId && dropdownsLoaded) {
      loadSalesRFQ();
    }
  }, [salesRFQId, dropdownsLoaded]);

  const loadSalesRFQStatus = useCallback(async () => {
    if (!salesRFQId) return;

    try {
      setLoading(true);
      const status = await fetchSalesRFQStatus(salesRFQId);
      console.log("Fetched SalesRFQ status for ID:", salesRFQId, status);
      setStatus(status);
    } catch (error) {
      console.error("Error loading SalesRFQ status:", error);
      setStatus("Pending");
    } finally {
      setLoading(false);
    }
  }, [salesRFQId]);

  useEffect(() => {
    if (salesRFQId) {
      loadSalesRFQStatus();
    }
  }, [salesRFQId, loadSalesRFQStatus]);

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
    if (!formData.CurrencyID) {
      newErrors.CurrencyID = "Currency is required";
    }

    // Validate DeliveryDate is greater than PostingDate
    if (formData.DeliveryDate && formData.PostingDate) {
      if (formData.DeliveryDate.isBefore(formData.PostingDate, "day")) {
        newErrors.DeliveryDate = "Delivery Date must be after Posting Date";
      }
     if(formData.DeliveryDate.isAfter(formData.RequiredByDate, "day")) {
        newErrors.DeliveryDate = "Delivery Date must be Before Required By Date";
      }
    }
   
    // Validate RequiredByDate is greater than PostingDate
    if (formData.RequiredByDate && formData.PostingDate) {
      if (formData.RequiredByDate.isBefore(formData.PostingDate, "day")) {
        newErrors.RequiredByDate = "Required By Date must be after Posting Date";
      }
    }

    console.log("Validation errors:", newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isFormValid = validateForm();
    console.log("Form validation result - Is valid:", isFormValid, "Errors:", errors);

    let parcelValidationMessage = "";
    if (parcels.length === 0) {
      parcelValidationMessage = "No parcels added yet. Click 'Add Parcel' to add a new parcel.";
      console.log("Parcel validation failed - Message:", parcelValidationMessage);
    } else {
      console.log("Parcel validation passed - Parcels count:", parcels.length);
    }

    if (!isFormValid || parcelValidationMessage) {
      console.log("Validation failed - Form valid:", isFormValid, "Parcel message:", parcelValidationMessage);
      if (!isFormValid) {
        console.log("Form errors detected:", errors);
      }
      setValidationMessage(parcelValidationMessage || "");
      setIsSaveDisabled(true);
      return;
    }

    console.log("All validations passed - Proceeding to submit");
    setValidationMessage("");
    setIsSaveDisabled(false);

    try {
      setLoading(true);
      const apiData = {
        ...formData,
        Series: formData.Series === "-" ? null : formData.Series,
        ExternalRefNo: formData.ExternalRefNo === "-" ? null : formData.ExternalRefNo,
        Terms: formData.Terms === "-" ? null : formData.Terms,
        CreatedByID: formData.CreatedByID === "-" ? null : formData.CreatedByID,
        DeletedByID: formData.DeletedByID === "-" ? null : formData.DeletedByID,
        RowVersionColumn: formData.RowVersionColumn === "-" ? null : formData.RowVersionColumn,
        DeliveryDate: formData.DeliveryDate ? formData.DeliveryDate.toISOString() : null,
        PostingDate: formData.PostingDate ? formData.PostingDate.toISOString() : null,
        RequiredByDate: formData.RequiredByDate ? formData.RequiredByDate.toISOString() : null,
        DateReceived: formData.DateReceived ? formData.DateReceived.toISOString() : null,
        CollectFromSupplierYN: formData.CollectFromSupplierYN ? 1 : 0,
        PackagingRequiredYN: formData.PackagingRequiredYN ? 1 : 0,
        FormCompletedYN: formData.FormCompletedYN ? 1 : 0,
        parcels: parcels,
      };

      console.log("Submitting with parcels data:", apiData.parcels);

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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "CurrencyID") {
        newData.CurrencyName =
          currencies.find((c) => c.value === value)?.label || "";
      }
      return newData;
    });

    if (name === "ServiceTypeID") {
      const serviceTypeLabel =
        serviceTypes.find((st) => st.value === value)?.label || "";

      if (["International Procurement", "Local Procurement"].includes(serviceTypeLabel)) {
        setFieldDisabled({
          ...fieldDisabled,
          Series: !isEditing,
          CompanyID: true,
          CustomerID: !isEditing,
          SupplierID: true,
          ExternalRefNo: !isEditing,
          DeliveryDate: !isEditing,
          PostingDate: true, // Keep PostingDate disabled
          RequiredByDate: !isEditing,
          DateReceived: !isEditing,
          ServiceTypeID: false,
          OriginWarehouseAddressID: !isEditing,
          CollectionAddressID: !isEditing,
          DestinationAddressID: !isEditing,
          DestinationWarehouseAddressID: !isEditing,
          ShippingPriorityID: !isEditing,
          Terms: !isEditing,
          CurrencyID: !isEditing,
          CollectFromSupplierYN: !isEditing,
          PackagingRequiredYN: !isEditing,
          FormCompletedYN: !isEditing,
        });
      } else if (["Buyout", "CPCR", "Direct"].includes(serviceTypeLabel)) {
        setFieldDisabled({
          ...fieldDisabled,
          Series: !isEditing,
          CompanyID: true,
          CustomerID: !isEditing,
          SupplierID: !isEditing,
          ExternalRefNo: !isEditing,
          DeliveryDate: !isEditing,
          PostingDate: true, // Keep PostingDate disabled
          RequiredByDate: !isEditing,
          DateReceived: !isEditing,
          ServiceTypeID: false,
          OriginWarehouseAddressID: !isEditing,
          CollectionAddressID: !isEditing,
          DestinationAddressID: !isEditing,
          DestinationWarehouseAddressID: !isEditing,
          ShippingPriorityID: !isEditing,
          Terms: !isEditing,
          CurrencyID: !isEditing,
          CollectFromSupplierYN: !isEditing,
          PackagingRequiredYN: !isEditing,
          FormCompletedYN: !isEditing,
        });
      } else {
        setFieldDisabled({
          ...fieldDisabled,
          Series: true,
          CompanyID: true,
          CustomerID: true,
          SupplierID: true,
          ExternalRefNo: true,
          DeliveryDate: true,
          PostingDate: true, // Keep PostingDate disabled
          RequiredByDate: true,
          DateReceived: true,
          ServiceTypeID: false,
          OriginWarehouseAddressID: true,
          CollectionAddressID: true,
          DestinationAddressID: true,
          DestinationWarehouseAddressID: true,
          ShippingPriorityID: true,
          Terms: true,
          CurrencyID: true,
          CollectFromSupplierYN: true,
          PackagingRequiredYN: true,
          FormCompletedYN: true,
        });
      }
    }
  };

  const handleCheckboxChange = (name) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const handleDateChange = (field, date) => {
    const dayjsDate = date ? dayjs(date) : null;
    setFormData((prevData) => ({
      ...prevData,
      [field]: dayjsDate,
    }));
  };

  const handleParcelsChange = (newParcels) => {
    setParcels(newParcels);
    setIsSaveDisabled(newParcels.length === 0);
    if (newParcels.length > 0) {
      setValidationMessage("");
    }
  };

  const handleRefreshApprovals = () => {
    fetchUserApprovalStatus();
  };

  const checkPurchaseRFQExists = useCallback(async () => {
    if (!salesRFQId) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      const response = await axios.get(`${APIBASEURL}/sales-rfq`, {
        headers,
      });

      if (response.data && response.data.data) {
        const hasPurchaseRFQ = response.data.data.some(
          (rfq) => rfq.SourceSalesRFQID === parseInt(salesRFQId, 10)
        );
        setPurchaseRFQExists(hasPurchaseRFQ);
      }
    } catch (error) {
      console.error("Error checking for purchase RFQ:", error);
    }
  }, [salesRFQId]);

  useEffect(() => {
    if (salesRFQId) {
      checkPurchaseRFQExists();
    }
  }, [salesRFQId, checkPurchaseRFQExists]);

  const toggleEdit = () => {
    if (purchaseRFQExists) {
      toast.warning(
        "Cannot edit this Sales RFQ because a Purchase RFQ exists for it"
      );
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleCreatePurchaseRFQ = () => {
    setPurchaseRFQDialogOpen(true);
  };

  const handleConfirmCreatePurchaseRFQ = async () => {
    try {
      setCreatingPurchaseRFQ(true);

      if (!salesRFQId || isNaN(parseInt(salesRFQId, 10))) {
        throw new Error("Invalid Sales RFQ ID");
      }

      const response = await createPurchaseRFQFromSalesRFQ(salesRFQId);
      console.log("Create Purchase RFQ response:", response);

      let purchaseRFQId = null;
      if (response?.data?.data) {
        purchaseRFQId =
          response.data.data.PurchaseRFQID || response.data.data.id;
      } else if (response?.data?.newPurchaseRFQId) {
        purchaseRFQId = response.data.newPurchaseRFQId;
      } else if (response?.purchaseRFQId) {
        purchaseRFQId = response.purchaseRFQId;
      }

      if (purchaseRFQId) {
        toast.info(
          <div>
            Purchase RFQ created successfully. View details{" "}
            <a
              href={`/purchase-rfq/view/${purchaseRFQId}`}
              style={{
                color: "black",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/purchase-rfq/view/${purchaseRFQId}`);
              }}
            >
              here
            </a>
          </div>,
          { autoClose: 8000 }
        );
        setPurchaseRFQExists(true);
      } else {
        console.warn(
          "Purchase RFQ created, but ID is unavailable:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error creating Purchase RFQ:", {
        message: error.message,
        responseData: error.response?.data,
        salesRFQId,
      });
    } finally {
      setCreatingPurchaseRFQ(false);
      setPurchaseRFQDialogOpen(false);
    }
  };

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const globalStatus = await fetchSalesRFQStatus(salesRFQId);
        console.log("Global status for SalesRFQID:", salesRFQId, globalStatus);
        setStatus(globalStatus || "Pending");

        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        console.log("Current user in loadStatuses:", { rawUser, user });
      } catch (error) {
        console.error(
          "Error loading global status for SalesRFQID:",
          salesRFQId,
          error
        );
        setStatus("Pending");
      }
    };

    if (salesRFQId) {
      loadStatuses();
    }
  }, [salesRFQId]);

  const handleStatusChange = async (newStatus) => {
    console.log("User approval status changed to:", newStatus);
    setUserStatus(newStatus);
    await loadSalesRFQStatus();
  };

  console.log("StatusIndicator props", {
    status,
    userStatus,
    readOnly: userStatus === "Approved" || readOnly,
    salesRFQId,
  });

  const saveButtonSx = {
    ...(isSaveDisabled && {
      backgroundColor: "#757575",
      "&:hover": {
        backgroundColor: "#757575",
      },
    }),
    ...(!isSaveDisabled && {
      backgroundColor: "#1976d2",
      "&:hover": {
        backgroundColor: "#1565c0",
      },
    }),
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormPage
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap:2
            }}
          >
            <Typography variant="h6">
              {salesRFQId
                ? isEditing
                  ? "Edit Inquiry"
                  : "View Inquiry"
                : "Create Inquiry"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2,flex:1 }}>
              {!isEditing && salesRFQId && (
                <Fade in={true} timeout={500}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      background:
                        theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                      borderRadius: "4px",
                      paddingRight: "10px",
                      height: "37px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(19, 16, 16, 0.2)",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <Chip
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "700",
                            color:
                              theme.palette.mode === "light"
                                ? "white"
                                : "black",
                            fontSize: "0.9rem",
                          }}
                        >
                          Status:
                        </Typography>
                      }
                      sx={{
                        backgroundColor: "transparent",
                      }}
                    />
                    <StatusIndicator
                      salesRFQId={salesRFQId}
                      onStatusChange={handleStatusChange}
                      readOnly={readOnly && status === "Approved"}
                    />
                  </Box>
                </Fade>
              )}
              {!isEditing && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreatePurchaseRFQ}
                  disabled={status !== "Approved"}
                >
                  Create Purchase RFQ
                </Button>
              )}
            </Box>
          </Box>
        }
        onCancel={onClose}
        onSubmit={handleSubmit}
        loading={loading}
        readOnly={!isEditing}
        onEdit={salesRFQId && !isEditing ? toggleEdit : null}
        onCreatePurchaseRFQ={
          status === "Approved" && !purchaseRFQExists
            ? handleCreatePurchaseRFQ
            : null
        }
        isApproved={status === "Approved"}
        sx={saveButtonSx}
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
            padding: "26px",
           justifyContent:"space-around",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {/* {salesRFQId && (
            <Grid item xs={12} md={3} sx={{ width: "24%" }}>
              {isEditing ? (
                <FormInput
                  name="Series"
                  label="Series"
                  value={formData.Series || ""}
                  onChange={handleChange}
                  error={!!errors.Series}
                  helperText={errors.Series}
                  disabled={fieldDisabled.Series}
                />
              ) : (
                <ReadOnlyField label="Series" value={formData.Series} />
              )}
            </Grid>
          )} */}
          <Grid item xs={12}
            md={3}  sx={{...responsiveWidth()}}>
            {isEditing ? (
              <FormSelect
                name="CompanyID"
                label="Company"
                value={formData.CompanyID || ""}
                onChange={() => {}}
                options={[DEFAULT_COMPANY]}
                disabled={fieldDisabled.CompanyID}
                readOnly={true}
                error={!!errors.CompanyID}
                helperText={errors.CompanyID}
              />
            ) : (
              <ReadOnlyField
                label="Company"
                value={formData.CompanyID ? DEFAULT_COMPANY.label : "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="ServiceTypeID"
                label="Service Type"
                value={formData.ServiceTypeID || ""}
                onChange={handleChange}
                options={serviceTypes}
                error={!!errors.ServiceTypeID}
                helperText={errors.ServiceTypeID}
                disabled={fieldDisabled.ServiceTypeID}
              />
            ) : (
              <ReadOnlyField
                label="Service Type"
                value={formData.ServiceType || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="CustomerID"
                label="Customer"
                value={formData.CustomerID || ""}
                onChange={handleChange}
                options={customers}
                error={!!errors.CustomerID}
                helperText={errors.CustomerID}
                disabled={fieldDisabled.CustomerID}
              />
            ) : (
              <ReadOnlyField
                label="Customer"
                value={formData.CustomerName || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="SupplierID"
                label="Supplier"
                value={formData.SupplierID || ""}
                onChange={handleChange}
                options={suppliers}
                error={!!errors.SupplierID}
                helperText={errors.SupplierID}
                disabled={fieldDisabled.SupplierID}
              />
            ) : (
              <ReadOnlyField
                label="Supplier"
                value={
                  suppliers.find((s) => s.value === formData.SupplierID)
                    ?.label || "-"
                }
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormInput
                name="ExternalRefNo"
                label="External Ref No."
                value={formData.ExternalRefNo || ""}
                onChange={handleChange}
                error={!!errors.ExternalRefNo}
                helperText={errors.ExternalRefNo}
                disabled={fieldDisabled.ExternalRefNo}
              />
            ) : (
              <ReadOnlyField
                label="External Ref No."
                value={formData.ExternalRefNo || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormDatePicker
                name="DeliveryDate"
                label="Delivery Date"
                value={formData.DeliveryDate}
                onChange={(date) => handleDateChange("DeliveryDate", date)}
                error={errors.DeliveryDate}
                helperText={errors.DeliveryDate || null}
                disabled={fieldDisabled.DeliveryDate}
              />
            ) : (
              <ReadOnlyField
                label="Delivery Date"
                value={formData.DeliveryDate ? formData.DeliveryDate.format("MM/DD/YYYY") : "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormDatePicker
                name="PostingDate"
                label="Posting Date"
                value={formData.PostingDate}
                onChange={(date) => handleDateChange("PostingDate", date)}
                error={errors.PostingDate}
                helperText={errors.PostingDate || null}
                disabled={fieldDisabled.PostingDate} // Disabled to prevent editing
              />
            ) : (
              <ReadOnlyField
                label="Posting Date"
                value={formData.PostingDate ? formData.PostingDate.format("MM/DD/YYYY HH:mm") : "-"} // Show time as well
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormDatePicker
                name="RequiredByDate"
                label="Required By Date"
                value={formData.RequiredByDate}
                onChange={(date) => handleDateChange("RequiredByDate", date)}
                error={errors.RequiredByDate}
                helperText={errors.RequiredByDate || null}
                disabled={fieldDisabled.RequiredByDate}
              />
            ) : (
              <ReadOnlyField
                label="Required By Date"
                value={formData.RequiredByDate ? formData.RequiredByDate.format("MM/DD/YYYY") : "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormDatePicker
                name="DateReceived"
                label="Date Received"
                value={formData.DateReceived}
                onChange={(date) => handleDateChange("DateReceived", date)}
                error={errors.DateReceived}
                helperText={errors.DateReceived || null}
                disabled={fieldDisabled.DateReceived}
              />
            ) : (
              <ReadOnlyField
                label="Date Received"
                value={formData.DateReceived ? formData.DateReceived.format("MM/DD/YYYY") : "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="CollectionAddressID"
                label="Collection Address"
                value={formData.CollectionAddressID || ""}
                onChange={handleChange}
                options={addresses}
                error={!!errors.CollectionAddressID}
                helperText={errors.CollectionAddressID}
                disabled={fieldDisabled.CollectionAddressID}
              />
            ) : (
              <ReadOnlyField
                label="Collection Address"
                value={addresses.find((a) => a.value === formData.CollectionAddressID)?.label || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="DestinationAddressID"
                label="Destination Address"
                value={formData.DestinationAddressID || ""}
                onChange={handleChange}
                options={addresses}
                error={!!errors.DestinationAddressID}
                helperText={errors.DestinationAddressID}
                disabled={fieldDisabled.DestinationAddressID}
              />
            ) : (
              <ReadOnlyField
                label="Destination Address"
                value={addresses.find((a) => a.value === formData.DestinationAddressID)?.label || "-"}
              />
            )}
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            {isEditing ? (
              <FormSelect
                name="DestinationWarehouseAddressID"
                label="Destination Warehouse"
                value={formData.DestinationWarehouseAddressID || ""}
                onChange={handleChange}
                options={addresses}
                error={!!errors.DestinationWarehouseAddressID}
                helperText={errors.DestinationWarehouseAddressID}
                disabled={fieldDisabled.DestinationWarehouseAddressID}
              />
            ) : (
              <ReadOnlyField
                label="Destination Warehouse"
                value={addresses.find((a) => a.value === formData.DestinationWarehouseAddressID)?.label || "-"}
              />
            )}
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            {isEditing ? (
              <FormSelect
                name="OriginWarehouseAddressID"
                label="Origin Warehouse"
                value={formData.OriginWarehouseAddressID || ""}
                onChange={handleChange}
                options={addresses}
                error={!!errors.OriginWarehouseAddressID}
                helperText={errors.OriginWarehouseAddressID}
                disabled={fieldDisabled.OriginWarehouseAddressID}
              />
            ) : (
              <ReadOnlyField
                label="Origin Warehouse"
                value={addresses.find((a) => a.value === formData.OriginWarehouseAddressID)?.label || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="ShippingPriorityID"
                label="Shipping Priority"
                value={formData.ShippingPriorityID || ""}
                onChange={handleChange}
                options={mailingPriorities}
                error={!!errors.ShippingPriorityID}
                helperText={errors.ShippingPriorityID}
                disabled={fieldDisabled.ShippingPriorityID}
              />
            ) : (
              <ReadOnlyField
                label="Shipping Priority"
                value={formData.ShippingPriority || "-"}
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormInput
                name="Terms"
                label="Terms"
                value={formData.Terms || ""}
                onChange={handleChange}
                error={!!errors.Terms}
                helperText={errors.Terms}
                disabled={fieldDisabled.Terms}
              />
            ) : (
              <ReadOnlyField label="Terms" value={formData.Terms || "-"} />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormSelect
                name="CurrencyID"
                label="Currency"
                value={formData.CurrencyID || ""}
                onChange={handleChange}
                options={currencies}
                error={!!errors.CurrencyID}
                helperText={errors.CurrencyID}
                disabled={fieldDisabled.CurrencyID}
              />
            ) : (
              <ReadOnlyField
                label="Currency"
                value={
                  formData.CurrencyID
                    ? currencies.find((c) => c.value === formData.CurrencyID)?.label || "-"
                    : formData.CurrencyName || "-"
                }
              />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormControlLabel
                control={
                  <Checkbox
                    name="CollectFromSupplierYN"
                    checked={formData.CollectFromSupplierYN}
                    onChange={handleCheckboxChange("CollectFromSupplierYN")}
                    disabled={fieldDisabled.CollectFromSupplierYN}
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
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormControlLabel
                control={
                  <Checkbox
                    name="PackagingRequiredYN"
                    checked={formData.PackagingRequiredYN}
                    onChange={handleCheckboxChange("PackagingRequiredYN")}
                    disabled={fieldDisabled.PackagingRequiredYN}
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
          <Grid
            item
            xs={12}
            md={3}
            sx={{...responsiveWidth()}}
          >
            {isEditing ? (
              <FormControlLabel
                control={
                  <Checkbox
                    name="FormCompletedYN"
                    checked={formData.FormCompletedYN}
                    onChange={handleCheckboxChange("FormCompletedYN")}
                    disabled={fieldDisabled.FormCompletedYN}
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
        <ParcelTab
          salesRFQId={salesRFQId}
          onParcelsChange={handleParcelsChange}
          readOnly={!isEditing || status === "Approved"}
          refreshApprovals={handleRefreshApprovals}
        />
        {validationMessage && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 1, ml: 2 }}
          >
            {validationMessage}
          </Typography>
        )}
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
    </LocalizationProvider>
  );
};

export default SalesRFQForm;