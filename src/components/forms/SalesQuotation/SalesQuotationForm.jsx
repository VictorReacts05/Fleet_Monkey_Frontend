import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  Chip,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import FormPage from "../../common/FormPage.jsx";
import StatusIndicator from "./StatusIndicator";
import ParcelTab from "./ParcelTab.jsx";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import {
  fetchSalesQuotation,
  fetchSalesQuotationParcels,
  fetchSalesQuotationStatus,
  updateSalesQuotation,
  updateSalesQuotationParcels,
  fetchCustomerById,
  sendSalesQuotation,
} from "./SalesQuotationAPI.js";

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

const SalesQuotationForm = ({
  salesQuotationId: propSalesQuotationId,
  onClose,
  readOnly,
  isEdit,
}) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const salesQuotationId = propSalesQuotationId || id;

  const [formData, setFormData] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parcelError, setParcelError] = useState(null);
  const [sending, setSending] = useState(false);
  const [customerEmail, setCustomerEmail] = useState(null);

  console.log("SalesQuotationForm Render:", {
    salesQuotationId,
    readOnly,
    isEdit,
    customerEmail,
    sending,
  });

  console.log("Button Props:", {
    disabled: sending || !customerEmail || status !== "Approved",
    sending,
    customerEmail,
    status,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setParcelError(null);
    try {
      const quotation = await fetchSalesQuotation(salesQuotationId);
      console.log("Fetched Quotation:", quotation);
      if (quotation) {
        let fetchedParcels = [];
        try {
          fetchedParcels = await fetchSalesQuotationParcels(salesQuotationId);
          const mappedParcels = fetchedParcels.map((parcel, index) => {
            const mappedParcel = {
              SalesQuotationParcelID:
                parcel.SalesQuotationParcelID || `Unknown-${index}`,
              ParcelID: parcel.SalesQuotationParcelID || `Unknown-${index}`,
              SupplierQuotationParcelID:
                parcel.SupplierQuotationParcelID || null,
              itemName:
                typeof parcel.ItemName === "string"
                  ? parcel.ItemName
                  : "Unknown Item",
              uomName: parcel.UOMName || parcel.UOM || "-",
              quantity: parseFloat(parcel.ItemQuantity) || 0,
              rate: parseFloat(parcel.SupplierRate) || 0,
              amount: parseFloat(parcel.SupplierAmount) || 0,
              salesRate: parseFloat(parcel.SalesRate) || 0,
              salesAmount: parseFloat(parcel.SalesAmount) || 0,
            };
            console.log("Mapped Parcel:", mappedParcel);
            return mappedParcel;
          });
          console.log("Mapped Parcels:", mappedParcels);
          setParcels(mappedParcels);

          const formData = {
            Series: quotation.Series,
            CompanyID: quotation.CompanyID || "-",
            CompanyName: "Dung Beetle Logistics",
            CustomerID: quotation.CustomerID || "-",
            CustomerName: quotation.CustomerName || "-",
            SupplierID: quotation.SupplierID || "-",
            SupplierName: quotation.SupplierName || "-",
            ExternalRefNo: quotation.ExternalRefNo || "-",
            DeliveryDate: quotation.DeliveryDate
              ? new Date(quotation.DeliveryDate)
              : null,
            PostingDate: quotation.PostingDate
              ? new Date(quotation.PostingDate)
              : null,
            RequiredByDate: quotation.RequiredByDate
              ? new Date(quotation.RequiredByDate)
              : null,
            DateReceived: quotation.DateReceived
              ? new Date(quotation.DateReceived)
              : null,
            ServiceTypeID: quotation.ServiceTypeID || "-",
            ServiceType: quotation.ServiceType || "-",
            CollectionAddressID: quotation.CollectionAddressID || "-",
            CollectionAddress: quotation.CollectionAddress || "-",
            DestinationAddressID: quotation.DestinationAddressID || "-",
            DestinationAddress: quotation.DestinationAddress || "-",
            ShippingPriorityID: quotation.ShippingPriorityID || "-",
            ShippingPriorityName: quotation.ShippingPriorityName || "-",
            Terms: quotation.Terms || "-",
            CurrencyID: quotation.CurrencyID || "-",
            CurrencyName: quotation.CurrencyName || "-",
            CollectFromCustomerYN: !!quotation.CollectFromSupplierYN,
            PackagingRequiredYN: !!quotation.PackagingRequiredYN,
            FormCompletedYN: !!quotation.SalesQuotationCompletedYN,
            SalesAmount: parseFloat(quotation.SalesAmount) || 0,
            TaxAmount: parseFloat(quotation.TaxesAndOtherCharges) || 0,
            Total: parseFloat(quotation.Total) || 0,
            Profit: parseFloat(quotation.Profit) || 0,
            CustomerEmail: quotation.CustomerEmail || null,
          };
          setFormData(formData);

          console.log("CustomerEmail from quotation:", quotation.CustomerEmail);
          console.log("CustomerID:", formData.CustomerID);

          if (!formData.CustomerEmail && formData.CustomerID !== "-") {
            try {
              const customer = await fetchCustomerById(formData.CustomerID);
              console.log("Raw fetchCustomerById response:", customer);
              const email = customer.data?.CustomerEmail || null;
              console.log("Extracted CustomerEmail:", email);
              setCustomerEmail(email);
            } catch (err) {
              console.error("Error fetching customer email:", err);
              setCustomerEmail(null);
            }
          } else {
            setCustomerEmail(formData.CustomerEmail);
          }
          console.log("Final customerEmail:", customerEmail);
        } catch (parcelErr) {
          const parcelErrorMessage = parcelErr.response
            ? `Server error: ${parcelErr.response.status} - ${
                parcelErr.response.data?.message || parcelErr.message
              }`
            : `Failed to fetch parcels: ${parcelErr.message}`;
          console.error("Parcel fetch error:", parcelErrorMessage);
          setParcelError(parcelErrorMessage);
          console.log(parcelErrorMessage);

          setFormData({
            Series: quotation.Series,
            CompanyID: quotation.CompanyID || "-",
            CompanyName: "Dung Beetle Logistics",
            CustomerID: quotation.CustomerID || "-",
            CustomerName: quotation.CustomerName || "-",
            SupplierID: quotation.SupplierID || "-",
            SupplierName: quotation.SupplierName || "-",
            ExternalRefNo: quotation.ExternalRefNo || "-",
            DeliveryDate: quotation.DeliveryDate
              ? new Date(quotation.DeliveryDate)
              : null,
            PostingDate: quotation.PostingDate
              ? new Date(quotation.PostingDate)
              : null,
            RequiredByDate: quotation.RequiredByDate
              ? new Date(quotation.RequiredByDate)
              : null,
            DateReceived: quotation.DateReceived
              ? new Date(quotation.DateReceived)
              : null,
            ServiceTypeID: quotation.ServiceTypeID || "-",
            ServiceType: quotation.ServiceType || "-",
            CollectionAddressID: quotation.CollectionAddressID || "-",
            CollectionAddress: quotation.CollectionAddress || "-",
            DestinationAddressID: quotation.DestinationAddressID || "-",
            DestinationAddress: quotation.DestinationAddress || "-",
            ShippingPriorityID: quotation.ShippingPriorityID || "-",
            ShippingPriorityName: quotation.ShippingPriorityName || "-",
            Terms: quotation.Terms || "-",
            CurrencyID: quotation.CurrencyID || "-",
            CurrencyName: quotation.CurrencyName || "-",
            CollectFromCustomerYN: !!quotation.CollectFromSupplierYN,
            PackagingRequiredYN: !!quotation.PackagingRequiredYN,
            FormCompletedYN: !!quotation.SalesQuotationCompletedYN,
            SalesAmount: parseFloat(quotation.SalesAmount) || 0,
            TaxAmount: parseFloat(quotation.TaxesAndOtherCharges) || 0,
            Total: parseFloat(quotation.Total) || 0,
            Profit: parseFloat(quotation.Profit) || 0,
            CustomerEmail: quotation.CustomerEmail || null,
          });
        }
      } else {
        throw new Error("No sales quotation data returned");
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response?.data?.message || error.message
          }`
        : `Failed to fetch data: ${error.message}`;
      console.error("Error in fetchData:", error);
      setError(errorMessage);
      console.log(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesRateChange = (parcelId, salesRateValue) => {
    console.log("handleSalesRateChange:", { parcelId, salesRateValue });
    const updatedParcels = parcels.map((parcel) => {
      if (parcel.ParcelID === parcelId) {
        const newSalesRate = parseFloat(salesRateValue) || 0;
        return {
          ...parcel,
          salesRate: newSalesRate,
          salesAmount: newSalesRate * parcel.quantity,
        };
      }
      return parcel;
    });
    setParcels(updatedParcels);
  };

  const handleSave = async () => {
    console.log("handleSave Triggered for SalesQuotationID:", salesQuotationId);
    setLoading(true);
    try {
      const quotationPayload = {
        SalesQuotationID: parseInt(salesQuotationId),
        TaxesAndOtherCharges: formData.TaxAmount.toFixed(2),
      };

      console.log("Sending Sales Quotation Update Payload:", quotationPayload);
      await updateSalesQuotation(salesQuotationId, quotationPayload);

      const parcelPayloads = parcels.map((parcel) => ({
        SalesQuotationParcelID: parcel.SalesQuotationParcelID,
        SalesQuotationID: salesQuotationId,
        SupplierQuotationParcelID: parcel.SupplierQuotationParcelID,
        SalesRate: parcel.salesRate.toFixed(2),
        SalesAmount: parcel.salesAmount.toFixed(2),
      }));

      console.log(
        "Sending Sales Quotation Parcels Update Payload:",
        parcelPayloads
      );
      await updateSalesQuotationParcels(parcelPayloads);

      toast.success("Sales quotation updated successfully");
      navigate("/sales-quotation");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to save sales quotation";
      console.error("Error saving sales quotation:", error);
      console.log(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    console.log(
      "handleSendEmail triggered for SalesQuotationID:",
      salesQuotationId
    );
    console.log("Current customerEmail:", customerEmail);
    console.log("Current sending:", sending);

    if (!customerEmail) {
      console.log("No customer email available, showing toast");
      console.log("No customer email address available");
      return;
    }

    setSending(true);
    try {
      console.log("Calling sendSalesQuotation with ID:", salesQuotationId);
      const response = await sendSalesQuotation(salesQuotationId);
      console.log("sendSalesQuotation response:", response);
      toast.success(response.message || "Sales quotation sent successfully");
    } catch (error) {
      const errorMessage =
        error.message || "Failed to send sales quotation email";
      console.error("Error sending sales quotation email:", error);
      console.log(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/sales-quotation");
    }
  };

  const handleStatusChange = async (newStatus) => {
    console.log("New status:", newStatus);
    setStatus(newStatus);
    await loadSalesQuotationStatus();
  };

  const loadSalesQuotationStatus = useCallback(async () => {
    if (!salesQuotationId) return;

    try {
      setLoading(true);
      const status = await fetchSalesQuotationStatus(salesQuotationId);
      console.log(
        "Fetched SalesQuotation status for ID:",
        salesQuotationId,
        status
      );
      setStatus(status);
    } catch (err) {
      console.error("Error loading SalesQuotation status:", err);
      console.log("Error loading status: " + (err.message || "Unknown error"));
      setStatus("Pending");
    } finally {
      setLoading(false);
    }
  }, [salesQuotationId]);

  useEffect(() => {
    if (salesQuotationId) {
      fetchData();
      loadSalesQuotationStatus();
    } else {
      setError("No sales quotation ID provided");
      setLoading(false);
    }
  }, [salesQuotationId, loadSalesQuotationStatus]);

  useEffect(() => {
    console.log("customerEmail updated:", customerEmail);
  }, [customerEmail]);

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
        <Typography variant="h6">
          No Sales Quotation Parcel data available
        </Typography>
      </Box>
    );
  }

  console.log("Rendering SalesQuotationForm with formData:", formData);
  console.log("Passing to FormPage:", {
    isEdit,
    onSubmit: isEdit ? "handleSave" : null,
  });

  try {
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
              {isEdit ? "Edit Estimate" : "View Estimate"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Fade in={true} timeout={500}>
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
                          color:
                            theme.palette.mode === "light" ? "white" : "black",
                          fontSize: "0.9rem",
                        }}
                      >
                        Status:
                      </Typography>
                    }
                    sx={{ backgroundColor: "transparent" }}
                  />
                  <StatusIndicator
                    salesQuotationId={salesQuotationId}
                    onStatusChange={handleStatusChange}
                  />
                </Box>
              </Fade>
              <Tooltip title="Send to Customer">
                <Button
                  data-testid="send-email-button"
                  onClick={() => {
                    console.log("Send to Customer button clicked");
                    handleSendEmail();
                  }}
                  disabled={sending || !customerEmail || status !== "Approved"}
                  variant="contained"
                  startIcon={
                    sending ? <CircularProgress size={24} /> : <EmailIcon />
                  }
                  sx={{ ml: 2, pointerEvents: "auto" }}
                >
                  Send
                </Button>
              </Tooltip>
            </Box>
          </Box>
        }
        onCancel={handleCancel}
        onSubmit={isEdit ? handleSave : null}
        readOnly={!isEdit}
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
          {/* <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid> */}
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
            <ReadOnlyField
              label="External Ref No."
              value={formData.ExternalRefNo}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Delivery Date"
              value={formData.DeliveryDate}
            />
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
            <ReadOnlyField
              label="Date Received"
              value={formData.DateReceived}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Collection Address"
              value={formData.CollectionAddress}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Destination Address"
              value={formData.DestinationAddress}
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
              label="Taxes and Payments"
              value={formData.TaxAmount}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Total" value={formData.Total} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Profit" value={formData.Profit} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Collect From Customer"
              value={formData.CollectFromCustomerYN}
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

        <ParcelTab
          salesQuotationId={salesQuotationId}
          parcels={parcels}
          readOnly={readOnly}
          isEdit={isEdit}
          error={parcelError}
          onSalesRateChange={handleSalesRateChange}
        />
      </FormPage>
    );
  } catch (err) {
    console.error("Rendering error in SalesQuotationForm:", err);
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Failed to render form: {err.message}
        </Typography>
      </Box>
    );
  }
};

export default SalesQuotationForm;
