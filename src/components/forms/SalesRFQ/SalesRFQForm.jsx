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
} from "@mui/material";
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
import { createPurchaseRFQFromSalesRFQ } from "../PurchaseRFQ/PurchaseRFQAPI";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../toastNotification";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import StatusIndicator from "./StatusIndicator";
import axios from "axios";

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
  const [purchaseRFQDialogOpen, setPurchaseRFQDialogOpen] = useState(false);
  const [creatingPurchaseRFQ, setCreatingPurchaseRFQ] = useState(false);
  const [status, setStatus] = useState("");
  const [purchaseRFQExists, setPurchaseRFQExists] = useState(false);
  const [fieldDisabled, setFieldDisabled] = useState({
    Series: true,
    CompanyID: true,
    CustomerID: true,
    SupplierID: true,
    ExternalRefNo: true,
    DeliveryDate: true,
    PostingDate: true,
    RequiredByDate: true,
    DateReceived: true,
    ServiceTypeID: false,
    CollectionAddressID: true,
    DestinationAddressID: true,
    ShippingPriorityID: true,
    Terms: true,
    CurrencyID: true,
    CollectFromSupplierYN: true,
    PackagingRequiredYN: true,
    FormCompletedYN: true,
  });

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

  useEffect(() => {
    if (salesRFQId && dropdownsLoaded) {
      loadSalesRFQ();
    }
  }, [salesRFQId, dropdownsLoaded, loadSalesRFQ]);

  useEffect(() => {
    const loadSalesRFQ = async () => {
      if (salesRFQId) {
        try {
          setLoading(true);
          const response = await getSalesRFQById(salesRFQId);
          if (response.data) {
            console.log(
              "SalesRFQ Table - Status:",
              response.data.Status || response.data.status
            );

            if (response.data.Status || response.data.status) {
              setStatus(response.data.Status || response.data.status);
            } else {
              setStatus("Pending");
            }
          }
        } catch (error) {
          console.error("Error loading SalesRFQ:", error);
          toast.error("Failed to load SalesRFQ details");
        } finally {
          setLoading(false);
        }
      }
    };

    loadSalesRFQ();
  }, [salesRFQId]);

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

    if (name === "ServiceTypeID") {
      const serviceTypeLabel = serviceTypes.find(
        (st) => st.value === value
      )?.label;

      if (
        ["International Procurement", "Local Procurement"].includes(
          serviceTypeLabel
        )
      ) {
        setFieldDisabled({
          ...fieldDisabled,
          Series: !isEditing,
          CompanyID: true,
          CustomerID: !isEditing,
          SupplierID: true,
          ExternalRefNo: !isEditing,
          DeliveryDate: !isEditing,
          PostingDate: !isEditing,
          RequiredByDate: !isEditing,
          DateReceived: !isEditing,
          ServiceTypeID: false,
          CollectionAddressID: !isEditing,
          DestinationAddressID: !isEditing,
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
          PostingDate: !isEditing,
          RequiredByDate: !isEditing,
          DateReceived: !isEditing,
          ServiceTypeID: false,
          CollectionAddressID: !isEditing,
          DestinationAddressID: !isEditing,
          ShippingPriorityID: !isEditing,
          Terms: !isEditing,
          CurrencyID: !isEditing,
          CollectFromSupplierYN: !isEditing,
          PackagingRequiredYN: !isEditing,
          FormCompletedYN: !isEditing,
        });
      } else {
        setFieldDisabled({
          Series: true,
          CompanyID: true,
          CustomerID: true,
          SupplierID: true,
          ExternalRefNo: true,
          DeliveryDate: true,
          PostingDate: true,
          RequiredByDate: true,
          DateReceived: true,
          ServiceTypeID: false,
          CollectionAddressID: true,
          DestinationAddressID: true,
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

  useEffect(() => {
    if (formData) {
      const formattedData = {
        ...formData,
        DateReceived: formData.DateReceived
          ? dayjs(formData.DateReceived)
          : null,
        DeliveryDate: formData.DeliveryDate
          ? dayjs(formData.DeliveryDate)
          : null,
        PostingDate: formData.PostingDate ? dayjs(formData.PostingDate) : null,
        RequiredByDate: formData.RequiredByDate
          ? dayjs(formData.RequiredByDate)
          : null,
      };

      setFormData(formattedData);
    }
  }, []);

  const checkPurchaseRFQExists = useCallback(async () => {
    if (!salesRFQId) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      const response = await axios.get("http://localhost:7000/api/sales-rfq", {
        headers,
      });

      if (response.data && response.data.data) {
        const hasPurchaseRFQ = response.data.data.some(
          (rfq) => rfq.SourceSalesRFQID === parseInt(salesRFQId, 10)
        );

        console.log(
          `Purchase RFQ exists for Sales RFQ ${salesRFQId}: ${hasPurchaseRFQ}`
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

  const handleParcelsChange = (newParcels) => {
    setParcels(newParcels);
  };

  const handleCreatePurchaseRFQ = async () => {
    try {
      setCreatingPurchaseRFQ(true);
      const response = await createPurchaseRFQFromSalesRFQ(salesRFQId);
      console.log("Purchase RFQ creation response:", response);

      let purchaseRFQId = null;

      if (response && response.data && response.data.data) {
        purchaseRFQId =
          response.data.data.PurchaseRFQID || response.data.data.id;
      } else if (response && response.data && response.data.purchaseRFQId) {
        purchaseRFQId = response.data.purchaseRFQId;
      } else if (response && response.purchaseRFQId) {
        purchaseRFQId = response.purchaseRFQId;
      } else if (
        response &&
        response.data &&
        typeof response.data === "object"
      ) {
        const possibleIdProps = ["PurchaseRFQID", "id", "purchaseRFQId"];
        for (const prop of possibleIdProps) {
          if (response.data[prop]) {
            purchaseRFQId = response.data[prop];
            break;
          }
        }
      }

      console.log("Extracted Purchase RFQ ID:", purchaseRFQId);

      if (purchaseRFQId) {
        toast.info(
          <div>
            Purchase RFQ has been created successfully and you can view Purchase RFQ details{" "}
            <a
              href={`/purchase-rfq/view/${purchaseRFQId}`}
              style={{
                color: "black",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              onClick={(e) => {
                e.preventDefault();
                console.log("Navigating to Purchase RFQ:", purchaseRFQId);
                navigate(`/purchase-rfq/view/${purchaseRFQId}`);
              }}
            >
              here
            </a>
          </div>,
          { autoClose: 8000 }
        );

        setPurchaseRFQDialogOpen(false);
      } else {
        toast.error("Purchase RFQ was created but the ID is unavailable");
      }
    } catch (error) {
      console.error("Error creating Purchase RFQ:", error);
      toast.error(
        `Failed to create Purchase RFQ: ${error.message || "Unknown error"}`
      );
    } finally {
      setCreatingPurchaseRFQ(false);
    }
  };

  const handleConfirmCreatePurchaseRFQ = async () => {
    try {
      setCreatingPurchaseRFQ(true);

      const result = await createPurchaseRFQFromSalesRFQ(salesRFQId);

      if (result.success) {
        // toast.success("Purchase RFQ created successfully");
        showToast("Purchase RFQ created successfully", "success");
        setPurchaseRFQDialogOpen(false);

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      status === "Approved" ? "#e6f7e6" : "#ffebee",
                    color: status === "Approved" ? "#2e7d32" : "#d32f2f",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontWeight: "medium",
                  }}
                >
                  <Typography variant="body2" sx={{ marginRight: "8px" }}>
                    Status:{" "}
                  </Typography>
                  <StatusIndicator
                    status={status}
                    salesRFQId={salesRFQId}
                    onStatusChange={(newStatus) => {
                      console.log("Status changed to:", newStatus);
                      setStatus(newStatus);
                    }}
                    initialStatus={status}
                    skipFetch={true}
                    readOnly={status === "Approved"}
                  />
                </Box>
              </Box>
            )}
          </Box>
        }
        onCancel={onClose}
        onSubmit={isEditing ? handleSubmit : null}
        loading={loading}
        readOnly={!isEditing}
        onEdit={salesRFQId && !isEditing ? toggleEdit : null}
        onCreatePurchaseRFQ={
          status === "Approved" ? handleCreatePurchaseRFQ : null
        }
        isApproved={status === "Approved"}
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
                  disabled={fieldDisabled.Series}
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
                disabled={fieldDisabled.CompanyID}
                readOnly={true}
              />
            ) : (
              <ReadOnlyField label="Company" value={DEFAULT_COMPANY.label} />
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
                disabled={fieldDisabled.ServiceTypeID}
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
                value={
                  customers.find((c) => c.value === formData.CustomerID)
                    ?.label || "-"
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
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
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
                disabled={fieldDisabled.DeliveryDate}
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
                disabled={fieldDisabled.PostingDate}
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
                disabled={fieldDisabled.RequiredByDate}
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
                disabled={fieldDisabled.DateReceived}
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
                value={
                  addresses.find(
                    (a) => a.value === formData.CollectionAddressID
                  )?.label || "-"
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
                disabled={fieldDisabled.DestinationAddressID}
              />
            ) : (
              <ReadOnlyField
                label="Destination Address"
                value={
                  addresses.find(
                    (a) => a.value === formData.DestinationAddressID
                  )?.label || "-"
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
                disabled={fieldDisabled.ShippingPriorityID}
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
                disabled={fieldDisabled.Terms}
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
                disabled={fieldDisabled.CurrencyID}
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
              <Grid item xs={12} md={3} sx={{ width: "24%" }}>
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
              <Grid item xs={12} md={3} sx={{ width: "24%" }}>
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
          </Grid>
        </Grid>
        <ParcelTab
          salesRFQId={salesRFQId}
          onParcelsChange={handleParcelsChange}
          readOnly={!isEditing}
        />
        <Dialog
          open={purchaseRFQDialogOpen}
          onClose={() =>
            !creatingPurchaseRFQ && setPurchaseRFQDialogOpen(false)
          }
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