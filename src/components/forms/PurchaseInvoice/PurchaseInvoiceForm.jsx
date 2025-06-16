import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Fade,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import FormPage from "../../Common/FormPage";
import StatusIndicator from "./StatusIndicator";
import PurchaseInvoiceItemsTab from "./PurchaseInvoiceParcelsTab";
import { toast } from "react-toastify";
import {
  fetchPurchaseInvoice,
  fetchPurchaseInvoiceItems,
  getAuthHeader,
} from "./PurchaseInvoiceAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";
import axios from "axios";

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

const PurchaseInvoiceForm = ({
  purchaseInvoiceId: propPurchaseInvoiceId,
  onClose,
  readOnly = false, // Changed default to false for testing
  onStatusChange,
}) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const purchaseInvoiceId = propPurchaseInvoiceId || id;

  const [formData, setFormData] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [localStatus, setLocalStatus] = useState(status || "Pending");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching Purchase Invoice with ID: ${purchaseInvoiceId}`);
      const invoice = await fetchPurchaseInvoice(purchaseInvoiceId);
      console.log("Fetched Invoice:", invoice);

      if (invoice && invoice.PInvoiceID) {
        const formData = {
          Series: invoice.Series || "-",
          CompanyID: invoice.CompanyID || "-",
          CompanyName: invoice.CompanyName || "-",
          SupplierID: invoice.SupplierID || "-",
          SupplierName: invoice.SupplierName || "-",
          CustomerID: invoice.CustomerID || "-",
          CustomerName: invoice.CustomerName || "-",
          ExternalRefNo: invoice.ExternalRefNo || "-",
          DeliveryDate: invoice.DeliveryDate
            ? new Date(invoice.DeliveryDate)
            : null,
          PostingDate: invoice.PostingDate
            ? new Date(invoice.PostingDate)
            : null,
          RequiredByDate: invoice.RequiredByDate
            ? new Date(invoice.RequiredByDate)
            : null,
          DateReceived: invoice.DateReceived
            ? new Date(invoice.DateReceived)
            : null,
          ServiceTypeID: invoice.ServiceTypeID || "-",
          ServiceType: invoice.ServiceTypeName || "-",
          CollectionAddressID: invoice.CollectionAddressID || "-",
          CollectionAddress: invoice.CollectionAddressTitle || "-",
          DestinationAddressID: invoice.DestinationAddressID || "-",
          DestinationAddress: invoice.DestinationAddressTitle || "-",
          BillingAddressID: invoice.BillingAddressID || "-",
          BillingAddress: invoice.BillingAddressTitle || "-",
          ShippingPriorityID: invoice.ShippingPriorityID || "-",
          ShippingPriorityName: invoice.ShippingPriorityName || "-",
          Terms: invoice.Terms || "-",
          CurrencyID: invoice.CurrencyID || "-",
          CurrencyName: invoice.CurrencyName || "-",
          CollectFromSupplierYN: !!invoice.CollectFromSupplierYN,
          PackagingRequiredYN: !!invoice.PackagingRequiredYN,
          FormCompletedYN: !!invoice.FormCompletedYN,
          IsPaid: !!invoice.IsPaid,
          SubTotal: parseFloat(invoice.SubTotal) || 0,
          TaxAmount: parseFloat(invoice.TaxesAndOtherCharges) || 0,
          Total: parseFloat(invoice.Total) || 0,
        };
        console.log("Form Data:", {
          CurrencyID: formData.CurrencyID,
          CurrencyName: formData.CurrencyName,
          SupplierID: formData.SupplierID,
          SupplierName: formData.SupplierName,
          ServiceType: formData.ServiceType,
          CompanyName: formData.CompanyName,
          CustomerName: formData.CustomerName,
          CollectionAddress: formData.CollectionAddress,
          DestinationAddress: formData.DestinationAddress,
          BillingAddress: formData.BillingAddress,
          ShippingPriorityName: formData.ShippingPriorityName,
        });
        setFormData(formData);

        try {
          const fetchedItems = await fetchPurchaseInvoiceItems(
            purchaseInvoiceId
          );
          const mappedItems = fetchedItems.map((item, index) => ({
            id: item.PurchaseInvoiceItemID || `Item-${index + 1}`,
            itemName: item.ItemName || "Unknown Item",
            uomName: item.UOMName || "-",
            quantity: String(parseFloat(item.ItemQuantity) || 0),
            rate: String(parseFloat(item.Rate) || 0),
            amount: String(parseFloat(item.Amount) || 0),
            itemId: String(item.ItemID || ""),
            uomId: String(item.UOMID || ""),
            PurchaseInvoiceItemID: item.PurchaseInvoiceItemID,
            PIID: purchaseInvoiceId,
          }));
          setItems(mappedItems);
        } catch (itemErr) {
          const itemErrorMessage = itemErr.response
            ? `Server error: ${itemErr.response.status} - ${
                itemErr.response.data?.message || itemErr.message
              }`
            : `Failed to fetch items: ${itemErr.message}`;
          console.error("Item fetch error:", itemErrorMessage);
          toast.error(itemErrorMessage);
        }
      } else {
        const errorMessage =
          "No Purchase Invoice data returned for the given ID";
        console.error(errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
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

  const loadPurchaseInvoiceStatus = useCallback(async () => {
    setStatus("Pending");
    // Note: Implement actual status fetching logic if needed
  }, [purchaseInvoiceId]);

  useEffect(() => {
    if (purchaseInvoiceId) {
      fetchData();
      loadPurchaseInvoiceStatus();
    } else {
      setError("No Purchase Invoice ID provided");
      setLoading(false);
    }
  }, [purchaseInvoiceId, loadPurchaseInvoiceStatus]);

  const handleItemsChange = (updatedItems) => {
    setItems(updatedItems);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/purchase-invoice");
    }
  };

  const handleStatusChange = (newStatus) => {
    console.log("Status changed to:", newStatus);
    setStatus(newStatus);
  };

  // Log the readOnly prop to confirm its value
  console.log("PurchaseInvoiceForm - readOnly prop:", readOnly);

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
        <Typography variant="h6">No Invoice data available</Typography>
      </Box>
    );
  }

  const updateStatus = async (newStatus) => {
    if (!purchaseInvoiceId || isNaN(parseInt(purchaseInvoiceId, 10))) {
      toast.error("Invalid Purchase Invoice ID");
      setAnchorEl(null);
      return;
    }

    setLoading(true);
    try {
      const { headers, personId } = getAuthHeader();
      if (!personId) {
        throw new Error("User not authenticated: No personId found");
      }

      const endpoint =
        newStatus === "Approved"
          ? `${APIBASEURL}/pinvoice/approve`
          : `${APIBASEURL}/purchase-invoice/disapprove/`;
      const approveData = {
        pInvoiceID: parseInt(purchaseInvoiceId, 10),
        ApproverID: parseInt(personId, 10), // Include ApproverID
      };

      console.log(`Sending ${newStatus} request with data:`, approveData);

      const statusResponse = await axios.post(endpoint, approveData, {
        headers,
      });

      console.log(
        `Purchase Invoice ${newStatus} response:`,
        statusResponse.data
      );

      setLocalStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      await fetchApprovalRecord(); // Refresh approval status

      toast.success(`Purchase Invoice ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        `Failed to update status: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleApprove = () => {
    console.log("Approve clicked");
    updateStatus("Approved");
  };

  const fetchApprovalRecord = async () => {
    try {
      // Add your approval record fetching logic here
      // This might involve calling an API to get the latest approval status
      console.log("Fetching approval record...");
      // Example: await someApprovalAPI.getApprovalStatus(purchaseInvoiceId);
    } catch (error) {
      console.error("Error fetching approval record:", error);
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
            {readOnly ? "View Invoice" : "Edit Invoice"}
          </Typography>
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
                purchaseInvoiceId={purchaseInvoiceId}
                onStatusChange={handleStatusChange}
                readOnly={readOnly}
              />
            </Box>
          </Fade>
          <Button
            onClick={handleApprove}
            sx={{ background: "#66bb6a", color: "black", fontWeight: "bold" }}
          >
            Approve
          </Button>
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
          margin: "0 auto",
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
        <Grid item xs={12} md={4} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Collection Address"
            value={formData.CollectionAddress}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Destination Address"
            value={formData.DestinationAddress}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Billing Address"
            value={formData.BillingAddress}
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
          <ReadOnlyField label="Is Paid" value={formData.IsPaid} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sub Total" value={formData.SubTotal} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Tax Amount" value={formData.TaxAmount} />
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

      <PurchaseInvoiceItemsTab
        purchaseInvoiceId={purchaseInvoiceId}
        onItemsChange={handleItemsChange}
        readOnly={readOnly}
      />
    </FormPage>
  );
};

export default PurchaseInvoiceForm;
