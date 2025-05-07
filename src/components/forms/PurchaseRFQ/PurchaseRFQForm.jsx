import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  createPurchaseRFQ,
  updatePurchaseRFQ,
  getPurchaseRFQById,
  fetchSalesRFQs,
  approvePurchaseRFQ,
  fetchPurchaseRFQApprovalStatus,
  updatePurchaseRFQApproval,
  fetchServiceTypes,
  fetchShippingPriorities,
  fetchCurrencies,
} from "./purchaserfqapi";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";
import ParcelTab from "../SalesRFQ/ParcelTab";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;
  
  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  }
  else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
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
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(!isViewMode && !readOnly);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [shippingPriorities, setShippingPriorities] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const loadApprovalStatus = useCallback(async () => {
    if (!purchaseRFQId) return;
    try {
      const approvalData = await fetchPurchaseRFQApprovalStatus(purchaseRFQId);
      setApprovalRecord(approvalData);
      if (approvalData && approvalData.ApprovedYN !== undefined) {
        setApprovalStatus(approvalData.ApprovedYN ? "approved" : "disapproved");
      } else {
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus(null);
      setApprovalRecord(null);
    }
  }, [purchaseRFQId]);

  useEffect(() => {
    const loadData = async () => {
      if (!purchaseRFQId || purchaseRFQId === "undefined") return;

      setLoading(true);
      try {
        const [
          salesRFQsData,
          serviceTypesResponse,
          shippingPrioritiesResponse,
          currenciesResponse,
        ] = await Promise.all([
          fetchSalesRFQs(),
          fetchServiceTypes(),
          fetchShippingPriorities(),
          fetchCurrencies(),
        ]);

        const salesRFQOptions = [
          { value: "", label: "Select an option" },
          ...salesRFQsData.map((rfq) => ({
            value: String(rfq.SalesRFQID),
            label: rfq.Series,
          })),
        ];
        setSalesRFQs(salesRFQOptions);

        const serviceTypesData = Array.isArray(serviceTypesResponse)
          ? serviceTypesResponse
          : serviceTypesResponse?.data &&
            Array.isArray(serviceTypesResponse.data)
          ? serviceTypesResponse.data
          : [];

        const shippingPrioritiesData = Array.isArray(shippingPrioritiesResponse)
          ? shippingPrioritiesResponse
          : shippingPrioritiesResponse?.data &&
            Array.isArray(shippingPrioritiesResponse.data)
          ? shippingPrioritiesResponse.data
          : [];

        const currenciesData = Array.isArray(currenciesResponse)
          ? currenciesResponse
          : currenciesResponse?.data && Array.isArray(currenciesResponse.data)
          ? currenciesResponse.data
          : [];

        setServiceTypes(serviceTypesData);
        setShippingPriorities(shippingPrioritiesData);
        setCurrencies(currenciesData);

        if (purchaseRFQId && purchaseRFQId !== "create") {
          const purchaseRFQResponse = await getPurchaseRFQById(purchaseRFQId);
          const rfqData = purchaseRFQResponse?.data;

          if (rfqData) {
            const serviceType = serviceTypesData.find(
              (st) => st.ServiceTypeID === rfqData.ServiceTypeID
            );

            const shippingPriority = shippingPrioritiesData.find(
              (sp) => sp.MailingPriorityID === rfqData.ShippingPriorityID
            );

            const currency = currenciesData.find(
              (c) => c.CurrencyID === rfqData.CurrencyID
            );

            const serviceTypeDisplay =
              serviceType?.ServiceType ||
              (rfqData.ServiceTypeID
                ? `Service Type ID: ${rfqData.ServiceTypeID}`
                : "Not specified");

            const currencyDisplay =
              currency?.CurrencyName ||
              (rfqData.CurrencyID
                ? `Currency ID: ${rfqData.CurrencyID}`
                : "Not specified");

            const shippingPriorityDisplay =
              shippingPriority?.PriorityName ||
              (rfqData.ShippingPriorityID
                ? `Priority ID: ${rfqData.ShippingPriorityID}`
                : "Not specified");

            setFormData({
              Series: rfqData.Series || "",
              SalesRFQID: rfqData.SalesRFQID ? String(rfqData.SalesRFQID) : "",
              CompanyID: rfqData.CompanyID || DEFAULT_COMPANY.value,
              CustomerID: rfqData.CustomerID || "",
              CustomerName: rfqData.CustomerName || "",
              SupplierID: rfqData.SupplierID || "",
              SupplierName: rfqData.SupplierName || "",
              ExternalRefNo: rfqData.ExternalRefNo || "",
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
              ServiceTypeID: rfqData.ServiceTypeID || "",
              ServiceType: serviceTypeDisplay,
              CollectionAddressID: rfqData.CollectionAddressID || "",
              DestinationAddressID: rfqData.DestinationAddressID || "",
              ShippingPriorityID: rfqData.ShippingPriorityID || "",
              ShippingPriorityName: shippingPriorityDisplay,
              Terms: rfqData.Terms || "",
              CurrencyID: rfqData.CurrencyID || "",
              CurrencyName: currencyDisplay,
              CollectFromSupplierYN: Boolean(rfqData.CollectFromSupplierYN),
              PackagingRequiredYN: Boolean(rfqData.PackagingRequiredYN),
              FormCompletedYN: Boolean(rfqData.FormCompletedYN),
            });

            // Use parcels directly from the API response
            const parcels = rfqData.parcels || [];
            console.log(
              `Loaded ${parcels.length} parcels for SalesRFQID ${rfqData.SalesRFQID}`,
              parcels
            );
            setParcels(parcels);

            if (readOnly || isViewMode) {
              setIsEditing(false);
            }

            await loadApprovalStatus();
          } else {
            toast.error("Failed to load Purchase RFQ data");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(
          "Failed to load data: " + (error.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [purchaseRFQId, loadApprovalStatus, readOnly, isViewMode]);

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
          {/* {purchaseRFQId && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {approvalStatus !== null ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      approvalStatus === "approved" ? "#e6f7e6" : "#ffebee",
                    color:
                      approvalStatus === "approved" ? "#2e7d32" : "#d32f2f",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontWeight: "medium",
                  }}
                >
                  <Typography variant="body2">
                    Status:{" "}
                    {approvalStatus === "approved" ? "Approved" : "Disapproved"}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff3e0",
                    color: "#f57c00",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontWeight: "medium",
                  }}
                >
                  <Typography variant="body2">Status: Pending</Typography>
                </Box>
              )}
            </Box>
          )} */}
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
              salesRFQs.find((s) => s.value === formData.SalesRFQID)?.label ||
              "-"
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
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead sx={{ 
                backgroundColor: '#1976d2', // Exact color from ParcelTab
                height: '56px' // Match the height from ParcelTab
              }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', py: 2 }}>Sr. No.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', py: 2 }}>Item</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', py: 2 }}>UOM</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: 'white', py: 2 }}>Quantity</TableCell>
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
                        height: '52px', // Match the height from ParcelTab
                        '&:nth-of-type(odd)': {
                          backgroundColor: alpha('#1976d2', 0.05),
                        },
                        '&:hover': {
                          backgroundColor: alpha('#1976d2', 0.1),
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <TableCell align="center">{parcel.srNo || index + 1}</TableCell>
                      <TableCell align="center">{parcel.itemName || `Item #${parcel.itemId}`}</TableCell>
                      <TableCell align="center">{parcel.uomName || `UOM #${parcel.uomId}`}</TableCell>
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
              borderRadius: '8px',
              backgroundColor: alpha('#f5f5f5', 0.7)
            }}
          >
            No parcels found for this Purchase RFQ.
          </Paper>
        </Box>
      )}
    </FormPage>
  );
}

export default PurchaseRFQForm;