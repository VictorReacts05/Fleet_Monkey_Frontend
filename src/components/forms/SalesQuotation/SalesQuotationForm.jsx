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
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StatusIndicator from "./StatusIndicator";
import SearchIcon from "@mui/icons-material/Search";

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

const SalesQuotationForm = ({
  salesQuotationId: propSalesQuotationId,
  onClose,
  onSave,
  readOnly = true,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const DEFAULT_COMPANY = { value: "1", label: "Dung Beetle Logistics" };
  const salesQuotationId = propSalesQuotationId || id;
  const theme = useTheme();

  const [formData, setFormData] = useState({
    Series: "",
    CompanyID: DEFAULT_COMPANY.value,
    CustomerID: "",
    CustomerName: "",
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
    CollectFromCustomerYN: false,
    PackagingRequiredYN: false,
    FormCompletedYN: false,
  });
  const [parcels, setParcels] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Customer selection state
  const [customersDialogOpen, setCustomersDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [parcelLoading, setParcelLoading] = useState(false);

  const loadSalesQuotationData = useCallback(async () => {
    if (!salesQuotationId) return;

    try {
      setLoading(true);
      setParcelLoading(true);

      const response = await axios.get(
        `http://localhost:7000/api/sales-quotation/${salesQuotationId}`
      );

      if (response && response.data) {
        const quotationData = response.data;
        let formattedData = {
          ...quotationData,
          DeliveryDate: quotationData.DeliveryDate
            ? new Date(quotationData.DeliveryDate)
            : null,
          PostingDate: quotationData.PostingDate
            ? new Date(quotationData.PostingDate)
            : null,
          RequiredByDate: quotationData.RequiredByDate
            ? new Date(quotationData.RequiredByDate)
            : null,
          DateReceived: quotationData.DateReceived
            ? new Date(quotationData.DateReceived)
            : null
        };

        try {
          if (quotationData.CollectionAddressID) {
            const collectionAddressResponse = await axios.get(
              `http://localhost:7000/api/addresses/${quotationData.CollectionAddressID}`
            );
            if (
              collectionAddressResponse.data &&
              collectionAddressResponse.data.data
            ) {
              const addressData = collectionAddressResponse.data.data;
              formattedData.CollectionAddress = `${addressData.AddressLine1 || ""}, ${addressData.City || ""}`;
            }
          }

          if (quotationData.DestinationAddressID) {
            const destinationAddressResponse = await axios.get(
              `http://localhost:7000/api/addresses/${quotationData.DestinationAddressID}`
            );
            if (
              destinationAddressResponse.data &&
              destinationAddressResponse.data.data
            ) {
              const addressData = destinationAddressResponse.data.data;
              formattedData.DestinationAddress = `${addressData.AddressLine1 || ""}, ${addressData.City || ""}`;
            }
          }

          if (quotationData.ShippingPriorityID) {
            const prioritiesResponse = await axios.get(
              "http://localhost:7000/api/shipping-priorities"
            );
            const priority = prioritiesResponse.data.find(
              (p) => p.ShippingPriorityID === quotationData.ShippingPriorityID
            );
            if (priority) {
              formattedData.ShippingPriorityName = priority.PriorityName;
            }
          }

          if (quotationData.ServiceTypeID) {
            const serviceTypesResponse = await axios.get(
              "http://localhost:7000/api/service-types"
            );
            const serviceType = serviceTypesResponse.data.find(
              (s) => s.ServiceTypeID === quotationData.ServiceTypeID
            );
            if (serviceType) {
              formattedData.ServiceType = serviceType.ServiceType;
            }
          }

          if (quotationData.CurrencyID) {
            const currenciesResponse = await axios.get(
              "http://localhost:7000/api/currencies"
            );
            const currency = currenciesResponse.data.find(
              (c) => c.CurrencyID === quotationData.CurrencyID
            );
            if (currency) {
              formattedData.CurrencyName = currency.CurrencyName;
            }
          }
        } catch (fetchError) {
          console.error("Error fetching additional data:", fetchError);
        }

        setFormData(formattedData);
        if (quotationData.parcels && Array.isArray(quotationData.parcels)) {
          setParcels(quotationData.parcels);
        }
      }
    } catch (error) {
      console.error("Error loading Sales Quotation data:", error);
      toast.error("Failed to load Sales Quotation data");
    } finally {
      setLoading(false);
      setParcelLoading(false);
    }
  }, [salesQuotationId]);

  useEffect(() => {
    if (salesQuotationId) {
      loadSalesQuotationData();
    }
  }, [salesQuotationId, loadSalesQuotationData]);

  const loadApprovalStatus = useCallback(async () => {
    if (!salesQuotationId) return;
    try {
      const response = await axios.get(
        `http://localhost:7000/api/sales-quotation-approvals/${salesQuotationId}`
      );
      setApprovalRecord(response.data);
      if (response.data.exists) {
        setApprovalStatus(
          response.data.ApprovedYN ? "approved" : "disapproved"
        );
      } else {
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error("Failed to load approval status:", error);
      setApprovalStatus(null);
    }
  }, [salesQuotationId]);

  useEffect(() => {
    if (salesQuotationId) {
      loadApprovalStatus();
    }
  }, [salesQuotationId, loadApprovalStatus]);

  // Add the rest of your component logic here, including customer selection,
  // form submission, and other necessary functions

  return (
    <Box>
      {/* Add your form UI components here */}
      <StatusIndicator
        status={approvalStatus}
        salesQuotationId={salesQuotationId}
        onStatusChange={(newStatus) => setApprovalStatus(newStatus)}
        readOnly={readOnly}
      />
      {/* Add the rest of your form fields and UI components */}
    </Box>
  );
};

export default SalesQuotationForm;