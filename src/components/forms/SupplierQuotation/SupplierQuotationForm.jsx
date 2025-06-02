import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Button,
  Alert,
  TextField,
  Fade,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  getSupplierQuotationById,
  fetchSuppliers,
  fetchPurchaseRFQs,
  fetchCurrencies,
  fetchServiceTypes,
  fetchAddresses,
  updateSupplierQuotation,
} from "./SupplierQuotationAPI";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import StatusIndicator from "./StatusIndicator";
import SupplierQuotationParcelTab from "./SupplierQuotationParcelTab";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
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
            label: rfq.Series || `RFQ #${rfq.PurchaseRFQID || rfq.id}`,
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

        setSuppliers(suppliersOptions);
        setPurchaseRFQs(purchaseRFQsOptions);
        setCurrencies(currenciesOptions);
        setServiceTypes(serviceTypesOptions);
        setAddresses(addressesOptions);

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

    try {
      setLoading(true);
      setError(null);

      const response = await getSupplierQuotationById(supplierQuotationId);
      const quotationData = response.data?.data?.quotation || {};

      const displayValue = (value) =>
        value === null || value === undefined ? "-" : value;

      const formattedData = {
        Series: displayValue(quotationData.Series),
        SupplierID: suppliers.find(
          (s) => String(s.value) === String(quotationData.SupplierID)
        )
          ? String(quotationData.SupplierID)
          : "",
        SupplierName: displayValue(quotationData.SupplierName),
        CustomerID: displayValue(quotationData.CustomerID),
        CustomerName: displayValue(quotationData.CustomerName),
        ExternalRefNo: displayValue(quotationData.ExternalRefNo),
        CompanyID: DEFAULT_COMPANY.value,
        CompanyName: DEFAULT_COMPANY.label,
        PurchaseRFQID: purchaseRFQs.find(
          (p) => String(p.value) === String(quotationData.PurchaseRFQID)
        )
          ? String(quotationData.PurchaseRFQID)
          : "",
        PurchaseRFQSeries: displayValue(quotationData.PurchaseRFQSeries),
        SalesRFQID: displayValue(quotationData.SalesRFQID),
        SalesRFQSeries: displayValue(quotationData.SalesRFQSeries),
        PostingDate: quotationData.PostingDate ? dayjs(quotationData.PostingDate) : null,
        DeliveryDate: quotationData.DeliveryDate ? dayjs(quotationData.DeliveryDate) : null,
        RequiredByDate: quotationData.RequiredByDate ? dayjs(quotationData.RequiredByDate) : null,
        DateReceived: quotationData.DateReceived ? dayjs(quotationData.DateReceived) : null,
        SalesAmount: parseFloat(quotationData.SalesAmount) || 0,
        TaxesAndOtherCharges: parseFloat(quotationData.TaxesAndOtherCharges) || 0,
        Total: parseFloat(quotationData.Total) || 0,
        CurrencyID: currencies.find(
          (c) => String(c.value) === String(quotationData.CurrencyID)
        )
          ? String(quotationData.CurrencyID)
          : "",
        CurrencyName: displayValue(quotationData.CurrencyName),
        Terms: displayValue(quotationData.Terms),
        FormCompletedYN: Boolean(quotationData.FormCompletedYN),
        CollectFromSupplierYN: Boolean(quotationData.CollectFromSupplierYN),
        ServiceTypeID: serviceTypes.find(
          (st) => String(st.value) === String(quotationData.ServiceTypeID)
        )
          ? String(quotationData.ServiceTypeID)
          : "",
        ServiceType: displayValue(quotationData.ServiceType),
        CollectionAddressID: addresses.find(
          (a) => String(a.value) === String(quotationData.CollectionAddressID)
        )
          ? String(quotationData.CollectionAddressID)
          : "",
        CollectionAddress: displayValue(quotationData.CollectionAddress),
        DestinationAddressID: addresses.find(
          (a) => String(a.value) === String(quotationData.DestinationAddressID)
        )
          ? String(quotationData.DestinationAddressID)
          : "",
        DestinationAddress: displayValue(quotationData.DestinationAddress),
        PackagingRequiredYN: Boolean(quotationData.PackagingRequiredYN),
        ValidTillDate: quotationData.ValidTillDate ? dayjs(quotationData.ValidTillDate) : null,
        QuotationReceivedYN: Boolean(quotationData.QuotationReceivedYN),
        FileName: displayValue(quotationData.FileName),
        FileContent: null,
        CreatedByID: displayValue(quotationData.CreatedByID),
        CreatedDateTime: quotationData.CreatedDateTime ? dayjs(quotationData.CreatedDateTime) : null,
        IsDeleted: Boolean(quotationData.IsDeleted),
        DeletedDateTime: quotationData.DeletedDateTime ? dayjs(quotationData.DeletedDateTime) : null,
        DeletedByID: displayValue(quotationData.DeletedByID),
        RowVersionColumn: displayValue(quotationData.RowVersionColumn),
      };

      setFormData(formattedData);
      setStatus(quotationData.Status || "Pending");
      setDataLoaded(true);
    } catch (error) {
      setError({
        message: error.response?.data?.message || "Failed to load supplier quotation data",
        details: error.response?.data?.message?.includes("parameter '@SupplierID'")
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
  }, [supplierQuotationId, toastDisplayed, DEFAULT_COMPANY, suppliers, purchaseRFQs, currencies, serviceTypes, addresses]);

  useEffect(() => {
    if (supplierQuotationId && dropdownsLoaded && !dataLoaded) {
      setToastDisplayed(false);
      loadSupplierQuotationData();
    }
  }, [supplierQuotationId, dropdownsLoaded, loadSupplierQuotationData, dataLoaded]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.SupplierID) {
      newErrors.SupplierID = "Supplier is required";
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);

      const apiData = {
        ...formData,
        SupplierQuotationID: parseInt(supplierQuotationId),
        SupplierID: parseInt(formData.SupplierID),
        CustomerID: parseInt(formData.CustomerID) || null,
        CompanyID: parseInt(formData.CompanyID),
        PurchaseRFQID: parseInt(formData.PurchaseRFQID),
        SalesRFQID: parseInt(formData.SalesRFQID) || null,
        SalesAmount: parseFloat(formData.SalesAmount) || 0,
        TaxesAndOtherCharges: parseFloat(formData.TaxesAndOtherCharges) || 0,
        Total: parseFloat(formData.Total) || 0,
        CurrencyID: parseInt(formData.CurrencyID),
        PostingDate: formData.PostingDate ? formData.PostingDate.toISOString() : null,
        DeliveryDate: formData.DeliveryDate ? formData.DeliveryDate.toISOString() : null,
        RequiredByDate: formData.RequiredByDate ? formData.RequiredByDate.toISOString() : null,
        DateReceived: formData.DateReceived ? formData.DateReceived.toISOString() : null,
        ValidTillDate: formData.ValidTillDate ? formData.ValidTillDate.toISOString() : null,
        CreatedDateTime: formData.CreatedDateTime ? formData.CreatedDateTime.toISOString() : null,
        DeletedDateTime: formData.DeletedDateTime ? formData.DeletedDateTime.toISOString() : null,
        CollectFromSupplierYN: formData.CollectFromSupplierYN ? 1 : 0,
        PackagingRequiredYN: formData.PackagingRequiredYN ? 1 : 0,
        FormCompletedYN: formData.FormCompletedYN ? 1 : 0,
        QuotationReceivedYN: formData.QuotationReceivedYN ? 1 : 0,
        IsDeleted: formData.IsDeleted ? 1 : 0,
        parcels: parcels.map((parcel) => ({
          SupplierQuotationParcelID: parcel.SupplierQuotationParcelID || null,
          SupplierQuotationID: parseInt(supplierQuotationId),
          ItemID: parseInt(parcel.ItemID),
          ItemQuantity: parseFloat(parcel.ItemQuantity) || 0,
          UOMID: parseInt(parcel.UOMID),
          Rate: parseFloat(parcel.Rate) || null,
          Amount: parseFloat(parcel.Amount) || null,
          CountryOfOriginID: parseInt(parcel.CountryOfOriginID) || null,
          CreatedByID: parseInt(parcel.CreatedByID) || null,
          IsDeleted: parcel.IsDeleted ? 1 : 0,
        })),
      };

      await updateSupplierQuotation(supplierQuotationId, apiData);
      toast.success("Supplier Quotation updated successfully");
      setIsEditing(false);
      if (onSave) onSave(apiData);
      setDataLoaded(false);
      await loadSupplierQuotationData();
    } catch (error) {
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
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
          purchaseRFQs.find((p) => p.value === value)?.label || "";
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

  const handleParcelsChange = (updatedParcels) => {
    setParcels(updatedParcels);
    calculateTotals(updatedParcels);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormPage
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" component="span">
              {isEditing
                ? "Edit Supplier Quotation"
                : supplierQuotationId
                  ? "View Supplier Quotation"
                    : "Create Supplier Quotation"}
            </Typography>
            {supplierQuotationId && (
              <Fade in={true} timeout={500}>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  background:
                    theme.palette.mode = "dark" ? "#90caf9" : "#1976d2",
                  borderRadius: "4px",
                  paddingRight: "10px",
                  height: "37px",
                  sm: {
                    paddingRight: "10px"
                  },
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(19, 16, 16, 0.2)",
                    transform: "scale(1.02)",
                  },
                }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "700",
                      color:
                        theme.palette.mode === "light" ? "white" : "black",
                      fontSize: "0.9rem",
                      marginRight: "8px",
                    }}
                  >
                    Status:
                  </Typography>
                  <StatusIndicator
                    status={status}
                    supplierQuotationId={supplierQuotationId}
                    onStatusChange={handleStatusChange}
                    readOnly={loading || !isEditing || status === "Approved"}
                  />
                </Box>
              </Fade>
            )}
          </Box>
        }
        onCancel={handleCancel}
        onSubmit={isEditing ? handleSave : undefined}
        onEdit={supplierQuotationId && !isEditing ? handleEditToggle : undefined}
        loading={loading}
        readOnly={readOnly && !isEditing}
      >
        {error && (
          <Alert
            severity="error"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="inherit" size="small" onClick={() => loadSupplierQuotationData()}>
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
          }}
        >
          <Grid container spacing={1}>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
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
                <ReadOnlyField label="Company" value={formData.CompanyName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="SupplierID"
                  label="Supplier"
                  value={formData.SupplierID || ""}
                  onChange={handleChange}
                  options={suppliers}
                  error={!!errors.SupplierID}
                  helperText={errors.SupplierID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Supplier" value={formData.SupplierName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="PurchaseRFQID"
                  label="Purchase RFQ"
                  value={formData.PurchaseRFQID || ""}
                  onChange={handleChange}
                  options={purchaseRFQs}
                  error={!!errors.PurchaseRFQID}
                  helperText={errors.PurchaseRFQID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Purchase RFQ" value={formData.PurchaseRFQSeries} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              <ReadOnlyField label="Sales RFQ" value={formData.SalesRFQSeries} />
            </Grid>
            <Grid sx={{ width: "24%" }}>
              <ReadOnlyField label="Customer" value={formData.CustomerName} />
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
                  name="ExternalRefNo"
                  label="External Ref No."
                  value={formData.ExternalRefNo || ""}
                  onChange={handleChange}
                  error={!!errors.ExternalRefNo}
                  disabled={readOnly}
                  fullWidth
                />
              ) : (
                <ReadOnlyField label="External Ref No." value={formData.ExternalRefNo} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="ServiceTypeID"
                  label="Service Type"
                  value={formData.ServiceTypeID || ""}
                  onChange={handleChange}
                  options={serviceTypes}
                  error={!!errors.ServiceTypeID}
                  helperText={errors.ServiceTypeID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Service Type" value={formData.ServiceType} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormDatePicker
                  name="DeliveryDate"
                  label="Delivery Date"
                  value={formData.DeliveryDate}
                  onChange={(date) => handleDateChange("DeliveryDate", date)}
                  error={!!errors.DeliveryDate}
                  helperText={errors.DeliveryDate}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField
                  label="Delivery Date"
                  value={formData.DeliveryDate ? formData.DeliveryDate.format("MM/DD/YYYY") : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormDatePicker
                  name="PostingDate"
                  label="Posting Date"
                  value={formData.PostingDate}
                  onChange={(date) => handleDateChange("PostingDate", date)}
                  error={!!errors.PostingDate}
                  helperText={errors.PostingDate}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField
                  label="Posting Date"
                  value={formData.PostingDate ? formData.PostingDate.format("MM/DD/YYYY") : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormDatePicker
                  name="RequiredByDate"
                  label="Required By Date"
                  value={formData.RequiredByDate}
                  onChange={(date) => handleDateChange("RequiredByDate", date)}
                  error={!!errors.RequiredByDate}
                  helperText={errors.RequiredByDate}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField
                  label="Required By Date"
                  value={formData.RequiredByDate ? formData.RequiredByDate.format("MM/DD/YYYY") : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormDatePicker
                  name="DateReceived"
                  label="Date Received"
                  value={formData.DateReceived}
                  onChange={(date) => handleDateChange("DateReceived", date)}
                  error={!!errors.DateReceived}
                  helperText={errors.DateReceived}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField
                  label="Date Received"
                  value={formData.DateReceived ? formData.DateReceived.format("MM/DD/YYYY") : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormDatePicker
                  name="ValidTillDate"
                  label="Valid Till Date"
                  value={formData.ValidTillDate}
                  onChange={(date) => handleDateChange("ValidTillDate", date)}
                  error={!!errors.ValidTillDate}
                  helperText={errors.ValidTillDate}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField
                  label="Valid Till Date"
                  value={formData.ValidTillDate ? formData.ValidTillDate.format("MM/DD/YYYY") : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="CollectionAddressID"
                  label="Collection Address"
                  value={formData.CollectionAddressID || ""}
                  onChange={handleChange}
                  options={addresses}
                  error={!!errors.CollectionAddressID}
                  helperText={errors.CollectionAddressID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Collection Address" value={formData.CollectionAddress} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="DestinationAddressID"
                  label="Destination Address"
                  value={formData.DestinationAddressID || ""}
                  onChange={handleChange}
                  options={addresses}
                  error={!!errors.DestinationAddressID}
                  helperText={errors.DestinationAddressID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Destination Address" value={formData.DestinationAddress} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
                  name="Terms"
                  label="Terms"
                  value={formData.Terms || ""}
                  onChange={handleChange}
                  error={!!errors.Terms}
                  helperText={errors.Terms}
                  disabled={readOnly}
                  fullWidth
                />
              ) : (
                <ReadOnlyField label="Terms" value={formData.Terms} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormSelect
                  name="CurrencyID"
                  label="Currency"
                  value={formData.CurrencyID || ""}
                  onChange={handleChange}
                  options={currencies}
                  error={!!errors.CurrencyID}
                  helperText={errors.CurrencyID}
                  disabled={readOnly}
                />
              ) : (
                <ReadOnlyField label="Currency" value={formData.CurrencyName} />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
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
                  value={formData.SalesAmount ? formData.SalesAmount.toFixed(2) : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
                  name="TaxesAndOtherCharges"
                  label="Taxes and Other Charges"
                  value={formData.TaxesAndOtherCharges.toFixed(2) || ""}
                  onChange={handleChange}
                  type="number"
                  disabled={readOnly}
                  fullWidth
                />
              ) : (
                <ReadOnlyField
                  label="Taxes and Other Charges"
                  value={formData.TaxesAndOtherCharges ? formData.TaxesAndOtherCharges.toFixed(2) : "-"}
                />
              )}
            </Grid>
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <TextField
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
                <FormControlLabel
                  control={
                    <Checkbox
                      name="PackagingRequiredYN"
                      checked={formData.PackagingRequiredYN}
                      onChange={handleCheckboxChange("PackagingRequiredYN")}
                      disabled={readOnly}
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
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="CollectFromSupplierYN"
                      checked={formData.CollectFromSupplierYN}
                      onChange={handleCheckboxChange("CollectFromSupplierYN")}
                      disabled={readOnly}
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
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="FormCompletedYN"
                      checked={formData.FormCompletedYN}
                      onChange={handleCheckboxChange("FormCompletedYN")}
                      disabled={readOnly}
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
            <Grid sx={{ width: "24%" }}>
              {isEditing ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="QuotationReceivedYN"
                      checked={formData.QuotationReceivedYN}
                      onChange={handleCheckboxChange("QuotationReceivedYN")}
                      disabled={readOnly}
                    />
                  }
                  label="Quotation Received"
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
          onParcelsChange={handleParcelsChange}
          readOnly={readOnly}
          isEditing={isEditing}
        />
      </FormPage>
    </LocalizationProvider>
  );
};

export default SupplierQuotationForm;