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
import PurchaseOrderParcelsTab from "./PurchaseOrderParcelsTab";
import { toast } from "react-toastify";
import {
  fetchPurchaseOrder,
  fetchPurchaseOrderParcels,
} from "./PurchaseOrderAPI";

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

const PurchaseOrderForm = ({
  purchaseOrderId: propPurchaseOrderId,
  onClose,
  readOnly = true,
}) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const purchaseOrderId = propPurchaseOrderId || id;

  const [formData, setFormData] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const po = await fetchPurchaseOrder(purchaseOrderId);
      if (po) {
        const formData = {
          Series: po.Series || "-",
          CompanyID: po.CompanyID || "-",
          CompanyName: po.CompanyName || "-",
          SupplierID: po.SupplierID || "-",
          SupplierName: po.SupplierName || "-",
          CustomerID: po.CustomerID || "-",
          CustomerName: po.CustomerName || "-",
          ExternalRefNo: po.ExternalRefNo || "-",
          DeliveryDate: po.DeliveryDate ? new Date(po.DeliveryDate) : null,
          PostingDate: po.PostingDate ? new Date(po.PostingDate) : null,
          RequiredByDate: po.RequiredByDate
            ? new Date(po.RequiredByDate)
            : null,
          DateReceived: po.DateReceived ? new Date(po.DateReceived) : null,
          ServiceTypeID: po.ServiceTypeID || "-",
          ServiceType: po.ServiceTypeName || "-",
          CollectionAddressID: po.CollectionAddressID || "-",
          CollectionAddress: po.CollectionAddressTitle || "-",
          DestinationAddressID: po.DestinationAddressID || "-",
          DestinationAddress: po.DestinationAddressTitle || "-",
          ShippingPriorityID: po.ShippingPriorityID || "-",
          ShippingPriorityName: po.ShippingPriorityID
            ? `Priority ID: ${po.ShippingPriorityID}`
            : "-",
          Terms: po.Terms || "-",
          CurrencyID: po.CurrencyID || "-",
          CurrencyName: po.CurrencyName || "-",
          CollectFromSupplierYN: !!po.CollectFromSupplierYN,
          PackagingRequiredYN: !!po.PackagingRequiredYN,
          FormCompletedYN: !!po.FormCompletedYN,
          SalesAmount: parseFloat(po.SalesAmount) || 0,
          TaxesAndOtherCharges: parseFloat(po.TaxesAndOtherCharges) || 0,
          Total: parseFloat(po.Total) || 0,
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
        });
        setFormData(formData);

        try {
          const fetchedParcels = await fetchPurchaseOrderParcels(
            purchaseOrderId
          );
          const mappedParcels = fetchedParcels.map((parcel, index) => ({
            id: parcel.PurchaseOrderParcelID || `Parcel-${index + 1}`,
            itemName: parcel.ItemName || "Unknown Item",
            uomName: parcel.UOMName || "-",
            quantity: String(parseFloat(parcel.ItemQuantity) || 0),
            rate: String(parseFloat(parcel.Rate) || 0),
            amount: String(parseFloat(parcel.Amount) || 0),
            itemId: String(parcel.ItemID || ""),
            uomId: String(parcel.UOMID || ""),
            PurchaseOrderParcelID: parcel.PurchaseOrderParcelID,
            POID: purchaseOrderId,
          }));
          setParcels(mappedParcels);
        } catch (parcelErr) {
          const parcelErrorMessage = parcelErr.response
            ? `Server error: ${parcelErr.response.status} - ${
                parcelErr.response.data?.message || parcelErr.message
              }`
            : `Failed to fetch parcels: ${parcelErr.message}`;
          console.error("Parcel fetch error:", parcelErrorMessage);
          toast.error(parcelErrorMessage);
        }
      } else {
        throw new Error("No Purchase Order data returned");
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

  const loadPurchaseOrderStatus = useCallback(async () => {
    setStatus("Pending");
  }, [purchaseOrderId]);

  useEffect(() => {
    if (purchaseOrderId) {
      fetchData();
      loadPurchaseOrderStatus();
    } else {
      setError("No Purchase Order ID provided");
      setLoading(false);
    }
  }, [purchaseOrderId, loadPurchaseOrderStatus]);

  const handleParcelsChange = (updatedParcels) => {
    setParcels(updatedParcels);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/Purchase-Order");
    }
  };

  const handleStatusChange = (newStatus) => {
    console.log("Status changed to:", newStatus);
    setStatus(newStatus);
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
        <Typography variant="h6">No Purchase Order data available</Typography>
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
          <Typography variant="h6">View Purchase Order</Typography>
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
                purchaseOrderId={purchaseOrderId}
                onStatusChange={handleStatusChange}
                readOnly={false}
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
          <ReadOnlyField label="Customers" value={formData.CustomerName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Suppliers" value={formData.SupplierName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="External Ref" value={formData.ExternalRefNo} />
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
            label="Shipment Priority"
            value={formData.ShippingPriorityName}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Terms" value={formData.Terms} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Currencies" value={formData.CurrencyName} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Sales Amounts" value={formData.SalesAmount} />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField
            label="Taxes/Other Charges"
            value={formData.TaxesAndOtherCharges}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ width: "24%" }}>
          <ReadOnlyField label="Totals" value={formData.Total} />
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

      <PurchaseOrderParcelsTab
        purchaseOrderId={purchaseOrderId}
        onParcelsChange={handleParcelsChange}
        readOnly={readOnly}
      />
    </FormPage>
  );
};

export default PurchaseOrderForm;
