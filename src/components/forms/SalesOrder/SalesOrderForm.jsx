import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Fade,
  Chip,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
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
  approveSalesOrder,
} from "./SalesOrderAPI";
import APIBASEURL from "../../../utils/apiBaseUrl.js";

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

const SalesOrderForm = ({ onClose }) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const salesOrderId = id;

  console.log("SalesOrderForm rendered with:", {
    salesOrderId,
    id,
    onClose: !!onClose,
  });

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
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const { headers } = getAuthHeader();
        console.log("Loading dropdown data with headers:", headers);

        const [
          currenciesData,
          suppliersData,
          customersData,
          serviceTypesData,
          addressesData,
        ] = await Promise.all([
          axios
            .get(`${APIBASEURL}/currencies`, { headers })
            .then((res) => {
              console.log("Currencies fetched:", res.data.data);
              return res.data.data || [];
            })
            .catch((err) => {
              console.error("Failed to load currencies:", err);
              toast.error("Failed to load currencies");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/suppliers`, { headers })
            .then((res) => {
              console.log("Suppliers fetched:", res.data.data);
              return res.data.data || [];
            })
            .catch((err) => {
              console.error("Failed to load suppliers:", err);
              toast.error("Failed to load suppliers");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/customers`, { headers })
            .then((res) => {
              console.log("Customers fetched:", res.data.data);
              return res.data.data || [];
            })
            .catch((err) => {
              console.error("Failed to load customers:", err);
              toast.error("Failed to load customers");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/service-types`, { headers })
            .then((res) => {
              console.log("Service types fetched:", res.data.data);
              return res.data.data || [];
            })
            .catch((err) => {
              console.error("Failed to load service types:", err);
              toast.error("Failed to load service types");
              return [];
            }),
          axios
            .get(`${APIBASEURL}/addresses`, { headers })
            .then((res) => {
              console.log("Addresses fetched:", res.data.data);
              return res.data.data || [];
            })
            .catch((err) => {
              console.error("Failed to load addresses:", err);
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

        console.log("Dropdowns loaded:", {
          currencies: currenciesOptions.length,
          suppliers: suppliersOptions.length,
          customers: customersOptions.length,
          serviceTypes: serviceTypesOptions.length,
          addresses: addressesOptions.length,
        });
        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load dropdown data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  const fetchData = useCallback(async () => {
    console.log("fetchData called with:", {
      salesOrderId,
      dropdownsLoaded,
      dataLoaded,
    });
    if (!salesOrderId || !dropdownsLoaded || dataLoaded) {
      console.log("fetchData early exit:", {
        salesOrderId,
        dropdownsLoaded,
        dataLoaded,
      });
      return;
    }

    setLoading(true);
    setError(null);
    setParcelError(null);

    try {
      console.log("Fetching Sales Order for ID:", salesOrderId);
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
              ?.label ||
            order.Customer?.Name ||
            "",
          SupplierID: String(order.SupplierID || ""),
          SupplierName:
            suppliers.find((s) => String(s.value) === String(order.SupplierID))
              ?.label ||
            order.SupplierName ||
            "",
          ExternalRefNo: order.ExternalRefNo || "",
          OrderDate: order.OrderDate ? new Date(order.OrderDate) : null,
          DeliveryDate: order.DeliveryDate
            ? new Date(order.DeliveryDate)
            : null,
          PostingDate: order.PostingDate ? new Date(order.PostingDate) : null,
          RequiredByDate: order.RequiredByDate
            ? new Date(order.RequiredByDate)
            : null,
          DateReceived: order.DateReceived
            ? new Date(order.DateReceived)
            : null,
          ServiceTypeID: String(order.ServiceTypeID || ""),
          ServiceType:
            serviceTypes.find(
              (st) => String(st.value) === String(order.ServiceTypeID)
            )?.label ||
            order.ServiceType ||
            "",
          CollectionAddressID: String(order.CollectionAddressID || ""),
          CollectionAddress:
            addresses.find(
              (a) => String(a.value) === String(order.CollectionAddressID)
            )?.label ||
            order.CollectionAddressTitle ||
            "",
          DestinationAddressID: String(order.DestinationAddressID || ""),
          DestinationAddress:
            addresses.find(
              (a) => String(a.value) === String(order.DestinationAddressID)
            )?.label ||
            order.DestinationAddressTitle ||
            "",
          ShippingPriorityID: String(order.ShippingPriorityID || ""),
          ShippingPriorityName: order.ShippingPriorityID
            ? `Priority ID: ${order.ShippingPriorityID}`
            : "",
          Terms: order.Terms || "",
          CurrencyID: String(order.CurrencyID || ""),
          CurrencyName:
            currencies.find((c) => String(c.value) === String(order.CurrencyID))
              ?.label ||
            order.CurrencyName ||
            "",
          CollectFromCustomerYN: !!order.CollectFromSupplierYN,
          PackagingRequiredYN: !!order.PackagingRequiredYN,
          FormCompletedYN: !!order.SalesOrderCompletedYN,
          SalesAmount: parseFloat(order.SalesAmount) || 0,
          TaxAmount: parseFloat(order.TaxesAndOtherCharges) || 0,
          Total: parseFloat(order.data || order.TotalAmount) || 0,
          PaymentTerms: order.PaymentTerms || "",
          PaymentStatus: order.PaymentStatus || "Unmodified",
          DeliveryStatus: order.DeliveryStatus || "Pending",
          Notes: order.Notes || "",
        };
        setFormData(newFormData);
        setDataLoaded(true);
        console.log("Sales Orders data:", newFormData);

        try {
          console.log("Fetching parcels for SalesOrderID:", salesOrderId);
          const fetchedParcels = await fetchSalesOrderParcels(salesOrderId);
          const mappedParcels = fetchedParcels.map((parcel) => ({
            ParcelID: parcel.SalesOrderParcelID || "Unknown",
            itemName: parcel.ItemName || "Unknown Item",
            uomName: parcel.UOMName || parcel.UOM || "-",
            quantity: parseFloat(parcel.ItemQuantity) || 0,
          }));
          setParcels(mappedParcels);
          console.log("Parcels set:", mappedParcels);
        } catch (error) {
          const errorMessage = error.response
            ? `Server error: ${error.response.status} - ${
                error.response.data?.message || error.message
              }`
            : `Failed to fetch parcels: ${error.message}`;
          console.error("Parcel fetch error:", errorMessage);
          setParcelError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        throw new Error("No Sales Order data returned");
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
    console.log("useEffect for fetchData check:", {
      salesOrderId,
      dropdownsLoaded,
      dataLoaded,
    });
    if (salesOrderId && dropdownsLoaded && !dataLoaded) {
      fetchData();
    } else if (!salesOrderId) {
      console.error("No Sales Order ID provided");
      setError("No Sales Order ID provided");
      setLoading(false);
    }
  }, [salesOrderId, dropdownsLoaded, dataLoaded, fetchData]);

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const loadSalesOrderStatus = useCallback(async () => {
    if (!salesOrderId) return;

    try {
      setLoading(true);
      const fetchedStatus = await fetchSalesOrderStatus(salesOrderId);
      console.log(
        "Fetched SalesOrder status for ID:",
        salesOrderId,
        fetchedStatus
      );
      setStatus(fetchedStatus);
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
    console.log("Cancel clicked, navigating to Sales Order");
    navigate("/sales-Order");
  };

  const handleStatusChange = async (newStatus) => {
    console.log("Sales order status changed to:", newStatus);
    setStatus(newStatus);
    await loadSalesOrderStatus();
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      setIsCreatingPO(true);
      if (!salesOrderId || isNaN(parseInt(salesOrderId, 10))) {
        throw new Error("Invalid Sales Order ID");
      }

      const { headers } = getAuthHeader();
      console.log("Creating Purchase Order for SalesOrderID:", salesOrderId);

      const payload = { salesOrderID: Number(salesOrderId) };
      const response = await axios.post(
        `${APIBASEURL}/po`,
        payload,
        { headers }
      );

      console.log("Purchase Order creation response:", {
        status: response.status,
        data: response.data,
      });
      toast.success("Purchase Order created successfully");

      navigate("/purchase-Order");
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response?.data?.message || error.message
          }`
        : `Failed to create Purchase Order: ${error.message}`;
      console.error("Error creating Purchase Order:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingPO(false);
    }
  };

  const handleApproveSalesOrder = async () => {
    try {
      setIsApproving(true);
      if (!salesOrderId || isNaN(parseInt(salesOrderId, 10))) {
        throw new Error("Invalid Sales Order ID");
      }

      console.log("Attempting to approve Sales Order ID:", salesOrderId);
      const approvalResponse = await approveSalesOrder(salesOrderId);
      console.log("Approval response:", approvalResponse);
      toast.success("Sales Order approved successfully");

      await loadSalesOrderStatus();
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response?.data?.message || error.message
          }`
        : `Failed to approve Sales Order: ${error.message}`;
      console.error("Error approving Sales Order:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ height: 24 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          An error occurred: {error}
        </Typography>
        <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!formData.Series) {
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
            height: "37px",
            gap: 2,
          }}
        >
          <Typography variant="h6">Sales Order Details</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Fade in={true} timeout={{ enter: 500 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                  borderRadius: "4px",
                  paddingRight: "10px",
                  height: "37px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <Chip
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "700",
                        fontSize: "0.9rem",
                        color:
                          theme.palette.mode === "light" ? "white" : "black",
                      }}
                    >
                      Status:
                    </Typography>
                  }
                  sx={{ backgroundColor: "transparent" }}
                />
                <StatusIndicator
                  status={status}
                  salesOrderId={salesOrderId}
                  onStatusChange={handleStatusChange}
                  readOnly={true}
                />
              </Box>
            </Fade>
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveSalesOrder}
              disabled={
                isApproving ||
                status !== "Pending" ||
                !salesOrderId ||
                isNaN(parseInt(salesOrderId, 10))
              }
              sx={{ height: "30px" }}
            >
              {isApproving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Approve"
              )}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreatePurchaseOrder}
              disabled={
                isCreatingPO ||
                status !== "Approved" ||
                !salesOrderId ||
                isNaN(parseInt(salesOrderId, 10))
              }
              sx={{ height: "30px" }}
            >
              {isCreatingPO ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Create Purchase Order"
              )}
            </Button>
          </Box>
        </Box>
      }
      onCancel={handleCancel}
      readOnly={true}
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
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Series" value={formData.Series} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Company Name" value={formData.CompanyName} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Service Type" value={formData.ServiceType} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Customer Name" value={formData.CustomerName} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Supplier Name" value={formData.SupplierName} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="External Ref No"
            value={formData.ExternalRefNo}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Order Date" value={formData.OrderDate} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Delivery Date" value={formData.DeliveryDate} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Posting Date" value={formData.PostingDate} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Required By Date"
            value={formData.RequiredByDate}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Date Received" value={formData.DateReceived} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddress}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddress}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Shipping Priority"
            value={formData.ShippingPriorityName}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currency Name" value={formData.CurrencyName} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Payment Terms" value={formData.PaymentTerms} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Payment Status"
            value={formData.PaymentStatus}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sales Amount" value={formData.SalesAmount} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Taxes and Other Charges"
            value={formData.TaxAmount}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Total" value={formData.Total} />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collect From Customer"
            value={formData.CollectFromCustomerYN}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Packaging Required"
            value={formData.PackagingRequiredYN}
          />
        </Grid>
        <Grid xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Form Completed"
            value={formData.FormCompletedYN}
          />
        </Grid>
      </Grid>

      <ParcelTab
        salesOrderId={salesOrderId}
        parcels={parcels}
        readOnly={true}
        error={parcelError}
      />
    </FormPage>
  );
};

export default SalesOrderForm;