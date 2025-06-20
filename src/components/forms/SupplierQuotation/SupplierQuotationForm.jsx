import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Button,
  Alert,
  Fade,
  Chip,
} from "@mui/material";
import {
  getSupplierQuotationById,
  fetchSuppliers,
  fetchPurchaseRFQs,
  fetchCurrencies,
  fetchServiceTypes,
  fetchAddresses,
  fetchCustomers,
  updateSupplierQuotation,
  updateSupplierQuotationParcel,
  createSupplierQuotationParcel,
  getAuthHeader,
} from "./SupplierQuotationAPI";
import { toast } from "react-toastify";
import FormPage from "../../common/FormPage";
import FormSelect from "../../common/FormSelect";
import FormDatePicker from "../../common/FormDatePicker";
import FormInput from "../../common/FormInput";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import StatusIndicator from "./StatusIndicator";
import SupplierQuotationParcelTab from "./SupplierQuotationParcelTab";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;

  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (typeof value === "number") {
    displayValue = value.toString();
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {displayValue || "-"}
      </Typography>
    </Box>
  );
};

const SupplierQuotationForm = ({
  supplierQuotationId: propSupplierQuotationId,
  onClose,
  onSave,
  readOnly: propReadOnly = true,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");
  const supplierQuotationId = propSupplierQuotationId || id;
  const theme = useTheme();

  const [isEditing, setIsEditing] = useState(isEditMode);
  const readOnly = propReadOnly && !isEditMode;

  const DEFAULT_COMPANY = { value: 48, label: "Dung Beetle Logistics" };

  const [formData, setFormData] = useState({
    Series: "",
    SupplierID: "",
    SupplierName: "",
    CustomerID: "",
    CustomerName: "",
    ExternalRefNo: "",
    CompanyID: DEFAULT_COMPANY.value,
    CompanyName: DEFAULT_COMPANY.label,
    PurchaseRFQID: "",
    PurchaseRFQSeries: "",
    SalesRFQID: "",
    SalesRFQSeries: "",
    PostingDate: null,
    DeliveryDate: null,
    RequiredByDate: null,
    DateReceived: null,
    SalesAmount: 0,
    TaxesAndOtherCharges: 0,
    Total: 0,
    CurrencyID: "",
    CurrencyName: "",
    Terms: "",
    FormCompletedYN: false,
    CollectFromSupplierYN: false,
    ServiceTypeID: "",
    ServiceType: "",
    CollectionAddressID: "",
    CollectionAddress: "",
    DestinationAddressID: "",
    DestinationAddress: "",
    PackagingRequiredYN: false,
    ValidTillDate: null,
    QuotationReceivedYN: false,
    FileName: null,
    FileContent: null,
    CreatedByID: "",
    CreatedDateTime: null,
    IsDeleted: false,
    DeletedDateTime: null,
    DeletedByID: "",
    RowVersionColumn: "",
  });
  const [parcels, setParcels] = useState([]);
  const [originalParcels, setOriginalParcels] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const calculateTotals = useCallback(
    (updatedParcels) => {
      const salesAmount = updatedParcels.reduce(
        (sum, parcel) => sum + (parseFloat(parcel.Amount) || 0),
        0
      );
      const total =
        salesAmount + (parseFloat(formData.TaxesAndOtherCharges) || 0);
      setFormData((prev) => ({
        ...prev,
        SalesAmount: salesAmount,
        Total: total,
      }));
    },
    [formData.TaxesAndOtherCharges]
  );

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [
          suppliersData,
          purchaseRFQsData,
          currenciesData,
          serviceTypesData,
          addressesData,
          customersData,
        ] = await Promise.all([
          fetchSuppliers().catch((err) => {
            toast.error("Failed to load suppliers");
            return [];
          }),
          fetchPurchaseRFQs().catch((err) => {
            toast.error("Failed to load purchase RFQs");
            return [];
          }),
          fetchCurrencies().catch((err) => {
            toast.error("Failed to load currencies");
            return [];
          }),
          fetchServiceTypes().catch((err) => {
            toast.error("Failed to load service types");
            return [];
          }),
          fetchAddresses().catch((err) => {
            toast.error("Failed to load addresses");
            return [];
          }),
          fetchCustomers().catch((err) => {
            toast.error("Failed to load customers");
            return [];
          }),
        ]);

        const suppliersOptions = [
          { value: "", label: "Select an option" },
          ...suppliersData.map((supplier) => ({
            value: String(supplier.SupplierID || supplier.id),
            label: supplier.SupplierName || "Unknown",
          })),
        ];
        const purchaseRFQsOptions = [
          { value: "", label: "Select an option" },
          ...purchaseRFQsData.map((rfq) => ({
            value: String(rfq.PurchaseRFQID || rfq.id),
            label: String(rfq.PurchaseRFQID || rfq.id),
            series: rfq.Series || `RFQ #${rfq.PurchaseRFQID || rfq.id}`,
          })),
        ];
        const currenciesOptions = [
          { value: "", label: "Select an option" },
          ...currenciesData.map((currency) => ({
            value: String(currency.CurrencyID || currency.id),
            label: currency.CurrencyName || "Unknown",
          })),
        ];
        const serviceTypesOptions = [
          { value: "", label: "Select an option" },
          ...serviceTypesData.map((type) => ({
            value: String(type.ServiceTypeID || type.id),
            label: type.ServiceType || type.ServiceTypeName || "Unknown",
          })),
        ];
        const addressesOptions = [
          { value: "", label: "Select an option" },
          ...addressesData.map((address) => ({
            value: String(address.AddressID || address.id),
            label: `${address.AddressLine1}, ${address.City}, ${address.PostCode}`,
            title: address.AddressTitle || address.Title || "",
          })),
        ];
        const customersOptions = [
          { value: "", label: "Select an option" },
          ...customersData.map((customer) => ({
            value: String(customer.CustomerID || customer.id),
            label: customer.CustomerName || "Unknown",
          })),
        ];

        setSuppliers(suppliersOptions);
        setPurchaseRFQs(purchaseRFQsOptions);
        setCurrencies(currenciesOptions);
        setServiceTypes(serviceTypesOptions);
        setAddresses(addressesOptions);
        setCustomers(customersOptions);

        setDropdownsLoaded(true);
      } catch (error) {
        toast.error("Failed to load dropdown data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load Supplier Quotation data
  const loadSupplierQuotationData = useCallback(async () => {
    if (!supplierQuotationId || dataLoaded) return;

    // Ensure dropdowns are loaded before proceeding
    if (!dropdownsLoaded) {
      console.log(
        "Dropdowns not loaded yet, delaying loadSupplierQuotationData"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getSupplierQuotationById(supplierQuotationId);
      const quotationData = response.data?.data?.quotation || {};
      const parcelData = response.data?.data?.parcels || [];

      console.log("API Response quotationData:", quotationData); // Debug log

      const displayValue = (value) =>
        value === null || value === undefined ? "" : value;

      const formattedData = {
        Series: displayValue(quotationData.Series),
        SupplierID: String(quotationData.SupplierID || ""), // Use raw SupplierID from API
        SupplierName: displayValue(quotationData.SupplierName),
        CustomerID:
          customers.find(
            (c) => String(c.value) === String(quotationData.CustomerID)
          )?.value || String(quotationData.CustomerID || ""),
        CustomerName: displayValue(quotationData.CustomerName),
        ExternalRefNo: displayValue(quotationData.ExternalRefNo),
        CompanyID: DEFAULT_COMPANY.value,
        CompanyName: DEFAULT_COMPANY.label,
        PurchaseRFQID:
          purchaseRFQs.find(
            (p) => String(p.value) === String(quotationData.PurchaseRFQID)
          )?.value || String(quotationData.PurchaseRFQID || ""),
        PurchaseRFQSeries: displayValue(quotationData.PurchaseRFQSeries),
        SalesRFQID: displayValue(quotationData.SalesRFQID),
        SalesRFQSeries: displayValue(quotationData.SalesRFQSeries),
        PostingDate: quotationData.PostingDate
          ? dayjs(quotationData.PostingDate)
          : null,
        DeliveryDate: quotationData.DeliveryDate
          ? dayjs(quotationData.DeliveryDate)
          : null,
        RequiredByDate: quotationData.RequiredByDate
          ? dayjs(quotationData.RequiredByDate)
          : null,
        DateReceived: quotationData.DateReceived
          ? dayjs(quotationData.DateReceived)
          : null,
        SalesAmount: parseFloat(quotationData.SalesAmount) || 0,
        TaxesAndOtherCharges:
          parseFloat(quotationData.TaxesAndOtherCharges) || 0,
        Total: parseFloat(quotationData.Total) || 0,
        CurrencyID:
          currencies.find(
            (c) => String(c.value) === String(quotationData.CurrencyID)
          )?.value || String(quotationData.CurrencyID || ""),
        CurrencyName: displayValue(quotationData.CurrencyName),
        Terms: displayValue(quotationData.Terms),
        FormCompletedYN: Boolean(quotationData.FormCompletedYN),
        CollectFromSupplierYN: Boolean(quotationData.CollectFromSupplierYN),
        ServiceTypeID:
          serviceTypes.find(
            (st) => String(st.value) === String(quotationData.ServiceTypeID)
          )?.value || String(quotationData.ServiceTypeID || ""),
        ServiceType: displayValue(quotationData.ServiceType),
        CollectionAddressID:
          addresses.find(
            (a) => String(a.value) === String(quotationData.CollectionAddressID)
          )?.value || String(quotationData.CollectionAddressID || ""),
        CollectionAddress: displayValue(quotationData.CollectionAddress),
        DestinationAddressID:
          addresses.find(
            (a) =>
              String(a.value) === String(quotationData.DestinationAddressID)
          )?.value || String(quotationData.DestinationAddressID || ""),
        DestinationAddress: displayValue(quotationData.DestinationAddress),
        PackagingRequiredYN: Boolean(quotationData.PackagingRequiredYN),
        ValidTillDate: quotationData.ValidTillDate
          ? dayjs(quotationData.ValidTillDate)
          : null,
        QuotationReceivedYN: Boolean(quotationData.QuotationReceivedYN),
        FileName: displayValue(quotationData.FileName),
        FileContent: null,
        CreatedByID: displayValue(quotationData.CreatedByID),
        CreatedDateTime: quotationData.CreatedDateTime
          ? dayjs(quotationData.CreatedDateTime)
          : null,
        IsDeleted: Boolean(quotationData.IsDeleted),
        DeletedDateTime: quotationData.DeletedDateTime
          ? dayjs(quotationData.DeletedDateTime)
          : null,
        DeletedByID: displayValue(quotationData.DeletedByID),
        RowVersionColumn: displayValue(quotationData.RowVersionColumn),
      };

      console.log("Loaded formData:", formattedData); // Debug log

      setFormData(formattedData);

      // Format and store parcels
      const formattedParcels = parcelData.map((parcel, index) => ({
        SupplierQuotationParcelID: parcel.SupplierQuotationParcelID,
        SupplierQuotationID: supplierQuotationId,
        ItemID: parseInt(parcel.ItemID) || 0,
        itemName: parcel.ItemName || "Unknown Item",
        UOMID: parseInt(parcel.UOMID) || 0,
        uomName: parcel.UOM || "Unknown UOM",
        ItemQuantity: parseFloat(parcel.ItemQuantity) || 0,
        Rate: parseFloat(parcel.Rate) || 0,
        Amount: parseFloat(parcel.Amount) || 0,
        srNo: index + 1,
        CountryOfOriginID: parcel.CountryOfOriginID || null,
        CreatedByID: parcel.CreatedByID || null,
        IsDeleted: Boolean(parcel.IsDeleted) || false,
        id: parcel.SupplierQuotationParcelID,
      }));

      setOriginalParcels(formattedParcels);
      setParcels(formattedParcels);

      setStatus(quotationData.Status || "Pending");
      setDataLoaded(true);
    } catch (error) {
      setError({
        message:
          error.response?.data?.message ||
          "Failed to load supplier quotation data",
        details: error.response?.data?.message?.includes(
          "parameter '@SupplierID'"
        )
          ? "The server cannot find the supplier data for this quotation. Please try again or contact support."
          : "An unexpected error occurred. Please try again.",
      });
      if (!toastDisplayed) {
        toast.error(
          error.response?.data?.message?.includes("parameter '@SupplierID'")
            ? "Failed to load supplier quotation due to missing supplier data"
            : "Error loading supplier quotation",
          { toastId: "supplier-quotation-error" }
        );
        setToastDisplayed(true);
      }
    } finally {
      setLoading(false);
    }
  }, [
    supplierQuotationId,
    toastDisplayed,
    DEFAULT_COMPANY,
    suppliers,
    purchaseRFQs,
    currencies,
    serviceTypes,
    addresses,
    customers,
    dropdownsLoaded,
    dataLoaded,
  ]);

  useEffect(() => {
    if (supplierQuotationId && dropdownsLoaded && !dataLoaded) {
      setToastDisplayed(false);
      loadSupplierQuotationData();
    }
  }, [
    supplierQuotationId,
    dropdownsLoaded,
    loadSupplierQuotationData,
    dataLoaded,
  ]);

  const validateForm = () => {
    const newErrors = {};

    // Check required fields
    // Validate based on SupplierName since SupplierID might not be available
    if (!formData.SupplierName) {
      newErrors.SupplierName = "Supplier is required";
    }
    if (!formData.PurchaseRFQID) {
      newErrors.PurchaseRFQID = "Purchase RFQ is required";
    }
    if (!formData.CurrencyID) {
      newErrors.CurrencyID = "Currency is required";
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

    setErrors(newErrors);

    // Log validation errors for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation failed. Errors:", newErrors);
      console.log("Current formData:", formData);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);

      // Prepare supplier quotation data
      const apiData = {
        ...formData,
        SupplierQuotationID: parseInt(supplierQuotationId),
        SupplierID: formData.SupplierID ? parseInt(formData.SupplierID) : null,
        CustomerID: parseInt(formData.CustomerID) || null,
        CompanyID: parseInt(formData.CompanyID),
        PurchaseRFQID: parseInt(formData.PurchaseRFQID),
        SalesRFQID: parseInt(formData.SalesRFQID) || null,
        SalesAmount: parseFloat(formData.SalesAmount) || 0,
        TaxesAndOtherCharges: parseFloat(formData.TaxesAndOtherCharges) || 0,
        Total: parseFloat(formData.Total) || 0,
        CurrencyID: parseInt(formData.CurrencyID),
        PostingDate: formData.PostingDate
          ? formData.PostingDate.toISOString()
          : null,
        DeliveryDate: formData.DeliveryDate
          ? formData.DeliveryDate.toISOString()
          : null,
        RequiredByDate: formData.RequiredByDate
          ? formData.RequiredByDate.toISOString()
          : null,
        DateReceived: formData.DateReceived
          ? formData.DateReceived.toISOString()
          : null,
        ValidTillDate: formData.ValidTillDate
          ? formData.ValidTillDate.toISOString()
          : null,
        CreatedDateTime: formData.CreatedDateTime
          ? formData.CreatedDateTime.toISOString()
          : null,
        DeletedDateTime: formData.DeletedDateTime
          ? formData.DeletedDateTime.toISOString()
          : null,
        CollectFromSupplierYN: formData.CollectFromSupplierYN ? 1 : 0,
        PackagingRequiredYN: formData.PackagingRequiredYN ? 1 : 0,
        FormCompletedYN: formData.FormCompletedYN ? 1 : 0,
        QuotationReceivedYN: formData.QuotationReceivedYN ? 1 : 0,
        IsDeleted: formData.IsDeleted ? 1 : 0,
      };

      console.log("Data being sent to API:", apiData);

      // Update supplier quotation
      await updateSupplierQuotation(supplierQuotationId, apiData);

      // Update parcels
      const originalParcelIds = originalParcels.map(
        (p) => p.SupplierQuotationParcelID
      );
      const currentParcelIds = parcels.map((p) => p.SupplierQuotationParcelID);

      // Identify deleted parcels
      const deletedParcelIds = originalParcelIds.filter(
        (id) => !currentParcelIds.includes(id)
      );
      for (const parcelId of deletedParcelIds) {
        try {
          await axios.delete(
            `${APIBASEURL}/supplier-Quotation-Parcel/${parcelId}`,
            { headers: getAuthHeader().headers }
          );
          console.log(`Deleted parcel with ID ${parcelId}`);
        } catch (error) {
          console.error(`Failed to delete parcel ${parcelId}:`, error);
          throw new Error(
            `Failed to delete parcel ${parcelId}: ${error.message}`
          );
        }
      }

      // Update or create parcels
      for (const parcel of parcels) {
        const parcelData = {
          SupplierQuotationID: parseInt(supplierQuotationId),
          ItemID: parcel.ItemID,
          UOMID: parcel.UOMID,
          ItemQuantity: parcel.ItemQuantity,
          Rate: parcel.Rate,
          Amount: parcel.Amount,
          CountryOfOriginID: parcel.CountryOfOriginID,
          CreatedByID: parcel.CreatedByID,
          IsDeleted: parcel.IsDeleted ? 1 : 0,
        };

        if (originalParcelIds.includes(parcel.SupplierQuotationParcelID)) {
          // Update existing parcel
          await updateSupplierQuotationParcel(
            parcel.SupplierQuotationParcelID,
            {
              ...parcelData,
              SupplierQuotationParcelID: parcel.SupplierQuotationParcelID,
            }
          );
          console.log(
            `Updated parcel with ID ${parcel.SupplierQuotationParcelID}`
          );
        } else {
          // Create new parcel
          const response = await createSupplierQuotationParcel(parcelData);
          console.log(
            `Created new parcel with ID ${response.data?.SupplierQuotationParcelID}`
          );
        }
      }

      toast.success("Supplier Quotation and parcels updated successfully");
      setIsEditing(false);
      if (onSave) onSave({ ...apiData, parcels });
      setDataLoaded(false);
      setOriginalParcels([...parcels]); // Update original parcels after save
      await loadSupplierQuotationData();
      navigate("/supplier-quotation");
    } catch (error) {
      toast.error(
        `Failed to save: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate("/supplier-quotation");
    } else if (isEditing) {
      loadSupplierQuotationData();
      setIsEditing(true);
    } else if (onClose) {
      onClose();
    } else {
      navigate("/supplier-quotation");
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "CurrencyID") {
        newData.CurrencyName =
          currencies.find((c) => c.value === value)?.label || "";
      } else if (name === "SupplierID") {
        newData.SupplierName =
          suppliers.find((s) => s.value === value)?.label || "";
      } else if (name === "PurchaseRFQID") {
        newData.PurchaseRFQSeries =
          purchaseRFQs.find((p) => p.value === value)?.series || "";
      } else if (name === "CustomerID") {
        newData.CustomerName =
          customers.find((c) => c.value === value)?.label || "";
      } else if (name === "ServiceTypeID") {
        newData.ServiceType =
          serviceTypes.find((st) => st.value === value)?.label || "";
      } else if (name === "CollectionAddressID") {
        newData.CollectionAddress =
          addresses.find((a) => a.value === value)?.label || "";
      } else if (name === "DestinationAddressID") {
        newData.DestinationAddress =
          addresses.find((a) => a.value === value)?.label || "";
      }
      return newData;
    });
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

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setFormData((prev) => ({
      ...prev,
      Status: newStatus,
    }));
  };

  const handleParcelsChange = useCallback(
    (updatedParcels) => {
      setParcels(updatedParcels);
      calculateTotals(updatedParcels);
    },
    [calculateTotals]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormPage
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="span">
              {isEditing
                ? "Edit Supplier Quotation"
                : supplierQuotationId
                ? "View Supplier Quotation"
                : "Create Supplier Quotation"}
            </Typography>
            {supplierQuotationId && (
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
                    marginLeft: "16px",
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
                            theme.palette.mode === "light" ? "white" : "black",
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
                    supplierQuotationId={supplierQuotationId}
                    onStatusChange={handleStatusChange}
                    readOnly={status === "Approved"}
                  />
                </Box>
              </Fade>
            )}
          </Box>
        }
        onCancel={handleCancel}
        onSubmit={isEditing ? handleSave : undefined}
        onEdit={
          supplierQuotationId && !isEditing ? handleEditToggle : undefined
        }
        loading={loading}
        readOnly={readOnly && !isEditing}
      >
        {error && (
          <Alert
            severity="error"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => loadSupplierQuotationData()}
                >
                  Retry
                </Button>
                <Button color="inherit" size="small" onClick={handleCancel}>
                  Back to List
                </Button>
              </Box>
            }
            sx={{ mb: 3 }}
          >
            <Typography variant="body1">{error.message}</Typography>
            <Typography variant="body2">{error.details}</Typography>
          </Alert>
        )}
        <Box
          sx={{
            width: "100%",
            margin: 0,
            overflow: "hidden",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.background.default,
          }}
        >
          <Grid container spacing={1}>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
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
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="CompanyName"
                  label="Company"
                  value={formData.CompanyName || ""}
                  onChange={() => {}}
                  options={[DEFAULT_COMPANY]}
                  disabled={true}
                  readOnly={true}
                  sx={{ backgroundColor: "inherit" }}
                />
              ) : (
                <ReadOnlyField label="Company" value={formData.CompanyName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="SupplierName"
                  label="Supplier"
                  value={formData.SupplierName || ""}
                  onChange={handleChange}
                  options={suppliers}
                  error={!!errors.SupplierName}
                  helperText={errors.SupplierName}
                  disabled={true}
                  sx={{ backgroundColor: "inherit" }}
                />
              ) : (
                <ReadOnlyField label="Supplier" value={formData.SupplierName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="PurchaseRFQID"
                  label="Purchase RFQ"
                  value={formData.PurchaseRFQID || ""}
                  onChange={handleChange}
                  options={purchaseRFQs}
                  error={!!errors.PurchaseRFQID}
                  helperText={errors.PurchaseRFQID}
                  disabled={true}
                  sx={{ backgroundColor: "inherit" }}
                />
              ) : (
                <ReadOnlyField
                  label="Purchase RFQ"
                  value={formData.PurchaseRFQID}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="CustomerName"
                  label="Customer"
                  value={formData.CustomerName || ""}
                  onChange={handleChange}
                  options={customers}
                  error={!!errors.CustomerName}
                  helperText={errors.CustomerName}
                  disabled={true}
                  sx={{ backgroundColor: "inherit" }}
                />
              ) : (
                <ReadOnlyField label="Customer" value={formData.CustomerName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="External Ref No."
                  value={formData.ExternalRefNo}
                />
              ) : (
                <ReadOnlyField
                  label="External Ref No."
                  value={formData.ExternalRefNo}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Service Type"
                  value={formData.ServiceType || ""}
                />
              ) : (
                <ReadOnlyField
                  label="Service Type"
                  value={formData.ServiceType || ""}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Delivery Date"
                  value={
                    formData.DeliveryDate
                      ? formData.DeliveryDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Delivery Date"
                  value={
                    formData.DeliveryDate
                      ? formData.DeliveryDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Posting Date"
                  value={
                    formData.PostingDate
                      ? formData.PostingDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Posting Date"
                  value={
                    formData.PostingDate
                      ? formData.PostingDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Required By Date"
                  value={
                    formData.RequiredByDate
                      ? formData.RequiredByDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Required By Date"
                  value={
                    formData.RequiredByDate
                      ? formData.RequiredByDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Date Received"
                  value={
                    formData.DateReceived
                      ? formData.DateReceived.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Date Received"
                  value={
                    formData.DateReceived
                      ? formData.DateReceived.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Valid Till Date"
                  value={
                    formData.ValidTillDate
                      ? formData.ValidTillDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Valid Till Date"
                  value={
                    formData.ValidTillDate
                      ? formData.ValidTillDate.format("MM/DD/YYYY")
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Collection Address"
                  value={formData.CollectionAddress}
                />
              ) : (
                <ReadOnlyField
                  label="Collection Address"
                  value={formData.CollectionAddress}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Destination Address"
                  value={formData.DestinationAddress}
                />
              ) : (
                <ReadOnlyField
                  label="Destination Address"
                  value={formData.DestinationAddress}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField label="Terms" value={formData.Terms} />
              ) : (
                <ReadOnlyField label="Terms" value={formData.Terms} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField label="Currency" value={formData.CurrencyName} />
              ) : (
                <ReadOnlyField label="Currency" value={formData.CurrencyName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="SalesAmount"
                  label="Sales Amount"
                  value={formData.SalesAmount.toFixed(2) || ""}
                  onChange={handleChange}
                  disabled={true}
                  fullWidth
                />
              ) : (
                <ReadOnlyField
                  label="Sales Amount"
                  value={
                    formData.SalesAmount ? formData.SalesAmount.toFixed(2) : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Taxes and Other Charges"
                  value={
                    formData.TaxesAndOtherCharges
                      ? formData.TaxesAndOtherCharges.toFixed(2)
                      : "-"
                  }
                />
              ) : (
                <ReadOnlyField
                  label="Taxes and Other Charges"
                  value={
                    formData.TaxesAndOtherCharges
                      ? formData.TaxesAndOtherCharges.toFixed(2)
                      : "-"
                  }
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  name="Total"
                  label="Total"
                  value={formData.Total.toFixed(2) || ""}
                  onChange={handleChange}
                  disabled={true}
                  fullWidth
                />
              ) : (
                <ReadOnlyField
                  label="Total"
                  value={formData.Total ? formData.Total.toFixed(2) : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Packaging Required"
                  value={formData.PackagingRequiredYN ? "Yes" : "No"}
                />
              ) : (
                <ReadOnlyField
                  label="Packaging Required"
                  value={formData.PackagingRequiredYN ? "Yes" : "No"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Collect From Supplier"
                  value={formData.CollectFromSupplierYN ? "Yes" : "No"}
                />
              ) : (
                <ReadOnlyField
                  label="Collect From Supplier"
                  value={formData.CollectFromSupplierYN ? "Yes" : "No"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Form Completed"
                  value={formData.FormCompletedYN ? "Yes" : "No"}
                />
              ) : (
                <ReadOnlyField
                  label="Form Completed"
                  value={formData.FormCompletedYN ? "Yes" : "No"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <ReadOnlyField
                  label="Quotation Received"
                  value={formData.QuotationReceivedYN ? "Yes" : "No"}
                />
              ) : (
                <ReadOnlyField
                  label="Quotation Received"
                  value={formData.QuotationReceivedYN ? "Yes" : "No"}
                />
              )}
            </Grid>
          </Grid>
        </Box>

        <SupplierQuotationParcelTab
          supplierQuotationId={supplierQuotationId}
          initialParcels={parcels}
          onParcelsChange={handleParcelsChange}
          readOnly={readOnly}
          isEditing={isEditing}
        />
      </FormPage>
    </LocalizationProvider>
  );
};

export default SupplierQuotationForm;
