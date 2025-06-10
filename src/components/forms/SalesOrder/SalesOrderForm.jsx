import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Fade,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import FormPage from "../../Common/FormPage";
import StatusIndicator from "./StatusIndicator";
import ParcelTab from "./ParcelTab.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import {
  fetchSalesOrder,
  fetchSalesOrderParcels,
  fetchSalesOrderStatus,
  getAuthHeader,
} from "./SalesOrderAPI";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;

  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (typeof value === "number") {
    displayValue = value.toFixed(2);
  } else if (value === null || value === undefined) {
    displayValue = "-";
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {displayValue}
      </Typography>
    </Box>
  );
};

const SalesOrderForm = ({
  salesOrderId: propSalesOrderId,
  onClose,
  readOnly,
}) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const salesOrderId = propSalesOrderId || id;

  const DEFAULT_COMPANY = { value: 48, label: "Dung Beetle Logistics" };

  const [formData, setFormData] = useState({
    Series: "",
    CompanyID: DEFAULT_COMPANY.value,
    CompanyName: DEFAULT_COMPANY.label,
    CustomerID: "",
    CustomerName: "",
    SupplierID: "",
    SupplierName: "",
    ExternalRefNo: "",
    OrderDate: null,
    DeliveryDate: null,
    PostingDate: null,
    RequiredByDate: null,
    DateReceived: null,
    ServiceTypeID: "",
    ServiceType: "",
    CollectionAddressID: "",
    CollectionAddress: "",
    DestinationAddressID: "",
    DestinationAddress: "",
    ShippingPriorityID: "",
    ShippingPriorityName: "",
    Terms: "",
    CurrencyID: "",
    CurrencyName: "",
    CollectFromCustomerYN: false,
    PackagingRequiredYN: false,
    FormCompletedYN: false,
    SalesAmount: 0,
    TaxAmount: 0,
    Total: 0,
    PaymentTerms: "",
    PaymentStatus: "",
    DeliveryStatus: "",
    Notes: "",
  });
  const [parcels, setParcels] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parcelError, setParcelError] = useState(null);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch dropdown data (currencies, suppliers, customers, service types, addresses)
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const { headers } = getAuthHeader();

        const [
          currenciesData,
          suppliersData,
          customersData,
          serviceTypesData,
          addressesData,
        ] = await Promise.all([
          axios
            .get(`${APIBASEURL}/currencies`, { headers })
            .then((res) => res.data.data || [])
            .catch((err) => {
              toast.error("Failed to load currencies");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/suppliers`, { headers })
            .then((res) => res.data.data || [])
            .catch((err) => {
              toast.error("Failed to load suppliers", err);
              return [];
            }),
          axios
            .get(`${APIBASEURL}/customers`, { headers })
            .then((res) => res.data.data || [])
            .catch((err) => {
              toast.error("Failed to load customers");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/service-types`, { headers })
            .then((res) => res.data.data || [])
            .catch((err) => {
              toast.error("Failed to load service types");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/addresses`, { headers })
            .then((res) => res.data.data || [])
            .catch((err) => {
              toast.error("Failed to load addresses");
              return [];
            }),
        ]);

        const currenciesOptions = [
          { value: "", label: "Select a Currency" },
          ...currenciesData.map((currency) => ({
            value: String(currency.CurrencyID),
            label: currency.CurrencyName || "Unknown",
          })),
        ];
        const suppliersOptions = [
          { value: "", label: "Select a Supplier" },
          ...suppliersData.map((supplier) => ({
            value: String(supplier.SupplierID),
            label: supplier.SupplierName || "Unknown",
          })),
        ];
        const customersOptions = [
          { value: "", label: "Select a Customer" },
          ...customersData.map((customer) => ({
            value: String(customer.CustomerID),
            label: customer.CustomerName || "Unknown",
          })),
        ];
        const serviceTypesOptions = [
          { value: "", label: "Select a Service Type" },
          ...serviceTypesData.map((type) => ({
            value: String(type.ServiceTypeID),
            label: type.ServiceType || type.ServiceTypeName || "Unknown",
          })),
        ];
        const addressesOptions = [
          { value: "", label: "Select an Address" },
          ...addressesData.map((address) => ({
            value: String(address.AddressID),
            label: `${address.AddressLine1}, ${address.City}, ${address.PostCode}`,
          })),
        ];

        setCurrencies(currenciesOptions);
        setSuppliers(suppliersOptions);
        setCustomers(customersOptions);
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

  // Handle changes to form data (used for mapping IDs to names)
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

  // Fetch Sales Order and Parcels
  const fetchData = useCallback(async () => {
    if (!salesOrderId || dataLoaded || !dropdownsLoaded) return;

    setLoading(true);
    setError(null);
    setParcelError(null);

    try {
      // Fetch Sales Order
      const response = await fetchSalesOrder(salesOrderId);
      const order = Array.isArray(response) ? response[0] : response;

      console.log("Fetched Sales Order:", order);

      if (order) {
        const newFormData = {
          Series: order.Series || "",
          CompanyID: order.CompanyID || DEFAULT_COMPANY.value,
          CompanyName: DEFAULT_COMPANY.label,
          CustomerID: String(order.CustomerID || ""),
          CustomerName:
            customers.find((c) => String(c.value) === String(order.CustomerID))
              ?.label || order.Customer?.Name || "",
          SupplierID: String(order.SupplierID || ""),
          SupplierName:
            suppliers.find((s) => String(s.value) === String(order.SupplierID))
              ?.label || order.SupplierName || "",
          ExternalRefNo: order.ExternalRefNo || "",
          OrderDate: order.OrderDate ? new Date(order.OrderDate) : null,
          DeliveryDate: order.DeliveryDate ? new Date(order.DeliveryDate) : null,
          PostingDate: order.PostingDate ? new Date(order.PostingDate) : null,
          RequiredByDate: order.RequiredByDate
            ? new Date(order.RequiredByDate)
            : null,
          DateReceived: order.DateReceived ? new Date(order.DateReceived) : null,
          ServiceTypeID: String(order.ServiceTypeID || ""),
          ServiceType:
            serviceTypes.find(
              (st) => String(st.value) === String(order.ServiceTypeID)
            )?.label || order.ServiceType || "",
          CollectionAddressID: String(order.CollectionAddressID || ""),
          CollectionAddress:
            addresses.find(
              (a) => String(a.value) === String(order.CollectionAddressID)
            )?.label || order.CollectionAddressTitle || "",
          DestinationAddressID: String(order.DestinationAddressID || ""),
          DestinationAddress:
            addresses.find(
              (a) => String(a.value) === String(order.DestinationAddressID)
            )?.label || order.DestinationAddressTitle || "",
          ShippingPriorityID: String(order.ShippingPriorityID || ""),
          ShippingPriorityName: order.ShippingPriorityID
            ? `Priority ID: ${order.ShippingPriorityID}`
            : "",
          Terms: order.Terms || "",
          CurrencyID: String(order.CurrencyID || ""),
          CurrencyName:
            currencies.find((c) => String(c.value) === String(order.CurrencyID))
              ?.label || order.CurrencyName || "",
          CollectFromCustomerYN: !!order.CollectFromSupplierYN,
          PackagingRequiredYN: !!order.PackagingRequiredYN,
          FormCompletedYN: !!order.SalesOrderCompletedYN,
          SalesAmount: parseFloat(order.SalesAmount) || 0,
          TaxAmount: parseFloat(order.TaxesAndOtherCharges) || 0,
          Total: parseFloat(order.Total || order.TotalAmount) || 0,
          PaymentTerms: order.PaymentTerms || "",
          PaymentStatus: order.PaymentStatus || "Unpaid",
          DeliveryStatus: order.DeliveryStatus || "Pending",
          Notes: order.Notes || "",
        };
        setFormData(newFormData);
        setDataLoaded(true);
      } else {
        throw new Error("No Sales Order data returned");
      }

      // Fetch Sales Order Parcels
      try {
        const fetchedParcels = await fetchSalesOrderParcels(salesOrderId);
        const mappedParcels = fetchedParcels.map((parcel) => ({
          ParcelID: parcel.SalesOrderParcelID || "Unknown",
          itemName: parcel.ItemName || "Unknown Item",
          uomName: parcel.UOMName || parcel.UOM || "-",
          quantity: parseFloat(parcel.ItemQuantity) || 0,
        }));
        setParcels(mappedParcels);
      } catch (parcelErr) {
        const parcelErrorMessage = parcelErr.response
          ? `Server error: ${parcelErr.response.status} - ${
              parcelErr.response.data?.message || parcelErr.message
            }`
          : `Failed to fetch parcels: ${parcelErr.message}`;
        console.error("Parcel fetch error:", parcelErrorMessage);
        setParcelError(parcelErrorMessage);
        toast.error(parcelErrorMessage);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response?.data?.message || error.message
          }`
        : `Failed to fetch data: ${error.message}`;
      console.error("Error in fetchData:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    salesOrderId,
    dropdownsLoaded,
    dataLoaded,
    customers,
    suppliers,
    serviceTypes,
    addresses,
    currencies,
  ]);

  useEffect(() => {
    if (salesOrderId && dropdownsLoaded && !dataLoaded) {
      fetchData();
    } else if (!salesOrderId) {
      setError("No Sales Order ID provided");
      setLoading(false);
    }
  }, [salesOrderId, dropdownsLoaded, dataLoaded, fetchData]);

  // Add useEffect to log formData after it updates
  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const loadSalesOrderStatus = useCallback(async () => {
    if (!salesOrderId) return;

    try {
      setLoading(true);
      const status = await fetchSalesOrderStatus(salesOrderId);
      console.log("Fetched SalesOrder status for ID:", salesOrderId, status);
      setStatus(status);
    } catch (error) {
      console.error("Error loading SalesOrder status:", error);
      toast.error(
        "Failed to load status: " + (error.message || "Unknown error")
      );
      setStatus("Pending");
    } finally {
      setLoading(false);
    }
  }, [salesOrderId]);

  useEffect(() => {
    if (salesOrderId && dropdownsLoaded) {
      loadSalesOrderStatus();
    }
  }, [salesOrderId, dropdownsLoaded, loadSalesOrderStatus]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/sales-order");
    }
  };

  const handleStatusChange = async (newStatus) => {
    console.log("Status changed to:", newStatus);
    setStatus(newStatus);
    await loadSalesOrderStatus();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          An error occurred: {error}
        </Typography>
        <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No Sales Order data available</Typography>
      </Box>
    );
  }

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
          <Typography variant="h6">View Sales Order</Typography>
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
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
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
                      color: theme.palette.mode === "light" ? "white" : "black",
                      fontSize: "0.9rem",
                    }}
                  >
                    Status:
                  </Typography>
                }
                sx={{ backgroundColor: "transparent" }}
              />
              <StatusIndicator
                salesOrderId={salesOrderId}
                onStatusChange={handleStatusChange}
              />
            </Box>
          </Fade>
        </Box>
      }
      onCancel={handleCancel}
      readOnly={readOnly}
    >
      <Grid2
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
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Series" value={formData.Series} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Company" value={formData.CompanyName} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Service Type" value={formData.ServiceType} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Customer" value={formData.CustomerName} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Supplier" onChange={handleChange} value={formData.SupplierName} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="External Ref No."
            value={formData.ExternalRefNo}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Order Date" value={formData.OrderDate} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Delivery Date" value={formData.DeliveryDate} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Posting Date" value={formData.PostingDate} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Required By Date"
            value={formData.RequiredByDate}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Date Received" value={formData.DateReceived} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddress}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddress}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Shipping Priority"
            value={formData.ShippingPriorityName}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currency" value={formData.CurrencyName} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Payment Terms" value={formData.PaymentTerms} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Payment Status" value={formData.PaymentStatus} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Delivery Status" value={formData.DeliveryStatus} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sales Amount" value={formData.SalesAmount} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Taxes and Other Charges"
            value={formData.TaxAmount}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Total" value={formData.Total} />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collect From Customer"
            value={formData.CollectFromCustomerYN}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Packaging Required"
            value={formData.PackagingRequiredYN}
          />
        </Grid2>
        <Grid2 xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Form Completed"
            value={formData.FormCompletedYN}
          />
        </Grid2>
        <Grid2 xs={12} md={6} sx={{ width: "48%" }}>
          <ReadOnlyField label="Notes" value={formData.Notes} />
        </Grid2>
      </Grid2>

      <ParcelTab
        salesOrderId={salesOrderId}
        parcels={parcels}
        readOnly={readOnly}
        error={parcelError}
      />
    </FormPage>
  );
};

export default SalesOrderForm;