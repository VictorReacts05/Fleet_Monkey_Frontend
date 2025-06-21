import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import FormSelect from "../../common/FormSelect";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add, Edit } from "@mui/icons-material";
import { showToast } from "../../toastNotification";
import axios from "axios";
import SalesQuotationForm from "./SalesQuotationForm";
import { Chip } from "@mui/material";
import {
  fetchPurchaseRFQs,
  createSalesQuotation,
  getAuthHeader,
} from "./SalesQuotationAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";

const SalesQuotationList = () => {
  const [salesQuotations, setSalesQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);
  const [selectedPurchaseRFQ, setSelectedPurchaseRFQ] = useState("");
  const [personId, setPersonId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const columns = [
    { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "CustomerName",
      headerName: "Customer",
      flex: 1,
      valueGetter: (params) => params.row.CustomerName || "-",
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value || "Pending";
        let color = "default";
        if (status === "Approved") color = "success";
        else if (status === "Rejected") color = "error";
        else if (status === "Pending") color = "warning";
        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  const checkAuthAndLoadPersonId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("User data from localStorage:", user);
      if (!user || !user.personId) {
        console.warn("Invalid user data, redirecting to home");
        toast.error("Please log in to continue");
        navigate("/");
        return;
      }
      const personId = user.personId || user.id || user.userId || null;
      if (personId) {
        setPersonId(personId);
        console.log("PersonID Loaded:", personId);
      } else {
        console.warn("No personId found, redirecting to home");
        toast.error("Please log in to continue");
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking auth or loading personId:", error);
      toast.error("Failed to load user data. Please log in again.");
      navigate("/");
    }
  };

  const fetchSalesQuotations = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const { headers } = getAuthHeader();
      console.log("Fetching Sales Quotations with headers:", headers);
      const response = await axios.get(
        `${APIBASEURL}/sales-Quotation?page=${page + 1}&limit=${rowsPerPage}${
          searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
        }`,
        { headers }
      );
      console.log("Sales Quotations API response:", response.data);

      if (isMounted) {
        const quotationData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        console.log("Raw quotation data length:", quotationData.length);
        if (!quotationData.length) {
          console.warn("No sales quotations found in response:", response.data);
        }
        const mappedData = quotationData.map((quotation) => ({
          ...quotation,
          id: quotation.SalesQuotationID ?? null,
          Status: quotation.Status || "Pending",
          CreatedDate: quotation.CreatedDate
            ? dayjs(quotation.CreatedDate).isValid()
              ? dayjs(quotation.CreatedDate).format("YYYY-MM-DD")
              : "Invalid Date"
            : "No Data Provided",
        }));
        console.log("Mapped Sales Quotation Data length:", mappedData.length);
        // Enforce rowsPerPage limit on frontend if API returns extra records
        const limitedData = mappedData.slice(0, rowsPerPage);
        console.log("Limited Data length after slice:", limitedData.length);
        setSalesQuotations(limitedData);
        setTotalRows(response.data.total || response.data.totalRecords || 0); // Use total or totalRecords
        setError(null);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : error.message === "Network Error"
        ? "Network error: Please check your internet connection or server status"
        : `Failed to fetch Sales Quotations: ${error.message}`;
      console.error(
        "Error fetching Sales Quotations:",
        error.response || error.message
      );
      if (isMounted) {
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  };

  const loadPurchaseRFQs = async () => {
    try {
      const rfqs = await fetchPurchaseRFQs();
      console.log("Fetched Purchase RFQs:", rfqs);
      const formattedOptions = [
        { value: "", label: "Select a Purchase RFQ" },
        ...rfqs,
      ];
      console.log("Formatted Purchase RFQ Options:", formattedOptions);
      setPurchaseRFQs(formattedOptions);
    } catch (error) {
      console.error("Error fetching Purchase RFQs:", error);
      toast.error("Failed to load Purchase data");
      setPurchaseRFQs([{ value: "", label: "No Purchase RFQs Available" }]);
    }
  };

  useEffect(() => {
    checkAuthAndLoadPersonId();
  }, []);

  useEffect(() => {
    if (personId) {
      fetchSalesQuotations();
      loadPurchaseRFQs();
    }
  }, [personId, page, rowsPerPage, searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    if (id && id !== "undefined") {
      navigate(`/sales-quotation/view/${id}`);
    } else {
      console.error("Invalid Sales Quotation ID:", id);
      toast.error("Cannot view Sales Quotation: Invalid ID");
    }
  };

  const handleEdit = (id) => {
    if (id && id !== "undefined") {
      navigate(`/sales-quotation/edit/${id}`);
    } else {
      console.error("Invalid Sales Quotation ID:", id);
      toast.error("Cannot edit Sales Quotation: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    const item = salesQuotations.find((row) => row.id === id);
    if (item) {
      setSelectedQuotation(id);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
    }
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedQuotation(null);
    setSelectedPurchaseRFQ("");
    setErrors({});
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { headers } = getAuthHeader();
      await axios.delete(`${APIBASEURL}/sales-quotation/${selectedQuotation}`, {
        headers,
      });
      showToast("Sales Quotation deleted successfully", "success");
      setDeleteDialogOpen(false);
      fetchSalesQuotations();
    } catch (error) {
      console.error("Error deleting Sales Quotation:", error);
      toast.error("Failed to delete Sales Quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0); // Reset to first page on search
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedPurchaseRFQ) {
      newErrors.purchaseRFQ = "Purchase RFQ is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSalesQuotation = async () => {
    if (!validateForm()) {
      toast.error("Please select a Purchase RFQ");
      return;
    }

    try {
      setLoading(true);
      const data = {
        PurchaseRFQID: parseInt(selectedPurchaseRFQ),
      };
      console.log("Creating Sales Quotation with data:", data);
      const response = await createSalesQuotation(data);
      console.log("Create Sales Quotation response:", response);
      const newSalesQuotationId = response?.newSalesQuotationId;
      if (newSalesQuotationId) {
        toast.success("Sales Quotation created successfully");
        handleDialogClose();
        // navigate(`/sales-quotation`);
      } else {
        throw new Error("No Sales Quotation ID returned");
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create Sales Quotation";
      console.error("Error creating Sales Quotation:", errorMessage);
      toast.error(errorMessage);
      if (errorMessage.includes("User not logged in")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseRFQChange = (e) => {
    const { value } = e.target;
    setSelectedPurchaseRFQ(value);
    setErrors((prev) => ({
      ...prev,
      purchaseRFQ: value ? "" : "Purchase RFQ is required",
    }));
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          An error occurred: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            fetchSalesQuotations();
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Estimate Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar onSearch={handleSearch} placeholder="Search Estimates..." />
          <Tooltip title="Add New Estimate">
            <IconButton
              color="primary"
              onClick={() => {
                console.log("Add New Sales Quotation clicked");
                setCreateDialogOpen(true);
              }}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                height: 40,
                width: 40,
                ml: 1,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

        <DataTable
          rows={salesQuotations}
          columns={[
            ...columns,
            {
              field: "id",
              headerName: "ID",
              width: 100,
              valueGetter: (params) =>
                params.row.SalesQuotationID || params.row.id || "No ID",
            },
           
          ]}
          loading={loading}
          getRowId={(row) => row.id || "unknown"}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

      <Dialog
        open={viewDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>View Sales Quotation</DialogTitle>
        <DialogContent>
          {selectedQuotation && (
            <SalesQuotationForm
              salesQuotationId={selectedQuotation}
              onClose={handleDialogClose}
              readOnly={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Sales Quotation? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Sales Quotation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormSelect
              name="purchaseRFQ"
              label="Purchase RFQ"
              value={selectedPurchaseRFQ}
              onChange={handlePurchaseRFQChange}
              options={purchaseRFQs}
              error={!!errors.purchaseRFQ}
              helperText={errors.purchaseRFQ}
              disabled={loading}
            />
            {purchaseRFQs.length === 1 && purchaseRFQs[0].value === "" && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                No Purchase RFQs available. Please create a Purchase RFQ with
                Supplier Quotations first.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateSalesQuotation}
            color="primary"
            variant="contained"
            disabled={loading || !selectedPurchaseRFQ}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            Something went wrong: {this.state.error.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => this.setState({ hasError: false, error: null })}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default () => (
  <ErrorBoundary>
    <SalesQuotationList />
  </ErrorBoundary>
);