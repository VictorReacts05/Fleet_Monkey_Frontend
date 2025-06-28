import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  alpha,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormPage from "../../common/FormPage";
import StatusIndicator from "./StatusIndicator";
import SearchIcon from "@mui/icons-material/Search";
import APIBASEURL from "../../../utils/apiBaseUrl";
import axios from "axios";
import {
  fetchSalesInvoiceById,
  fetchSalesInvoiceItems,
  fetchCurrencies,
  fetchServiceTypes,
  fetchShippingPriorities,
} from "./SalesInvoiceAPI";
import SalesInvoiceParcelsTab from "./SalesInvoiceParcelTab";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;

  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (typeof value === "number") {
    displayValue = value.toFixed(2);
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

const SalesInvoiceForm = ({
  salesInvoiceId: propSalesInvoiceId,
  onClose,
  readOnly = true,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const salesInvoiceId = propSalesInvoiceId || id;

  const [formData, setFormData] = useState({
    Series: "",
    CompanyID: "",
    SupplierID: "",
    CustomerID: "",
    ExternalRefNo: "",
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
    DestinationWarehouse: "", // Added
    DestinationWarehouseAddressID: "", // Added
    OriginWarehouse: "", // Added
    OriginWarehouseAddressID: "", // Added
    ShippingPriorityID: "",
    ShippingPriorityName: "",
    Terms: "",
    CurrencyID: "",
    CurrencyName: "",
    CollectFromSupplierYN: false,
    PackagingRequiredYN: false,
    FormCompletedYN: false,
    SalesAmount: 0,
    TaxesAndOtherCharges: 0,
    Total: 0,
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [suppliersDialogOpen, setSuppliersDialogOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState({
    sending: false,
    progress: 0,
    totalSuppliers: 0,
    completedSuppliers: 0,
  });

  const loadSalesInvoiceData = useCallback(async () => {
    if (!salesInvoiceId) return;

    try {
      setLoading(true);
      const response = await fetchSalesInvoiceById(salesInvoiceId);
      if (response) {
        let formattedData = {
          ...response,
          DeliveryDate: response.DeliveryDate
            ? new Date(response.DeliveryDate)
            : null,
          PostingDate: response.PostingDate
            ? new Date(response.PostingDate)
            : null,
          RequiredByDate: response.RequiredByDate
            ? new Date(response.RequiredByDate)
            : null,
          DateReceived: response.DateReceived
            ? new Date(response.DateReceived)
            : null,
          ServiceType: "Unknown Service Type",
          DestinationWarehouse: "", // Added
          DestinationWarehouseAddressID: response.DestinationWarehouseAddressID || "", // Added
          OriginWarehouse: "", // Added
          OriginWarehouseAddressID: response.OriginWarehouseAddressID || "", // Added
        };

        // Fetch additional data
        try {
          // Fetch Collection Address
          if (response.CollectionAddressID) {
            const collectionAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${response.CollectionAddressID}`,
              {
                headers: {
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("user"))?.personId
                  }`,
                },
              }
            );
            if (collectionAddressResponse.data?.data) {
              const addressData = collectionAddressResponse.data.data;
              formattedData.CollectionAddress = `${
                addressData.AddressLine1 || ""
              }, ${addressData.City || ""}`.trim() || "-";
            }
          }

          // Fetch Destination Address
          if (response.DestinationAddressID) {
            const destinationAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${response.DestinationAddressID}`,
              {
                headers: {
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("user"))?.personId
                  }`,
                },
              }
            );
            if (destinationAddressResponse.data?.data) {
              const addressData = destinationAddressResponse.data.data;
              formattedData.DestinationAddress = `${
                addressData.AddressLine1 || ""
              }, ${addressData.City || ""}`.trim() || "-";
            }
          }

          // Fetch Destination Warehouse
          if (response.DestinationWarehouseAddressID) {
            try {
              const destinationWarehouseResponse = await axios.get(
                `${APIBASEURL}/addresses/${response.DestinationWarehouseAddressID}`,
                {
                  headers: {
                    Authorization: `Bearer ${
                      JSON.parse(localStorage.getItem("user"))?.personId
                    }`,
                  },
                }
              );
              if (destinationWarehouseResponse.data?.data) {
                const warehouseData = destinationWarehouseResponse.data.data;
                formattedData.DestinationWarehouse = `${
                  warehouseData.AddressLine1 || ""
                }, ${warehouseData.City || ""}`.trim() || "-";
              }
            } catch (error) {
              console.error("Error fetching Destination Warehouse:", error);
              formattedData.DestinationWarehouse = "-";
            }
          }

          // Fetch Origin Warehouse
          if (response.OriginWarehouseAddressID) {
            try {
              const originWarehouseResponse = await axios.get(
                `${APIBASEURL}/addresses/${response.OriginWarehouseAddressID}`,
                {
                  headers: {
                    Authorization: `Bearer ${
                      JSON.parse(localStorage.getItem("user"))?.personId
                    }`,
                  },
                }
              );
              if (originWarehouseResponse.data?.data) {
                const warehouseData = originWarehouseResponse.data.data;
                formattedData.OriginWarehouse = `${
                  warehouseData.AddressLine1 || ""
                }, ${warehouseData.City || ""}`.trim() || "-";
              }
            } catch (error) {
              console.error("Error fetching Origin Warehouse:", error);
              formattedData.OriginWarehouse = "-";
            }
          }

          // Fetch Shipping Priority
          if (response.ShippingPriorityID) {
            try {
              const prioritiesResponse = await fetchShippingPriorities();
              const priorities = Array.isArray(prioritiesResponse)
                ? prioritiesResponse
                : prioritiesResponse.data || [];
              const matchingPriority = priorities.find(
                (p) =>
                  parseInt(p.ShippingPriorityID || p.MailingPriorityID) ===
                  parseInt(response.ShippingPriorityID)
              );
              formattedData.ShippingPriorityName =
                matchingPriority?.PriorityName ||
                `Unknown Priority (${response.ShippingPriorityID})`;
            } catch (priorityError) {
              console.error(
                "Failed to fetch shipping priority:",
                priorityError
              );
              formattedData.ShippingPriorityName = `Error: Failed to fetch priority`;
            }
          }

          // Fetch Service Type
          if (response.ServiceTypeID) {
            try {
              const serviceTypesResponse = await fetchServiceTypes();
              const serviceTypes = Array.isArray(serviceTypesResponse)
                ? serviceTypesResponse
                : serviceTypesResponse.data || [];
              const matchingServiceType = serviceTypes.find(
                (s) =>
                  parseInt(s.ServiceTypeID) === parseInt(response.ServiceTypeID)
              );
              formattedData.ServiceType =
                matchingServiceType?.ServiceType ||
                `Unknown Service Type (${response.ServiceTypeID})`;
            } catch (serviceTypeError) {
              console.error("Failed to fetch service type:", serviceTypeError);
              formattedData.ServiceType = `Error: Failed to fetch service type (${response.ServiceTypeID})`;
            }
          }

          // Fetch Currency
          if (response.CurrencyID) {
            try {
              const currenciesResponse = await fetchCurrencies();
              const currencies = Array.isArray(currenciesResponse)
                ? currenciesResponse
                : currenciesResponse.data || [];
              const matchingCurrency = currencies.find(
                (c) => parseInt(c.CurrencyID) === parseInt(response.CurrencyID)
              );
              formattedData.CurrencyName =
                matchingCurrency?.CurrencyName ||
                `Unknown Currency (${response.CurrencyID})`;
            } catch (currencyError) {
              console.error("Failed to fetch currency:", currencyError);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching additional data:", fetchError);
        }

        setFormData(formattedData);

        // Fetch items
        const itemsData = await fetchSalesInvoiceItems(salesInvoiceId);
        setItems(itemsData);
      }
    } catch (error) {
      console.error("Error loading Sales Invoice data:", error);
      console.log("Failed to load Sales Invoice data");
    } finally {
      setLoading(false);
    }
  }, [salesInvoiceId]);

  const loadApprovalStatus = useCallback(async () => {
    if (!salesInvoiceId) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.personId) {
        throw new Error("No user found in localStorage");
      }

      const response = await axios.get(
        `${APIBASEURL}/salesInvoiceApproval/${salesInvoiceId}/${user.personId}`,
        {
          headers: {
            Authorization: `Bearer ${user.personId}`,
          },
        }
      );
      setApprovalRecord(response.data);

      if (response.data.success && response.data.data) {
        const approved =
          Number(response.data.data.ApprovedStatus) === 1 ||
          response.data.data.ApprovedStatus === "true";
        setApprovalStatus(approved ? "approved" : "disapproved");
      } else {
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus(null);
    }
  }, [salesInvoiceId]);

  useEffect(() => {
    if (salesInvoiceId) {
      loadSalesInvoiceData();
      loadApprovalStatus();
    }
  }, [salesInvoiceId, loadSalesInvoiceData, loadApprovalStatus]);

  const handleItemsChange = (updatedItems) => {
    setItems(updatedItems);
  };

  const handleRefreshApprovals = () => {
    fetchSalesInvoiceById(); // Re-fetch data, including approvalStatus
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await axios.get(`${APIBASEURL}/suppliers`, {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user"))?.personId
          }`,
        },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      console.log("Failed to load suppliers");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleOpenSuppliersDialog = () => {
    fetchSuppliers();
    setSuppliersDialogOpen(true);
  };

  const handleCloseSuppliersDialog = () => {
    setSuppliersDialogOpen(false);
  };

  const handleSupplierToggle = (supplier) => {
    const currentIndex = selectedSuppliers.findIndex(
      (s) => s.SupplierID === supplier.SupplierID
    );
    const newSelectedSuppliers = [...selectedSuppliers];

    if (currentIndex === -1) {
      newSelectedSuppliers.push(supplier);
    } else {
      newSelectedSuppliers.splice(currentIndex, 1);
    }

    setSelectedSuppliers(newSelectedSuppliers);
  };

  const handleConfirmSupplierSelection = () => {
    toast.success(`Selected ${selectedSuppliers.length} suppliers`);
    handleCloseSuppliersDialog();
  };

  const handleSendSalesInvoice = async () => {
    try {
      if (selectedSuppliers.length === 0) {
        toast.warning(
          "Please select suppliers before sending the Sales Invoice"
        );
        handleOpenSuppliersDialog();
        return;
      }

      setConfirmMessage(
        `Are you sure you want to send this Sales Invoice to ${selectedSuppliers.length} selected suppliers? This process may take some time.`
      );
      setConfirmAction("send");
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error("Error preparing to send Sales Invoice:", error);
      console.log("Failed to prepare sending: " + error.message);
    }
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      if (confirmAction === "approve") {
        const response = await axios.post(
          `${APIBASEURL}/salesInvoice/approve`,
          { SalesInvoiceID: parseInt(salesInvoiceId, 10) },
          {
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("user"))?.personId
              }`,
            },
          }
        );
        if (response.data.success) {
          toast.success("Sales Invoice approved successfully");
          setApprovalStatus("approved");
          await loadApprovalStatus();
        } else {
          throw new Error(response.data.message || "Approval failed");
        }
      } else if (confirmAction === "disapprove") {
        const response = await axios.post(
          `${APIBASEURL}/salesInvoice/disapprove`,
          { SalesInvoiceID: parseInt(salesInvoiceId, 10) },
          {
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("user"))?.personId
              }`,
            },
          }
        );
        if (response.data.success) {
          toast.success("Sales Invoice disapproved successfully");
          setApprovalStatus("disapproved");
          await loadApprovalStatus();
        } else {
          throw new Error(response.data.message || "Disapproval failed");
        }
      } else if (confirmAction === "send") {
        const user = JSON.parse(localStorage.getItem("user"));
        const createdByID = user?.personId || 1;
        const supplierIDs = selectedSuppliers.map(
          (supplier) => supplier.SupplierID
        );

        setEmailSendingStatus({
          sending: true,
          progress: 0,
          totalSuppliers: supplierIDs.length,
          completedSuppliers: 0,
        });

        const toastId = toast.info(
          `Sending Invoice to ${supplierIDs.length} suppliers. This may take some time...`,
          { autoClose: false }
        );

        const emailData = {
          salesInvoiceID: parseInt(salesInvoiceId, 10),
          supplierIDs: supplierIDs,
          createdByID: createdByID,
        };

        const response = await axios.post(
          `${APIBASEURL}/invoice-sent/send-invoice`,
          emailData,
          {
            headers: {
              Authorization: `Bearer ${user?.personId}`,
            },
          }
        );

        toast.update(toastId, {
          render: "Email sending process completed!",
          type: "success",
          autoClose: 5000,
        });

        const results = [];
        let successCount = 0;
        let failCount = 0;

        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.results)
        ) {
          response.data.results.forEach((result) => {
            const supplier = selectedSuppliers.find(
              (s) => s.SupplierID === result.supplierID
            );
            const supplierName =
              supplier?.SupplierName || `Supplier ID ${result.supplierID}`;

            if (result.success) {
              successCount++;
            } else {
              failCount++;
              toast.warning(`Failed for ${supplierName}: ${result.message}`);
            }

            results.push({
              supplierID: result.supplierID,
              supplierName: supplierName,
              success: result.success,
              message: result.message,
              emailSent: result.success,
              emailMessage: result.message,
            });
          });

          if (successCount > 0) {
            toast.success(
              `Sent invoice to ${successCount} suppliers successfully`
            );
          }

          if (failCount > 0) {
            toast.warning(`Failed to send invoice to ${failCount} suppliers`);
          }
        } else {
          throw new Error(
            response.data?.message || "Invalid response from server"
          );
        }

        setEmailSendingStatus({
          sending: false,
          progress: 100,
          totalSuppliers: supplierIDs.length,
          completedSuppliers: supplierIDs.length,
        });
      }
    } catch (error) {
      console.error("Error in handleConfirmAction:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      console.log(`An error occurred: ${error.response?.data?.message || error.message}`);
      setEmailSendingStatus({
        sending: false,
        progress: 0,
        totalSuppliers: 0,
        completedSuppliers: 0,
      });
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      Status: newStatus,
    }));
    setConfirmAction(newStatus.toLowerCase());
    setConfirmMessage(
      `Are you sure you want to ${newStatus.toLowerCase()} this Sales Invoice?`
    );
    setConfirmDialogOpen(false);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/sales-invoice");
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Typography variant="h6">
              {readOnly ? "View Invoice" : "Edit Invoice"}
            </Typography>
            {salesInvoiceId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  background:
                    theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                  borderRadius: "4px",
                  padding: "0px 10px",
                  height: "37px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease-in-out",
                  marginLeft: "16px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "700",
                    marginRight: "8px",
                    color: theme.palette.mode === "light" ? "white" : "black",
                    fontSize: "0.9rem",
                  }}
                >
                  Status:
                </Typography>
                <StatusIndicator
                  status={formData.Status}
                  salesInvoiceId={salesInvoiceId}
                  onStatusChange={handleStatusChange}
                  readOnly={formData.Status === "Approved"}
                />
              </Box>
            )}
          </Box>
        </Box>
      }
      onCancel={handleCancel}
      loading={loading}
      readOnly={readOnly}
    >
      {emailSendingStatus.sending && (
        <Box
          sx={{
            width: "100%",
            mb: 3,
            p: 2,
            bgcolor: "info.light",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, color: "info.dark", fontWeight: "bold" }}
          >
            Sending Invoice to suppliers... This may take some time.
          </Typography>
          <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
            <CircularProgress
              variant="indeterminate"
              size={24}
              sx={{ mr: 2 }}
            />
            <Typography variant="body2">
              Please wait while we process your request. Do not close this page.
            </Typography>
          </Box>
        </Box>
      )}

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
        {salesInvoiceId && (
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid>
        )}
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Company" value={formData.CompanyName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Service Type" value={formData.ServiceType} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Customer" value={formData.CustomerName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Supplier" value={formData.SupplierName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="External Ref No"
            value={formData.ExternalRefNo}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Delivery Date" value={formData.DeliveryDate} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Posting Date" value={formData.PostingDate} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Required By Date"
            value={formData.RequiredByDate}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Date Received" value={formData.DateReceived} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddress}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddress}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Origin Warehouse"
            value={formData.OriginWarehouse}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Warehouse"
            value={formData.DestinationWarehouse}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Shipping Priority"
            value={formData.ShippingPriorityName}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currency" value={formData.CurrencyName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sales Amount" value={formData.SalesAmount} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Taxes and Other Charges"
            value={formData.TaxesAndOtherCharges}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Total" value={formData.Total} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collect From Supplier"
            value={formData.CollectFromSupplierYN}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Packaging Required"
            value={formData.PackagingRequiredYN}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Form Completed"
            value={formData.FormCompletedYN}
          />
        </Grid>
      </Grid>

      <Dialog
        open={suppliersDialogOpen}
        onClose={handleCloseSuppliersDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" component="div">
            Select Suppliers
          </Typography>
          {selectedSuppliers.length > 0 && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {selectedSuppliers.length} suppliers selected
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search Text..."
              value={supplierSearchTerm}
              onChange={(e) => setSupplierSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Box>
          {loadingSuppliers ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                maxHeight: "400px",
                overflow: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              {suppliers.length > 0 ? (
                suppliers
                  .filter((supplier) =>
                    supplier.SupplierName?.toLowerCase().includes(
                      supplierSearchTerm.toLowerCase()
                    )
                  )
                  .map((supplier) => {
                    const isSelected = selectedSuppliers.some(
                      (s) => s.SupplierID === supplier.SupplierID
                    );
                    return (
                      <React.Fragment key={supplier.SupplierID}>
                        <ListItem
                          button
                          onClick={() => handleSupplierToggle(supplier)}
                          sx={{
                            backgroundColor: isSelected
                              ? theme.palette.primary.light
                              : "transparent",
                            "&:hover": {
                              backgroundColor: isSelected
                                ? theme.palette.primary.main
                                : theme.palette.action.hover,
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={supplier.SupplierName}
                            secondary={
                              supplier.ContactPerson || "No contact person"
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })
              ) : (
                <ListItem>
                  <ListItemText primary="No suppliers found" />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuppliersDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmSupplierSelection}
            variant="contained"
            color="primary"
            disabled={selectedSuppliers.length === 0}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmMessage}
            {confirmAction === "send" && (
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ mt: 2, fontWeight: "medium" }}
              >
                Note: Email sending may take several minutes depending on the
                number of suppliers. Please do not close this page during the
                process.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            autoFocus
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <SalesInvoiceParcelsTab
        salesInvoiceId={salesInvoiceId}
        onItemsChange={handleItemsChange}
        readOnly={readOnly}
        refreshApprovals={handleRefreshApprovals}
      />
    </FormPage>
  );
};

export default SalesInvoiceForm;