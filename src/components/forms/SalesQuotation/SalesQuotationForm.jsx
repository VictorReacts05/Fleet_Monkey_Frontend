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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage"; // Verify: src/components/Common/FormPage.jsx
import StatusIndicator from "./StatusIndicator"; // Verify: src/components/forms/SalesQuotation/StatusIndicator.jsx
import SearchIcon from "@mui/icons-material/Search";
import APIBASEURL from "../../../utils/apiBaseUrl"; // Adjust path as needed

// API functions (to be implemented based on your backend)
const getSalesQuotationById = async (id) => {
  const response = await axios.get(`${APIBASEURL}/sales-quotation/${id}`, {
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
  });
  return response.data;
};

const fetchSalesQuotationApprovalStatus = async (id) => {
  const response = await axios.get(`${APIBASEURL}/sales-quotation/${id}/approval`, {
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
  });
  return response.data;
};

const updateSalesQuotationApproval = async (id, approved) => {
  const response = await axios.post(
    `${APIBASEURL}/sales-quotation/${id}/approval`,
    { ApprovedYN: approved },
    { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` } }
  );
  return response.data;
};

const fetchServiceTypes = async () => {
  const response = await axios.get(`${APIBASEURL}/service-types`, {
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
  });
  return response.data.data;
};

const fetchShippingPriorities = async () => {
  const response = await axios.get(`${APIBASEURL}/shipping-prioritie`, {
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
  });
  return response.data.data;
};

const fetchCurrencies = async () => {
  const response = await axios.get(`${APIBASEURL}/currencies`, {
    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
  });
  return response.data.data;
};

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

const SalesQuotationForm = ({ salesQuotationId: propSalesQuotationId, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const theme = useTheme();
  const salesQuotationId = propSalesQuotationId || id;
  const DEFAULT_COMPANY = { value: "1", label: "Dung Beetle Logistics" };

  const [formData, setFormData] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const loadSalesQuotationData = useCallback(async () => {
    if (!salesQuotationId) return;

    try {
      setLoading(true);
      setParcelLoading(true);
      setError(null);

      const response = await getSalesQuotationById(salesQuotationId);
      if (response && response.data) {
        const quotationData = response.data;
        let formattedData = {
          ...quotationData,
          DeliveryDate: quotationData.DeliveryDate ? new Date(quotationData.DeliveryDate) : null,
          PostingDate: quotationData.PostingDate ? new Date(quotationData.PostingDate) : null,
          RequiredByDate: quotationData.RequiredByDate ? new Date(quotationData.RequiredByDate) : null,
          DateReceived: quotationData.DateReceived ? new Date(quotationData.DateReceived) : null,
        };

        // Fetch additional data (addresses, service type, shipping priority, currency)
        try {
          if (quotationData.CollectionAddressID) {
            const collectionAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${quotationData.CollectionAddressID}`,
              { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` } }
            );
            if (collectionAddressResponse.data && collectionAddressResponse.data.data) {
              const addressData = collectionAddressResponse.data.data;
              formattedData.CollectionAddress = `${addressData.AddressLine1 || ""}, ${addressData.City || ""}`;
            }
          }

          if (quotationData.DestinationAddressID) {
            const destinationAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${quotationData.DestinationAddressID}`,
              { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` } }
            );
            if (destinationAddressResponse.data && destinationAddressResponse.data.data) {
              const addressData = destinationAddressResponse.data.data;
              formattedData.DestinationAddress = `${addressData.AddressLine1 || ""}, ${addressData.City || ""}`;
            }
          }

          if (quotationData.ServiceTypeID) {
            try {
              const serviceTypesResponse = await fetchServiceTypes();
              const serviceTypes = Array.isArray(serviceTypesResponse) ? serviceTypesResponse : serviceTypesResponse.data || [];
              if (Array.isArray(serviceTypes)) {
                const matchingServiceType = serviceTypes.find(
                  (s) => parseInt(s.ServiceTypeID) === parseInt(quotationData.ServiceTypeID)
                );
                formattedData.ServiceType = matchingServiceType ? matchingServiceType.ServiceType : `Unknown Service Type (${quotationData.ServiceTypeID})`;
              } else {
                formattedData.ServiceType = "Error: Invalid service types data";
              }
            } catch (error) {
              formattedData.ServiceType = "Error: Failed to fetch service type";
            }
          }

          if (quotationData.ShippingPriorityID) {
            try {
              const prioritiesResponse = await fetchShippingPriorities();
              const priorities = Array.isArray(prioritiesResponse) ? prioritiesResponse : prioritiesResponse.data || [];
              if (Array.isArray(priorities)) {
                const matchingPriority = priorities.find(
                  (p) => parseInt(p.ShippingPriorityID || p.MailingPriorityID) === parseInt(quotationData.ShippingPriorityID)
                );
                formattedData.ShippingPriorityName = matchingPriority ? matchingPriority.PriorityName : `Unknown Priority (${quotationData.ShippingPriorityID})`;
              } else {
                formattedData.ShippingPriorityName = "Error: Invalid priorities data";
              }
            } catch (error) {
              formattedData.ShippingPriorityName = "Error: Failed to fetch priority";
            }
          }

          if (quotationData.CurrencyID) {
            try {
              const currenciesResponse = await fetchCurrencies();
              const currencies = Array.isArray(currenciesResponse) ? currenciesResponse : currenciesResponse.data || [];
              if (Array.isArray(currencies)) {
                const matchingCurrency = currencies.find(
                  (c) => parseInt(c.CurrencyID) === parseInt(quotationData.CurrencyID)
                );
                formattedData.CurrencyName = matchingCurrency ? matchingCurrency.CurrencyName : "Unknown Currency";
              }
            } catch (error) {
              formattedData.CurrencyName = "Error: Failed to fetch currency";
            }
          }
        } catch (fetchError) {
          console.error("Error fetching additional data:", fetchError);
        }

        setFormData(formattedData);
        if (quotationData.parcels && Array.isArray(quotationData.parcels)) {
          setParcels(quotationData.parcels);
        }
      }
    } catch (error) {
      console.error("Error loading Sales Quotation data:", error);
      setError("Failed to load Sales Quotation data");
      toast.error("Failed to load Sales Quotation data");
    } finally {
      setLoading(false);
      setParcelLoading(false);
    }
  }, [salesQuotationId]);

  const loadApprovalStatus = useCallback(async () => {
    if (!salesQuotationId) return;
    try {
      const approvalData = await fetchSalesQuotationApprovalStatus(salesQuotationId);
      setApprovalRecord(approvalData);
      if (approvalData.exists) {
        setApprovalStatus(approvalData.ApprovedYN ? "approved" : "disapproved");
      } else {
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus(null);
    }
  }, [salesQuotationId]);

  useEffect(() => {
    if (salesQuotationId) {
      loadSalesQuotationData();
      loadApprovalStatus();
    }
  }, [salesQuotationId, loadSalesQuotationData, loadApprovalStatus]);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await axios.get(`${APIBASEURL}/suppliers`, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}` },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
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

  const handleSendSalesQuotation = async () => {
    try {
      if (selectedSuppliers.length === 0) {
        toast.warning("Please select suppliers before sending the Sales Quotation");
        handleOpenSuppliersDialog();
        return;
      }

      setConfirmMessage(
        `Are you sure you want to send this Sales Quotation to ${selectedSuppliers.length} selected suppliers? This process may take some time.`
      );
      setConfirmAction("send");
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error("Error preparing to send Sales Quotation:", error);
      toast.error("Failed to prepare sending: " + error.message);
    }
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      if (confirmAction === "approve") {
        await updateSalesQuotationApproval(salesQuotationId, true);
        toast.success("Sales Quotation approved successfully");
        setApprovalStatus("approved");
      } else if (confirmAction === "disapprove") {
        await updateSalesQuotationApproval(salesQuotationId, false);
        toast.success("Sales Quotation disapproved successfully");
        setApprovalStatus("disapproved");
      } else if (confirmAction === "send") {
        const user = JSON.parse(localStorage.getItem("user"));
        const createdByID = user?.personId || 1;
        const supplierIDs = selectedSuppliers.map((supplier) => supplier.SupplierID);

        setEmailSendingStatus({
          sending: true,
          progress: 0,
          totalSuppliers: supplierIDs.length,
          completedSuppliers: 0,
        });

        const toastId = toast.info(
          `Sending Quotation to ${supplierIDs.length} suppliers. This may take some time...`,
          { autoClose: false }
        );

        const emailData = {
          salesQuotationID: parseInt(salesQuotationId, 10),
          supplierIDs: supplierIDs,
          createdByID: createdByID,
        };

        const response = await axios.post(
          `${APIBASEURL}/sales-quotation/send-quotation`,
          emailData,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );

        toast.update(toastId, {
          render: "Email sending process completed!",
          type: "success",
          autoClose: 5000,
        });

        let successCount = 0;
        let failCount = 0;
        if (response.data && response.data.success && Array.isArray(response.data.results)) {
          response.data.results.forEach((result) => {
            const supplier = selectedSuppliers.find((s) => s.SupplierID === result.supplierID);
            const supplierName = supplier?.SupplierName || `Supplier ID ${result.supplierID}`;

            if (result.success) {
              successCount++;
              console.log(`Success for ${supplierName}: Quotation ID ${result.supplierQuotationID}`);
            } else {
              failCount++;
              toast.warning(`Failed for ${supplierName}: ${result.message}`);
            }
          });

          if (successCount > 0) {
            toast.success(`Sent emails to ${successCount} suppliers successfully`);
          }
          if (failCount > 0) {
            toast.warning(`Failed to send to ${failCount} suppliers`);
          }
        } else {
          throw new Error(response.data?.message || "Invalid response from server");
        }

        setEmailSendingStatus({
          sending: false,
          progress: 100,
          totalSuppliers: supplierIDs.length,
          completedSuppliers: supplierIDs.length,
        });
      }
    } catch (error) {
      console.error("Error in handleConfirmAction:", error);
      toast.error(`An error occurred: ${error.response?.data?.message || error.message}`);
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
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No data available for this Sales Quotation.</Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Typography variant="h6">View Sales Quotation</Typography>
            {salesQuotationId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  background: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                  borderRadius: "4px",
                  padding: "0px 10px",
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
                  salesQuotationId={salesQuotationId}
                  onStatusChange={handleStatusChange}
                  readOnly={formData.Status === "Approved"}
                />
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenSuppliersDialog}
              disabled={formData.Status !== "Approved"}
              sx={{
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.3)" },
                marginLeft: "24px",
              }}
            >
              Select Suppliers
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSendSalesQuotation}
              disabled={formData.Status !== "Approved" || selectedSuppliers.length === 0}
              sx={{
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.3)" },
                position: "relative",
              }}
            >
              {emailSendingStatus.sending ? (
                <>
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{ position: "absolute", left: "50%", marginLeft: "-12px" }}
                  />
                  <span style={{ visibility: "hidden" }}>Send</span>
                </>
              ) : (
                "Send"
              )}
            </Button>
          </Box>
        </Box>
      }
      onCancel={onClose || (() => navigate("/sales-quotation"))}
      loading={loading}
      readOnly={true}
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
            Sending Quotation to suppliers... This may take some time.
          </Typography>
          <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
            <CircularProgress variant="indeterminate" size={24} sx={{ mr: 2 }} />
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
        {salesQuotationId && (
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid>
        )}
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Company" value={formData.CompanyName || DEFAULT_COMPANY.label} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Service Type" value={formData.ServiceType || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Customer" value={formData.CustomerName || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Supplier" value={formData.SupplierName || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="External Ref No." value={formData.ExternalRefNo || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Delivery Date" value={formData.DeliveryDate} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Posting Date" value={formData.PostingDate} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Required By Date" value={formData.RequiredByDate} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Date Received" value={formData.DateReceived} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Collection Address" value={formData.CollectionAddress || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Destination Address" value={formData.DestinationAddress || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Shipping Priority" value={formData.ShippingPriorityName || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currency" value={formData.CurrencyName || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sales Amount" value={formData.SalesAmount} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Taxes and Other Charges" value={formData.TaxAmount} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Total" value={formData.Total} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Collect From Customer" value={formData.CollectFromCustomerYN} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Packaging Required" value={formData.PackagingRequiredYN} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Form Completed" value={formData.FormCompletedYN} />
        </Grid>
      </Grid>

      {parcels.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Items
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#1976d2",
                  height: "56px",
                }}
              >
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "white", py: 2 }}>
                    Sr. No.
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "white", py: 2 }}>
                    Item
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "white", py: 2 }}>
                    UOM
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "white", py: 2 }}>
                    Quantity
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parcelLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  parcels.map((parcel, index) => (
                    <TableRow
                      key={parcel.ParcelID || index}
                      sx={{
                        height: "52px",
                        "&:nth-of-type(odd)": { backgroundColor: alpha("#1976d2", 0.05) },
                        "&:hover": {
                          backgroundColor: alpha("#1976d2", 0.1),
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{parcel.Description || `Parcel #${parcel.ParcelID}`}</TableCell>
                      <TableCell align="center">{parcel.uomName || "Unit"}</TableCell>
                      <TableCell align="center">{parcel.Quantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Items
          </Typography>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
              borderRadius: "8px",
              backgroundColor: alpha("#f5f5f5", 0.7),
            }}
          >
            No parcels found for this Sales Quotation.
          </Paper>
        </Box>
      )}

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
              placeholder="Search suppliers..."
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
                            backgroundColor: isSelected ? alpha("#1976d2", 0.1) : "transparent",
                            "&:hover": {
                              backgroundColor: isSelected
                                ? alpha("#1976d2", 0.2)
                                : alpha("#1976d2", 0.05),
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
                            secondary={supplier.ContactPerson || "No contact person"}
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
                Note: Email sending may take several minutes depending on the number of suppliers. Please do not close this page during the process.
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
    </FormPage>
  );
};

export default SalesQuotationForm;