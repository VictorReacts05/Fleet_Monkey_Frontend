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
} from "@mui/material";
import {
  getPurchaseRFQById,
  fetchSalesRFQs,
  fetchPurchaseRFQApprovalStatus,
  approvePurchaseRFQ,
  fetchServiceTypes,
  fetchShippingPriorities,
  fetchCurrencies,
} from "./PurchaseRFQAPI";
import { toast } from "react-toastify";
import FormPage from "../../common/FormPage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StatusIndicator from "./StatusIndicator";
import SearchIcon from "@mui/icons-material/Search";
import APIBASEURL from "../../../utils/apiBaseUrl";
import PurchaseRFQParcelTab from "./PurchaseRFQParcelTab";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;

  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
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

const PurchaseRFQForm = ({
  purchaseRFQId: propPurchaseRFQId,
  onClose,
  onSave,
  readOnly = true,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const DEFAULT_COMPANY = { value: "1", label: "Dung Beetle Logistics" };
  const purchaseRFQId = propPurchaseRFQId || id;
  const theme = useTheme();

  const [formData, setFormData] = useState({
    Series: "",
    SalesRFQID: "",
    CompanyID: DEFAULT_COMPANY.value,
    CustomerID: "",
    SupplierID: "",
    SupplierName: "",
    ExternalRefNo: "",
    DeliveryDate: null,
    PostingDate: null,
    RequiredByDate: null,
    DateReceived: null,
    ServiceTypeID: "",
    ServiceType: "",
    CollectionAddressID: "",
    DestinationAddressID: "",
    ShippingPriorityID: "",
    ShippingPriorityName: "",
    Terms: "",
    CurrencyID: "",
    CurrencyName: "",
    CollectFromSupplierYN: false,
    PackagingRequiredYN: false,
    FormCompletedYN: false,
  });
  const [parcels, setParcels] = useState([]);
  const [salesRFQs, setSalesRFQs] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Supplier selection state
  const [suppliersDialogOpen, setSuppliersDialogOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [parcelLoading, setParcelLoading] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState({
    sending: false,
    progress: 0,
    totalSuppliers: 0,
    completedSuppliers: 0,
  });

  const loadPurchaseRFQData = useCallback(async () => {
    if (!purchaseRFQId) return;

    try {
      setLoading(true);
      setParcelLoading(true);

      const response = await getPurchaseRFQById(purchaseRFQId);
      if (response && response.data) {
        const rfqData = response.data;
        let formattedData = {
          ...rfqData,
          Series: rfqData.Series
            ? rfqData.Series.replace("Pur-RFQ", "Quot-Request")
            : rfqData.Series || "-",
          DeliveryDate: rfqData.DeliveryDate
            ? new Date(rfqData.DeliveryDate)
            : null,
          PostingDate: rfqData.PostingDate
            ? new Date(rfqData.PostingDate)
            : null,
          RequiredByDate: rfqData.RequiredByDate
            ? new Date(rfqData.RequiredByDate)
            : null,
          DateReceived: rfqData.DateReceived
            ? new Date(rfqData.DateReceived)
            : null,
          SalesRFQID: rfqData.SalesRFQID ? rfqData.SalesRFQID.toString() : "",
          ServiceType: "Unknown Service Type", // Default
        };

        try {
          // Fetch Collection Address
          if (rfqData.CollectionAddressID) {
            const collectionAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${rfqData.CollectionAddressID}`,
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
              },
            ${addressData.City || ""}`;
            }
          }

          // Fetch Destination Address
          if (rfqData.DestinationAddressID) {
            const destinationAddressResponse = await axios.get(
              `${APIBASEURL}/addresses/${rfqData.DestinationAddressID}`,
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
              }, ${addressData.City || ""}`;
            }
          }

          // Fetch Shipping Priority
          if (rfqData.ShippingPriorityID) {
            try {
              const prioritiesResponse = await fetchShippingPriorities();
              const priorities = Array.isArray(prioritiesResponse)
                ? prioritiesResponse
                : prioritiesResponse.data || [];
              const matchingPriority = priorities.find(
                (p) =>
                  parseInt(p.ShippingPriorityID || p.MailingPriorityID) ===
                  parseInt(rfqData.ShippingPriorityID)
              );
              formattedData.ShippingPriorityName =
                matchingPriority?.PriorityName ||
                `Unknown Priority (${rfqData.ShippingPriorityID})`;
            } catch (priorityError) {
              console.error(
                "Failed to fetch shipping priority:",
                priorityError
              );
              formattedData.ShippingPriorityName = `Error: Failed to fetch priority`;
            }
          }

          // Fetch Service Type
          if (rfqData.ServiceTypeID) {
            try {
              const serviceTypesResponse = await fetchServiceTypes();
              console.log("Service Types Response:", serviceTypesResponse);
              const serviceTypes = Array.isArray(serviceTypesResponse)
                ? serviceTypesResponse
                : serviceTypesResponse.data || [];
              const matchingServiceType = serviceTypes.find(
                (s) =>
                  parseInt(s.ServiceTypeID) === parseInt(rfqData.ServiceTypeID)
              );
              formattedData.ServiceType =
                matchingServiceType?.ServiceType ||
                `Unknown Service Type (${rfqData.ServiceTypeID})`;
            } catch (serviceTypeError) {
              console.error("Failed to fetch service type:", serviceTypeError);
              formattedData.ServiceType = `Error: Failed to fetch service type (${rfqData.ServiceTypeID})`;
            }
          }

          // Fetch Currency
          if (rfqData.CurrencyID) {
            try {
              const currenciesResponse = await fetchCurrencies();
              const currencies = Array.isArray(currenciesResponse)
                ? currenciesResponse
                : currenciesResponse.data || [];
              const matchingCurrency = currencies.find(
                (c) => parseInt(c.CurrencyID) === parseInt(rfqData.CurrencyID)
              );
              formattedData.CurrencyName =
                matchingCurrency?.CurrencyName ||
                `Unknown Currency (${rfqData.CurrencyID})`;
            } catch (currencyError) {
              console.error("Failed to fetch currency:", currencyError);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching additional data:", fetchError);
        }

        setFormData(formattedData);
        if (rfqData.parcels && Array.isArray(rfqData.parcels)) {
          setParcels(rfqData.parcels);
        }
      }

      const salesRFQsData = await fetchSalesRFQs();
      if (salesRFQsData && Array.isArray(salesRFQsData)) {
        const formattedSalesRFQs = salesRFQsData.map((rfq) => ({
          value: rfq.SalesRFQID.toString(),
          // label: rfq.Series || `Sales RFQ #${rfq.SalesRFQID}`,
          label: rfq.Series
            ? rfq.Series.replace("Sales-RFQ", "Inquiry")
            : `Inquiry #${rfq.SalesRFQID}`,
        }));
        setSalesRFQs(formattedSalesRFQs);
      }
    } catch (error) {
      console.error("Error loading Purchase RFQ data:", error);
      toast.error("Failed to load Purchase RFQ data");
    } finally {
      setLoading(false);
      setParcelLoading(false);
    }
  }, [purchaseRFQId]);

  useEffect(() => {
    if (purchaseRFQId) {
      loadPurchaseRFQData();
    }
  }, [purchaseRFQId, loadPurchaseRFQData]);

  useEffect(() => {
    handleConfirmAction();
  }, [confirmAction]);

  const loadApprovalStatus = useCallback(async () => {
    if (!purchaseRFQId) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.personId) {
        throw new Error("No user found in localStorage");
      }

      const approvalData = await fetchPurchaseRFQApprovalStatus(purchaseRFQId);
      console.log("Approval data in form:", approvalData);
      setApprovalRecord(approvalData);

      if (approvalData.success && approvalData.data) {
        const approved =
          Number(approvalData.data.ApprovedStatus) === 1 ||
          approvalData.data.ApprovedStatus === "true";
        setApprovalStatus(approved ? "approved" : "disapproved");
      } else {
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus(null);
    }
  }, [purchaseRFQId]);

  useEffect(() => {
    if (purchaseRFQId) {
      loadApprovalStatus();
    }
  }, [purchaseRFQId, loadApprovalStatus]);

  const addSupplier = async (supplierData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.post(
        `${APIBASEURL}/suppliers`,
        supplierData,
        {
          headers: {
            Authorization: `Bearer ${user?.personId}`,
          },
        }
      );
      toast.success("Supplier added successfully");
      await fetchSuppliers();
      return response.data.data;
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier: " + error.message);
      throw error;
    }
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      if (confirmAction === "approve") {
        const response = await approvePurchaseRFQ(purchaseRFQId, true);
        if (response.success) {
          toast.success("Purchase RFQ approved successfully");
          setApprovalStatus("approved");
          await loadApprovalStatus(); // Refresh approval status
        } else {
          throw new Error(response.message || "Approval failed");
        }
      } else if (confirmAction === "disapprove") {
        const response = await approvePurchaseRFQ(purchaseRFQId, false);
        if (response.success) {
          toast.success("Purchase RFQ disapproved successfully");
          setApprovalStatus("disapproved");
          await loadApprovalStatus(); // Refresh approval status
        } else {
          throw new Error(response.message || "Disapproval failed");
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
          `Sending RFQ to ${supplierIDs.length} suppliers. This may take some time...`,
          { autoClose: false }
        );

        const emailData = {
          purchaseRFQID: parseInt(purchaseRFQId, 10),
          supplierIDs: supplierIDs,
          createdByID: createdByID,
        };

        const response = await axios.post(
          `${APIBASEURL}/rfqsent/send-rfq`,
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
              supplierQuotationID: result.supplierQuotationID,
              emailSent: result.success,
              emailMessage: result.message,
            });
          });

          if (successCount > 0) {
            toast.success(
              `Created ${successCount} supplier quotations and sent emails successfully`
            );
          }

          if (failCount > 0) {
            toast.warning(
              `Failed to process ${failCount} supplier quotations/emails`
            );
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
      toast.error(
        `An error occurred: ${error.response?.data?.message || error.message}`
      );
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

  const handleSendPurchaseRFQ = async () => {
    try {
      if (selectedSuppliers.length === 0) {
        toast.warning(
          "Please select suppliers before sending the Purchase RFQ"
        );
        handleOpenSuppliersDialog();
        return;
      }

      setConfirmMessage(
        `Are you sure you want to send this Purchase RFQ to ${selectedSuppliers.length} selected suppliers and create their quotations? This process may take some time.`
      );
      setConfirmAction("send");
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error("Error preparing to send Purchase RFQ:", error);
      toast.error("Failed to prepare sending: " + error.message);
    }
  };

  const handleParcelsChange = (newParcels) => {
    setParcels(newParcels);
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
            <Typography variant="h6">View Quotation Request</Typography>
            {purchaseRFQId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  background:
                    useTheme().palette.mode === "dark" ? "#90caf9" : "#1976d2",
                  borderRadius: "4px",
                  padding: "0px 10px",
                  height: "37px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "700",
                    marginRight: "8px",
                    color:
                      useTheme().palette.mode === "light" ? "white" : "black",
                    fontSize: "0.9rem",
                  }}
                >
                  Status:{" "}
                </Typography>
                <StatusIndicator
                  status={formData.Status}
                  purchaseRFQId={purchaseRFQId}
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
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                },
                marginLeft: "24px",
              }}
            >
              Select Suppliers
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSendPurchaseRFQ}
              disabled={
                formData.Status !== "Approved" || selectedSuppliers.length === 0
              }
              sx={{
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                },
                position: "relative",
              }}
            >
              {emailSendingStatus.sending ? (
                <>
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      marginLeft: "-12px",
                    }}
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
      onCancel={onClose || (() => navigate("/purchase-rfq"))}
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
            Sending RFQ to suppliers... This may take some time.
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
        {/* {purchaseRFQId && (
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid>
        )} */}
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Company"
            value={formData.CompanyName || DEFAULT_COMPANY.label}
          />
        </Grid>
        {/* changes sales rfq to inquiry */}
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Inquiry"
            value={
              salesRFQs.find((s) => s.value === formData.SalesRFQID?.toString())
                ?.label ||
              (formData.SalesRFQID ? `Sales RFQ #${formData.SalesRFQID}` : "-")
            }
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Service Type"
            value={formData.ServiceType || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Customer Name"
            value={formData.CustomerName || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="External Ref No."
            value={formData.ExternalRefNo || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Delivery Date"
            value={
              formData.DeliveryDate
                ? formData.DeliveryDate.toLocaleDateString()
                : "-"
            }
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Posting Date"
            value={
              formData.PostingDate
                ? formData.PostingDate.toLocaleDateString()
                : "-"
            }
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Required By Date"
            value={
              formData.RequiredByDate
                ? formData.RequiredByDate.toLocaleDateString()
                : "-"
            }
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Date Received"
            value={
              formData.DateReceived
                ? formData.DateReceived.toLocaleDateString()
                : "-"
            }
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddressID || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddressID || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Shipping Priority"
            value={formData.ShippingPriorityName || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms || "-"} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Currency"
            value={formData.CurrencyName || "-"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collect From Supplier"
            value={formData.CollectFromSupplierYN ? "Yes" : "No"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Packaging Required"
            value={formData.PackagingRequiredYN ? "Yes" : "No"}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Form Completed"
            value={formData.FormCompletedYN ? "Yes" : "No"}
          />
        </Grid>
      </Grid>

      <PurchaseRFQParcelTab
        purchaseRFQId={purchaseRFQId}
        onParcelsChange={handleParcelsChange}
        readOnly={readOnly || formData.Status === "Approved"}
      />

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
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            px: 2,
                            backgroundColor: isSelected
                              ? theme.palette.action.selected
                              : "transparent",
                            transition: "background-color 0.3s",
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                              "& .MuiListItemText-primary": {
                                color: theme.palette.primary.main,
                                fontWeight: "bold",
                              },
                              "& .MuiCheckbox-root": {
                                color: theme.palette.primary.main,
                              },
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
    </FormPage>
  );
};

export default PurchaseRFQForm;
