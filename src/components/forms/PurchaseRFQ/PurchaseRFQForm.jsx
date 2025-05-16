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
} from "@mui/material";
import {
  getPurchaseRFQById,
  fetchSalesRFQs,
  fetchPurchaseRFQApprovalStatus,
  updatePurchaseRFQApproval,
  fetchServiceTypes,
  fetchShippingPriorities,
  fetchCurrencies,
} from "./purchaserfqapi";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StatusIndicator from "./StatusIndicator";

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
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [parcelLoading, setParcelLoading] = useState(false);

  const loadPurchaseRFQData = useCallback(async () => {
    if (!purchaseRFQId) return;

    try {
      setLoading(true);
      setParcelLoading(true);

      // Fetch Purchase RFQ data
      const response = await getPurchaseRFQById(purchaseRFQId);
      console.log("Purchase RFQ response:", response);

      if (response && response.data) {
        const rfqData = response.data;
        console.log("Purchase RFQ data:", rfqData);

        // Format dates if they exist
        let formattedData = {
          ...rfqData,
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
        };

        // Fetch additional data
        try {
          // Fetch collection address details
          if (rfqData.CollectionAddressID) {
            const collectionAddressResponse = await axios.get(
              `http://localhost:7000/api/addresses/${rfqData.CollectionAddressID}`
            );
            if (
              collectionAddressResponse.data &&
              collectionAddressResponse.data.data
            ) {
              const addressData = collectionAddressResponse.data.data;
              formattedData.CollectionAddress = `${
                addressData.AddressLine1 || ""
              }, ${addressData.City || ""}`;
            }
          }

          // Fetch destination address details
          if (rfqData.DestinationAddressID) {
            const destinationAddressResponse = await axios.get(
              `http://localhost:7000/api/addresses/${rfqData.DestinationAddressID}`
            );
            if (
              destinationAddressResponse.data &&
              destinationAddressResponse.data.data
            ) {
              const addressData = destinationAddressResponse.data.data;
              formattedData.DestinationAddress = `${
                addressData.AddressLine1 || ""
              }, ${addressData.City || ""}`;
            }
          }

          // Fetch shipping priority details
          if (rfqData.ShippingPriorityID) {
            try {
              const prioritiesResponse = await fetchShippingPriorities();
              console.log("Shipping priorities response:", prioritiesResponse);

              // Handle nested or direct array response
              const priorities = Array.isArray(prioritiesResponse)
                ? prioritiesResponse
                : prioritiesResponse.data || [];

              if (Array.isArray(priorities)) {
                const matchingPriority = priorities.find(
                  (p) =>
                    parseInt(p.ShippingPriorityID || p.MailingPriorityID) ===
                    parseInt(rfqData.ShippingPriorityID)
                );

                if (matchingPriority) {
                  console.log("Matching priority found:", matchingPriority);
                  formattedData.ShippingPriorityName =
                    matchingPriority.PriorityName || "Unknown Priority";
                  console.log(
                    "Set ShippingPriorityName:",
                    formattedData.ShippingPriorityName
                  );
                } else {
                  console.warn(
                    `No matching shipping priority for ID: ${rfqData.ShippingPriorityID}`
                  );
                  formattedData.ShippingPriorityName = `Unknown Priority (${rfqData.ShippingPriorityID})`;
                }
              } else {
                console.error(
                  "Shipping priorities is not an array:",
                  priorities
                );
                formattedData.ShippingPriorityName = `Error: Invalid priorities data`;
              }
            } catch (priorityError) {
              console.error(
                "Error fetching shipping priorities:",
                priorityError
              );
              formattedData.ShippingPriorityName = `Error: Failed to fetch priority`;
            }
          }

          // Fetch service type details
          if (rfqData.ServiceTypeID) {
            try {
              const serviceTypesResponse = await fetchServiceTypes();
              console.log("Service types response:", serviceTypesResponse);

              // Handle nested or direct array response
              const serviceTypes = Array.isArray(serviceTypesResponse)
                ? serviceTypesResponse
                : serviceTypesResponse.data || [];

              if (Array.isArray(serviceTypes)) {
                const matchingServiceType = serviceTypes.find(
                  (s) =>
                    parseInt(s.ServiceTypeID) ===
                    parseInt(rfqData.ServiceTypeID)
                );

                if (matchingServiceType) {
                  console.log(
                    "Matching service type found:",
                    matchingServiceType
                  );
                  formattedData.ServiceType =
                    matchingServiceType.ServiceType || "Unknown Service Type";
                  console.log("Set ServiceType:", formattedData.ServiceType);
                } else {
                  console.warn(
                    `No matching service type for ID: ${rfqData.ServiceTypeID}`
                  );
                  formattedData.ServiceType = `Unknown Service Type (${rfqData.ServiceTypeID})`;
                }
              } else {
                console.error("Service types is not an array:", serviceTypes);
                formattedData.ServiceType = `Error: Invalid service types data`;
              }
            } catch (serviceTypeError) {
              console.error("Error fetching service types:", serviceTypeError);
              formattedData.ServiceType = `Error: Failed to fetch service type`;
            }
          }

          // Fetch currency details
          if (rfqData.CurrencyID) {
            try {
              const currenciesResponse = await fetchCurrencies();
              console.log("Currencies response:", currenciesResponse);

              const currencies = Array.isArray(currenciesResponse)
                ? currenciesResponse
                : currenciesResponse.data || [];

              if (Array.isArray(currencies)) {
                const matchingCurrency = currencies.find(
                  (c) => parseInt(c.CurrencyID) === parseInt(rfqData.CurrencyID)
                );
                if (matchingCurrency) {
                  formattedData.CurrencyName =
                    matchingCurrency.CurrencyName || "Unknown Currency";
                  console.log("Set CurrencyName:", formattedData.CurrencyName);
                } else {
                  console.warn(
                    `No matching currency for ID: ${rfqData.CurrencyID}`
                  );
                }
              } else {
                console.error("Currencies is not an array:", currencies);
              }
            } catch (currencyError) {
              console.error("Error fetching currencies:", currencyError);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching additional data:", fetchError);
        }

        console.log("Final formatted data:", formattedData);
        setFormData(formattedData);

        // Set parcels if they exist
        if (rfqData.parcels && Array.isArray(rfqData.parcels)) {
          setParcels(rfqData.parcels);
        }
      }

      // Fetch Sales RFQs for dropdown
      const salesRFQsData = await fetchSalesRFQs();
      if (salesRFQsData && Array.isArray(salesRFQsData)) {
        const formattedSalesRFQs = salesRFQsData.map((rfq) => ({
          value: rfq.SalesRFQID.toString(),
          label: rfq.Series || `Sales RFQ #${rfq.SalesRFQID}`,
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

  const loadApprovalStatus = useCallback(async () => {
    if (!purchaseRFQId) return;
    try {
      const approvalData = await fetchPurchaseRFQApprovalStatus(purchaseRFQId);
      console.log("Purchase RFQ Approval data received:", approvalData);

      setApprovalRecord(approvalData);

      if (approvalData.exists) {
        if (approvalData.ApprovedYN === true || approvalData.ApprovedYN === 1) {
          setApprovalStatus("approved");
        } else if (
          approvalData.ApprovedYN === false ||
          approvalData.ApprovedYN === 0
        ) {
          setApprovalStatus("disapproved");
        } else {
          setApprovalStatus(null);
        }
      } else {
        setApprovalStatus(null);
      }
      console.log("Set approvalStatus to:", approvalStatus);
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

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      if (confirmAction === "approve") {
        await updatePurchaseRFQApproval(purchaseRFQId, true);
        toast.success("Purchase RFQ approved successfully");
        setApprovalStatus("approved");
      } else if (confirmAction === "disapprove") {
        await updatePurchaseRFQApproval(purchaseRFQId, false);
        toast.success("Purchase RFQ disapproved successfully");
        setApprovalStatus("disapproved");
      }
      await loadApprovalStatus();
    } catch (error) {
      console.error(`Error ${confirmAction}ing Purchase RFQ:`, error);
      toast.error(
        `Failed to ${confirmAction} Purchase RFQ: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setConfirmDialogOpen(false);
      setLoading(false);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
  };

  // In the PurchaseRFQForm component, add this function if it doesn't exist
  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({
      ...prev,
      Status: newStatus
    }));
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
            View Purchase RFQ
            {formData.Series ? ` - ${formData.Series}` : ""}
          </Typography>
          {purchaseRFQId && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: formData.Status === "Approved" ? "#e6f7e6" : "#ffebee",
                  color: formData.Status === "Approved" ? "#2e7d32" : "#d32f2f",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontWeight: "medium",
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    marginRight: "8px",
                    color: formData.Status === "Approved" ? "#2e7d32" : "#d32f2f" 
                  }}
                >
                  Status:{" "}
                </Typography>
                <StatusIndicator
                  status={formData.Status}
                  purchaseRFQId={purchaseRFQId}
                  onStatusChange={(newStatus) => {
                    console.log("Status changed to:", newStatus);
                    handleStatusChange(newStatus);
                  }}
                  readOnly={formData.Status === "Approved"}
                />
              </Box>
            </Box>
          )}
        </Box>
      }
      onCancel={onClose || (() => navigate("/purchase-rfq"))}
      loading={loading}
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
        {purchaseRFQId && (
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid>
        )}

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Company"
            value={formData.CompanyName || DEFAULT_COMPANY.label}
          />
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Sales RFQ"
            value={
              salesRFQs.find((s) => s.value === formData.SalesRFQID?.toString())
                ?.label ||
              (formData.SalesRFQID ? `Sales RFQ #${formData.SalesRFQID}` : "-")
            }
          />
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Supplier Name"
            value={formData.SupplierName || "-"}
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
            label="Service Type"
            value={formData.ServiceType || "-"}
          />
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddress || "-"}
          />
        </Grid>

        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddress || "-"}
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

      {/* Parcels section */}
      {parcels.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Parcels
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
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "white", py: 2 }}
                  >
                    Sr. No.
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "white", py: 2 }}
                  >
                    Item
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "white", py: 2 }}
                  >
                    UOM
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "white", py: 2 }}
                  >
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
                      key={parcel.id}
                      sx={{
                        height: "52px",
                        "&:nth-of-type(odd)": {
                          backgroundColor: alpha("#1976d2", 0.05),
                        },
                        "&:hover": {
                          backgroundColor: alpha("#1976d2", 0.1),
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      <TableCell align="center">
                        {parcel.srNo || index + 1}
                      </TableCell>
                      <TableCell align="center">
                        {parcel.itemName || `Item #${parcel.itemId}`}
                      </TableCell>
                      <TableCell align="center">
                        {parcel.uomName || `UOM #${parcel.uomId}`}
                      </TableCell>
                      <TableCell align="center">{parcel.quantity}</TableCell>
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
            Parcels
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
            No parcels found for this Purchase RFQ.
          </Paper>
        </Box>
      )}

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
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </FormPage>
  );
};

export default PurchaseRFQForm;
