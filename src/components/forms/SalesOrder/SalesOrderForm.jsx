import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import FormPage from "../../Common/FormPage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StatusIndicator from "./StatusIndicator"; // Import StatusIndicator component

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

const SalesOrderForm = ({ salesOrderId: propSalesOrderId, onClose }) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const salesOrderId = propSalesOrderId || id;
  const DEFAULT_COMPANY = { value: "1", label: "Dung Beetle Logistics" };

  // Static form data
  const [formData, setFormData] = useState({
    Series: "SO2025-001",
    CompanyID: DEFAULT_COMPANY.value,
    CompanyName: DEFAULT_COMPANY.label,
    CustomerID: "CUST001",
    CustomerName: "John Smith",
    SupplierID: "SUP001",
    SupplierName: "ABC Suppliers Inc",
    ExternalRefNo: "EXT-REF-12345",
    DeliveryDate: new Date("2025-06-15"),
    PostingDate: new Date("2025-06-10"),
    RequiredByDate: new Date("2025-06-20"),
    DateReceived: new Date("2025-06-05"),
    ServiceTypeID: "ST001",
    ServiceType: "International Shipping",
    CollectionAddressID: "ADDR001",
    CollectionAddress: "123 Main St, Springfield, IL 62701",
    DestinationAddressID: "ADDR002",
    DestinationAddress: "456 Market St, Chicago, IL 60601",
    ShippingPriorityID: "SP001",
    ShippingPriorityName: "Express",
    Terms: "Net 30 days",
    CurrencyID: "CUR001",
    CurrencyName: "USD",
    CollectFromSupplierYN: true,
    PackagingRequiredYN: true,
    FormCompletedYN: 1,
    SalesAmount: 12500.0,
    TaxesAndOtherCharges: 1250.0,
    Total: 13750.0,
  });

  // Static status
  const [status, setStatus] = useState("Approved");

  // Add status change handler
  const handleStatusChange = (newStatus) => {
    console.log("Status changed to:", newStatus);
    setStatus(newStatus);
  };

  // Static parcel data
  const [parcels] = useState([
    {
      id: 1,
      srNo: 1,
      itemId: 101,
      itemName: "Electronics Package",
      uomId: 1,
      uomName: "Box",
      quantity: 5,
    },
    {
      id: 2,
      srNo: 2,
      itemId: 102,
      itemName: "Office Supplies",
      uomId: 2,
      uomName: "Carton",
      quantity: 3,
    },
    {
      id: 3,
      srNo: 3,
      itemId: 103,
      itemName: "Medical Equipment",
      uomId: 3,
      uomName: "Pallet",
      quantity: 1,
    },
  ]);

  // Handle cancel button click
  const handleCancel = () => {
    if (onClose) {
      // If onClose prop is provided, call it (for dialog mode)
      onClose();
    } else {
      // Otherwise navigate back to the list page
      navigate('/sales-order');
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
          <Typography variant="h6">
            View Sales Order
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
              <StatusIndicator 
                status={status} 
                salesOrderId={salesOrderId} 
                onStatusChange={handleStatusChange}
                readOnly={false}
              />
            </Box>
          </Fade>
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
            value={`${formData.TaxesAndOtherCharges.toFixed(2)}`}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Total"
            value={`${formData.Total.toFixed(2)}`}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Collect From Supplier" value={formData.CollectFromSupplierYN} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Packaging Required" value={formData.PackagingRequiredYN} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Form Completed" value={formData.FormCompletedYN === 1 ? "Yes" : "No"} />
        </Grid>
      </Grid>

      {/* Parcels Table */}
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
              {parcels.map((parcel) => (
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
                  <TableCell align="center">{parcel.srNo}</TableCell>
                  <TableCell align="center">{parcel.itemName}</TableCell>
                  <TableCell align="center">{parcel.uomName}</TableCell>
                  <TableCell align="center">{parcel.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </FormPage>
  );
};

export default SalesOrderForm;