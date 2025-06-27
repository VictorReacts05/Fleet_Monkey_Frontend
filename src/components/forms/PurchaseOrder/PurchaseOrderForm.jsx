import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useSelector } from "react-redux";
import FormPage from "../../common/FormPage";
import PurchaseOrderStatusIndicator from "./PurchaseOrderStatusIndicator";
import PurchaseOrderParcelsTab from "./PurchaseOrderParcelsTab";
import { toast } from "react-toastify";
import {
  fetchPurchaseOrder,
  fetchPurchaseOrderParcels,
  fetchPurchaseOrderApprovalStatus,
  sendPurchaseOrderEmail,
} from "./PurchaseOrderAPI";
import { createPurchaseInvoice } from "../PurchaseInvoice/PurchaseInvoiceAPI";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

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
  const { isAuthenticated } = useAuth();
  const userFromStore = useSelector((state) => state.loginReducer?.loginDetails?.user);
  const user = useMemo(() => userFromStore, [userFromStore]); // Memoize user to prevent new references

  const [formData, setFormData] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshApprovals, setRefreshApprovals] = useState(0);

  const fetchData = useCallback(async () => {
    console.log("fetchData called", { purchaseOrderId, isAuthenticated, user, refreshApprovals });
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!isAuthenticated || !user) {
      console.warn("Not authenticated or no user data", {
        isAuthenticated,
        user,
      });
      setError("Please log in to view");
      console.log("Please log in");
      setLoading(false);
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const po = await fetchPurchaseOrder(purchaseOrderId, user);
      console.log("Fetched PO:", po);
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
          DestinationWarehouseAddressID: po.DestinationWarehouseAddressID || "-", // Added
          OriginWarehouseAddressID: po.OriginWarehouseAddressID || "-", // Added
          ShippingPriorityID: po.ShippingPriorityID || "-",
          ShippingPriorityName: po.ShippingPriorityID
            ? `Priority ID: ${po.ShippingPriorityID}`
            : "-",
          Terms: po.Terms || "-",
          CurrencyID: po.CurrencyID || "-",
          CurrencyName: po.CurrencyName || "-",
          CollectFromSupplierYN: !!po.CollectFromSupplierYN,
          PackagingRequiredYN: !!po.PackagingRequiredYN,
          FormCompletedYN: !!po.FormStatus,
          SalesAmount: parseFloat(po.SalesAmount) || 0,
          TaxesAndOtherCharges: parseFloat(po.TaxesAndOtherCharges) || 0,
          Total: parseFloat(po.Total) || 0,
          Status: po.Status || "Pending",
        };

        // Fetch Destination Warehouse
        if (po.DestinationWarehouseAddressID) {
          try {
            const destinationWarehouseResponse = await axios.get(
              `${APIBASEURL}/addresses/${po.DestinationWarehouseAddressID}`,
              {
                headers: {
                  Authorization: `Bearer ${user.personId}`,
                },
              }
            );
            if (destinationWarehouseResponse.data?.data) {
              const warehouseData = destinationWarehouseResponse.data.data;
              formData.DestinationWarehouse = `${
                warehouseData.AddressLine1 || ""
              }, ${warehouseData.City || ""}`.trim() || "-";
            }
          } catch (error) {
            console.error("Error fetching Destination Warehouse:", error);
            formData.DestinationWarehouse = "-";
          }
        }

        // Fetch Origin Warehouse
        if (po.OriginWarehouseAddressID) {
          try {
            const originWarehouseResponse = await axios.get(
              `${APIBASEURL}/addresses/${po.OriginWarehouseAddressID}`,
              {
                headers: {
                  Authorization: `Bearer ${user.personId}`,
                },
              }
            );
            if (originWarehouseResponse.data?.data) {
              const warehouseData = originWarehouseResponse.data.data;
              formData.OriginWarehouse = `${
                warehouseData.AddressLine1 || ""
              }, ${warehouseData.City || ""}`.trim() || "-";
            }
          } catch (error) {
            console.error("Error fetching Origin Warehouse:", error);
            formData.OriginWarehouse = "-";
          }
        }

        console.log("Set formData:", {
          ...formData,
          SupplierID: formData.SupplierID,
        });
        setFormData(formData);

        try {
          const fetchedParcels = await fetchPurchaseOrderParcels(
            purchaseOrderId,
            user
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
          console.log("Fetched parcels in fetchData:", mappedParcels);
          setParcels(mappedParcels);
        } catch (err) {
          const parcelErrorMessage = err.response
            ? `Server error: ${err.response.status} - ${
                err.response.data?.message || err.message
              }`
            : `Failed to fetch parcels: ${err.message}`;
          console.error("Parcel fetch error:", parcelErrorMessage);
        }
      } else {
        throw new Error("No purchase order data returned");
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : `Failed to fetch data: ${error.message}`;
      console.error("Error in fetchData:", error);
      setError(errorMessage);
      console.log(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, isAuthenticated, user, navigate, refreshApprovals]);

  const loadPurchaseOrderStatus = useCallback(async () => {
    if (!isAuthenticated || !user || !purchaseOrderId) return;
    try {
      const approvalData = await fetchPurchaseOrderApprovalStatus(
        purchaseOrderId,
        user
      );
      setApprovalRecord(approvalData);

      if (approvalData.data && approvalData.data.length > 0) {
        const approved =
          approvalData.data[0].ApprovedYN === 1 ||
          approvalData.data[0].ApprovedYN === "true";
        setApprovalStatus(approved ? "Accepted" : "Pending");
        setStatus(approved ? "Accepted" : "Pending");
      } else {
        setApprovalStatus("Pending");
        setStatus("Pending");
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus("Pending");
      setStatus("Pending");
    }
  }, [isAuthenticated, user, purchaseOrderId]);

  const handleApprovalChange = useCallback(() => {
    setRefreshApprovals((prev) => {
      const newValue = prev + 1;
      console.log("New refreshApprovals value:", newValue);
      return newValue;
    });
  }, []);

  const handleSendToSupplier = async () => {
    if (!isAuthenticated || !user) {
      console.log("Please log in to send the purchase order");
      navigate("/");
      return;
    }

    try {
      await sendPurchaseOrderEmail(purchaseOrderId, user);
      toast.success("Purchase order sent to supplier successfully");
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : `Failed to send purchase order: ${error.message}`;
      console.error("Error sending purchase order:", error);
      console.log(errorMessage);
    }
  };

  const handleCreatePurchaseInvoice = async () => {
    if (!isAuthenticated || !user) {
      console.log("Please log in to create a purchase invoice");
      navigate("/");
      return;
    }

    try {
      console.log("Creating Purchase Invoice for PO:", purchaseOrderId);
      const response = await createPurchaseInvoice(purchaseOrderId, user);
      console.log("Create Purchase Invoice response:", response);
      console.log(
        "Full response structure:",
        JSON.stringify(response, null, 2)
      );
      const newPInvoiceID =
        response?.data?.PInvoiceID ||
        response?.data?.pInvoiceId ||
        response?.data?.id ||
        response?.data?.data?.id ||
        response?.data?.newPurchaseInvoiceId ||
        response?.newPInvoiceId ||
        response?.data?.PurchaseInvoiceID;
      if (newPInvoiceID) {
        toast.success("Purchase Invoice created successfully");
        navigate(`/purchase-invoice/view/${newPInvoiceID}`);
      } else {
        throw new Error("No Purchase Invoice ID returned");
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : `Error creating purchase invoice: ${error.message}`;
      console.error("Error creating purchase invoice:", errorMessage);
      console.log(errorMessage);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered:", {
      purchaseOrderId,
      readOnly,
      isAuthenticated,
      user,
      refreshApprovals,
    });
    if (purchaseOrderId) {
      fetchData();
      loadPurchaseOrderStatus();
    } else {
      setError("No purchase order ID provided");
      setLoading(false);
      console.log("No purchase order ID provided");
      navigate("/");
    }
  }, [purchaseOrderId, isAuthenticated, user, navigate, fetchData, loadPurchaseOrderStatus, refreshApprovals]);

  const handleParcelsChange = (updatedParcels) => {
    console.log("handleParcelsChange called with:", updatedParcels);
    setParcels(updatedParcels);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/purchase-order");
    }
  };

  const handleStatusChange = (newStatus, updatedPO) => {
    console.log("Status changed to:", newStatus, "Updated PO:", updatedPO);
    setStatus(newStatus);

    if (updatedPO) {
      // Update formData with the new PO data
      const updatedFormData = {
        Series: updatedPO.Series || "-",
        CompanyID: updatedPO.CompanyID || "-",
        CompanyName: updatedPO.CompanyName || "-",
        SupplierID: updatedPO.SupplierID || "-",
        SupplierName: updatedPO.SupplierName || "-",
        CustomerID: updatedPO.CustomerID || "-",
        CustomerName: updatedPO.CustomerName || "-",
        ExternalRefNo: updatedPO.ExternalRefNo || "-",
        DeliveryDate: updatedPO.DeliveryDate
          ? new Date(updatedPO.DeliveryDate)
          : null,
        PostingDate: updatedPO.PostingDate
          ? new Date(updatedPO.PostingDate)
          : null,
        RequiredByDate: updatedPO.RequiredByDate
          ? new Date(updatedPO.RequiredByDate)
          : null,
        DateReceived: updatedPO.DateReceived
          ? new Date(updatedPO.DateReceived)
          : null,
        ServiceTypeID: updatedPO.ServiceTypeID || "-",
        ServiceType: updatedPO.ServiceTypeName || "-",
        CollectionAddressID: updatedPO.CollectionAddressID || "-",
        CollectionAddress: updatedPO.CollectionAddressTitle || "-",
        DestinationAddressID: updatedPO.DestinationAddressID || "-",
        DestinationAddress: updatedPO.DestinationAddressTitle || "-",
        ShippingPriorityID: updatedPO.ShippingPriorityID || "-",
        ShippingPriorityName: updatedPO.ShippingPriorityID
          ? `Priority ID: ${updatedPO.ShippingPriorityID}`
          : "-",
        Terms: updatedPO.Terms || "-",
        CurrencyID: updatedPO.CurrencyID || "-",
        CurrencyName: updatedPO.CurrencyName || "-",
        CollectFromSupplierYN: !!updatedPO.CollectFromSupplierYN,
        PackagingRequiredYN: !!updatedPO.PackagingRequiredYN,
        FormCompletedYN: !!updatedPO.FormStatus,
        SalesAmount: parseFloat(updatedPO.SalesAmount) || 0,
        TaxesAndOtherCharges: parseFloat(updatedPO.TaxesAndOtherCharges) || 0,
        Total: parseFloat(updatedPO.Total) || 0,
        Status: newStatus || updatedPO.Status || "Pending",
      };
      console.log("Updated formData:", updatedFormData);
      setFormData(updatedFormData);

      // Optionally refresh parcels if needed
      fetchPurchaseOrderParcels(purchaseOrderId, user)
        .then((fetchedParcels) => {
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
        })
        .catch((err) => {
          console.error("Error refreshing parcels:", err);
        });
    } else {
      setFormData((prev) => ({ ...prev, Status: newStatus }));
    }
  };

  // Debug button rendering conditions
  console.log("Button rendering conditions:", {
    hasFormData: !!formData,
    hasSupplierID: !!formData?.SupplierID,
    supplierIDNotDash: formData?.SupplierID !== "-",
    supplierIDValue: formData?.SupplierID,
    isAuthenticated,
    readOnly,
    user,
  });

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
          {error}
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
        <Typography variant="h6">No purchase order data found</Typography>
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
          <Fade in timeout={500}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                background:
                  theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
                borderRadius: "4px",
                paddingRight: "8px",
                height: "37px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                      fontWeight: "bold",
                      color: theme.palette.mode === "light" ? "white" : "black",
                      fontSize: "0.9rem",
                    }}
                  >
                    Status:
                  </Typography>
                }
                sx={{ backgroundColor: "transparent" }}
              />
              <PurchaseOrderStatusIndicator
                status={status}
                purchaseOrderId={purchaseOrderId}
                onStatusChange={handleStatusChange}
                readOnly={formData.Status === "Accepted"}
                user={user}
              />
            </Box>
          </Fade>
          <Box sx={{ display: "flex", justifyContent: "flex-end", ml: 2 }}>
            {formData.SupplierID &&
              formData.SupplierID !== "-" &&
              isAuthenticated && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendToSupplier}
                  sx={{ mr: 2 }}
                  disabled={formData.Status !== "Approved"}
                >
                  Send to Supplier
                </Button>
              )}
            {formData && isAuthenticated && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreatePurchaseInvoice}
                disabled={formData.Status !== "Approved"}
              >
                Create Purchase Invoice
              </Button>
            )}
          </Box>
        </Box>
      }
      onCancel={handleCancel}
      readOnly={readOnly}
    >
      <Grid
        container
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
        user={user}
        refreshApprovals={refreshApprovals}
        onApprovalChange={handleApprovalChange}
      />
    </FormPage>
  );
};

export default PurchaseOrderForm;