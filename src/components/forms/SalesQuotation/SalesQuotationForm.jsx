import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import FormPage from "../../Common/FormPage";
import StatusIndicator from "./StatusIndicator";
import ParcelTab from "./ParcelTab.jsx"; // Added missing import
import { toast } from "react-toastify";
import {
  fetchSalesQuotation,
  fetchSalesQuotationParcels,
} from "./SalesQuotationAPI";

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setParcelError(null);
    try {
      // Fetch Sales Quotation
      const quotation = await fetchSalesQuotation(salesQuotationId);
      if (quotation) {
        setFormData({
          Series: quotation.Series,
          CompanyID: quotation.CompanyID || "-",
          CompanyName: "Dung Beetle Logistics", // Replace with API call if available
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
          CollectionAddress: quotation.CollectionAddressTitle || "-",
          DestinationAddressID: quotation.DestinationAddressID || "-",
          DestinationAddress: quotation.DestinationAddressTitle || "-",
          ShippingPriorityID: quotation.ShippingPriorityID || "-",
          ShippingPriorityName: quotation.ShippingPriorityID
            ? `Priority ID: ${quotation.ShippingPriorityID}`
            : "-",
          Terms: quotation.Terms || "-",
          CurrencyID: quotation.CurrencyID || "-",
          CurrencyName: quotation.CurrencyName || "-",
          CollectFromCustomerYN: !!quotation.CollectFromSupplierYN,
          PackagingRequiredYN: !!quotation.PackagingRequiredYN,
          FormCompletedYN: !!quotation.SalesQuotationCompletedYN,
          SalesAmount: quotation.SalesAmount || 0,
          TaxAmount: quotation.TaxesAndOtherCharges || "0.00",
          Total: quotation.Total || 0,
        });
        setStatus(quotation.Status || "Pending");
      } else {
        throw new Error("No Sales Quotation data returned");
      }

      // Fetch Sales Quotation Parcels
      try {
        const fetchedParcels = await fetchSalesQuotationParcels(
          salesQuotationId
        );
        const mappedParcels = fetchedParcels.map((parcel) => ({
          ParcelID: parcel.SalesQuotationParcelID || "-",
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
            error.response.data?.message || error.message
          }`
        : `Failed to fetch data: ${error.message}`;
      console.error("Error in fetchData:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salesQuotationId) {
      fetchData();
    } else {
      setError("No Sales Quotation ID provided");
      setLoading(false);
    }
  }, [salesQuotationId]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/sales-quotation");
    }
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
        <Typography variant="h6">No Sales Quotation data available</Typography>
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
          <Typography variant="h6">View Sales Quotation</Typography>
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
                status={status}
                salesQuotationId={salesQuotationId}
                onStatusChange={() => {}}
                initialStatus={status}
                skipFetch={true}
                readOnly={readOnly}
              />
            </Box>
          </Fade>
        </Box>
      }
      onCancel={handleCancel}
      readOnly={readOnly}
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
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Series" value={formData.Series} />
        </Grid>
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
            label="External Ref No."
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
            label="Taxes and Other Charges"
            value={formData.TaxAmount}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Total" value={formData.Total} />
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
        error={parcelError}
      />
    </FormPage>
  );
};

export default SalesQuotationForm;
