import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import FormPage from "../../Common/FormPage"; // Verify: src/components/Common/FormPage.jsx
import StatusIndicator from "./StatusIndicator"; // Verify: src/components/forms/SalesQuotation/StatusIndicator.jsx
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ParcelTab from "./ParcelTab"; // Verify: src/components/forms/SalesQuotation/ParcelTab.jsx

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
  const theme = useTheme();
  const salesQuotationId = propSalesQuotationId || id;
  const DEFAULT_COMPANY = { value: "1", label: "Dung Beetle Logistics" };

  // Static form data
  const [formData] = useState({
    Series: "SQ2025-001",
    CompanyID: DEFAULT_COMPANY.value,
    CustomerID: "CUST001",
    CustomerName: "John",
    SupplierID: "SUP001",
    SupplierName: "ABC Inc",
    ExternalRefNo: "EXT-REF-12345",
    DeliveryDate: new Date("2025-06-15"),
    PostingDate: new Date("2025-06-20"),
    RequiredByDate: new Date("2025-06-28"),
    DateReceived: new Date("2025-06-30"),
    ServiceTypeID: "ST001",
    ServiceType: "International Procurement",
    CollectionAddressID: "ADDR001",
    CollectionAddress: "123 Main St, Springfield, IL 62701",
    DestinationAddressID: "ADDR002",
    DestinationAddress: "456 Market St, Chicago, IL 60601",
    ShippingPriorityID: "SP001",
    ShippingPriorityName: "High Priority",
    Terms: "Net 30",
    CurrencyID: "CUR001",
    CurrencyName: "USD",
    CollectFromCustomerYN: true,
    PackagingRequiredYN: true,
    FormCompletedYN: true,
    SalesAmount: 15000.0,
    TaxAmount: "-",
    Total: 16200.0,
  });

  // Static parcel data
  const [parcels] = useState([
    {
      ParcelID: "P001",
      Description: "Electronics",
      Quantity: 10,
      Weight: 50.5,
      Dimensions: "20x20x20 cm",
    },
    {
      ParcelID: "P002",
      Description: "Documents",
      Quantity: 5,
      Weight: 2.3,
      Dimensions: "30x20x5 cm",
    },
  ]);

  // Static status
  const [status] = useState("Approved");

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
            View Sales Quotation
          </Typography>
          <Fade in={true} timeout={500}>
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
              <Chip
                icon={
                  status === "Approved" ? (
                    <CheckCircleIcon
                      sx={{
                        color: theme.palette.mode === "light" ? "white !important" : "black !important",
                        fontSize: "20px",
                      }}
                    />
                  ) : (
                    <CancelIcon sx={{ color: "#D81B60 !important", fontSize: "20px" }} />
                  )
                }
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
                onStatusChange={() => {}} // No-op since static
                initialStatus={status}
                skipFetch={true}
                readOnly={true}
              />
            </Box>
          </Fade>
        </Box>
      }
      onCancel={onClose}
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
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Series" value={formData.Series} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Company" value={DEFAULT_COMPANY.label} />
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
          <ReadOnlyField label="External Ref No." value={formData.ExternalRefNo} />
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
          <ReadOnlyField label="Collection Address" value={formData.CollectionAddress} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Destination Address" value={formData.DestinationAddress} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Shipping Priority" value={formData.ShippingPriorityName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currency" value={formData.CurrencyName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Sales Amount"
            value={`${formData.SalesAmount.toFixed(2)}`}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Taxes and Other Charges"
            value={`${formData.TaxAmount}`}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Total"
            value={`${formData.Total.toFixed(2)}`}
          />
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
        
      <ParcelTab
        salesQuotationId={salesQuotationId}
        parcels={parcels}
        readOnly={true}
      />
    </FormPage>
  );
};

export default SalesQuotationForm;