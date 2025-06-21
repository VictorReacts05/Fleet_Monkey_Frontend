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
import { Chip } from "@mui/material";
import {
  getAuthHeader,
  fetchSalesOrders,
  fetchSalesQuotations,
  createSalesOrder,
} from "./SalesOrderAPI";
import Add from "@mui/icons-material/Add";

const SalesOrderList = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [salesQuotations, setSalesQuotations] = useState([]);
  const [selectedSalesQuotation, setSelectedSalesQuotation] = useState("");
  const [personId, setPersonId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  
    const [toDate, setToDate] = useState(null);
    const [fromDate, setFromDate] = useState(null);
  

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
        else if (status === "Delivered") color = "info";
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: "Total",
      headerName: "Total Amount",
      flex: 1,
      valueGetter: (params) => {
        const total = params.row.Total || params.row.TotalAmount || 0;
        return `$${Number(total)}`;
      },
    },
    {
      field: "id",
      headerName: "Sales Order ID",
      width: 100,
      valueGetter: (params) =>
        params.row.SalesOrderID || params.row.id || "No ID",
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

  const fetchSalesOrdersList = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const formattedFromDate = fromDate
              ? dayjs(fromDate).format("YYYY-MM-DD")
              : null;
            const formattedToDate = toDate
              ? dayjs(toDate).format("YYYY-MM-DD")
              : null;
      
      const response = await fetchSalesOrders( page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate);
      console.log("Sales Orders API response:", response);

      const orderData = Array.isArray(response.data) ? response.data : [];
      if (!orderData.length) {
        console.warn("No sales orders found in response:", response);
      }

      const mappedData = orderData.map((order) => ({
        ...order,
        id: order.SalesOrderID ?? null,
        Status: order.Status || "Pending",
        OrderDate: order.OrderDate || order.CreatedDate,
        Total: order.Total || order.TotalAmount || 0,
        CreatedDate: order.CreatedDate
          ? dayjs(order.CreatedDate).isValid()
            ? dayjs(order.CreatedDate).format("YYYY-MM-DD")
            : "Invalid Date"
          : "No Data Provided",
      }));

      console.log("Mapped Sales Order Data:", mappedData);

      if (isMounted) {
        setSalesOrders(mappedData);
        setTotalRows(response.total|| salesOrders.length );
        setError(null);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : error.message === "Network Error"
        ? "Network error: Please check your internet connection or server status"
        : `Failed to fetch Sales Orders: ${error.message}`;

      console.error(
        "Error fetching Sales Orders:",
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

  const loadSalesQuotations = async () => {
    try {
      const quotations = await fetchSalesQuotations();
      console.log("Fetched Approved Sales Quotations:", quotations);
      const formattedOptions = [
        { value: "", label: "Select a Sales Quotation" },
        ...quotations,
      ];
      console.log("Formatted Sales Quotation Options:", formattedOptions);
      setSalesQuotations(formattedOptions);
    } catch (error) {
      console.error("Error fetching Sales Quotations:", error);
      toast.error("Failed to load Sales Quotation data");
      setSalesQuotations([
        { value: "", label: "No Sales Quotations Available" },
      ]);
    }
  };

  useEffect(() => {
    checkAuthAndLoadPersonId();
  }, []);

  useEffect(() => {
    if (personId) {
      fetchSalesOrdersList();
      loadSalesQuotations();
    }
  }, [personId, page, rowsPerPage]);

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    await fetchSalesOrdersList();
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchSalesOrdersList();
  };

  const handleView = (id) => {
    console.log("View clicked for Sales Order ID:", id);
    if (id && id !== "undefined") {
      console.log("Navigating to /sales-order/detail/" + id);
      navigate(`/sales-order/detail/${id}`);
    } else {
      console.error("Invalid Sales Order ID:", id);
      toast.error("Cannot view Sales Order: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    const item = salesOrders.find((row) => row.id === id);
    if (item) {
      setSelectedOrder(id);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
    }
  };

  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedOrder(null);
    setSelectedSalesQuotation("");
    setErrors({});
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteSalesOrder(selectedOrder);
      toast.success("Sales Order deleted successfully");
      setDeleteDialogOpen(false);
      fetchSalesOrdersList();
    } catch (error) {
      console.error("Error deleting Sales Order:", error);
      toast.error("Failed to delete Sales Order");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedSalesQuotation) {
      newErrors.salesQuotation = "Sales Quotation is required";
    } else if (isNaN(parseInt(selectedSalesQuotation))) {
      newErrors.salesQuotation = "Invalid Sales Quotation selected";
    }
    setErrors(newErrors);
    console.log("Form validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSalesOrder = async () => {
    console.log("Create button clicked", {
      loading,
      selectedSalesQuotation,
      isValidNumber: !isNaN(parseInt(selectedSalesQuotation)),
      salesQuotations,
    });
    if (!validateForm()) {
      console.log("Validation failed, button should be disabled");
      toast.error("Please select a valid Sales Quotation");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating Sales Order with data:", {
        salesQuotationID: parseInt(selectedSalesQuotation),
      });
      const response = await createSalesOrder({
        salesQuotationID: parseInt(selectedSalesQuotation),
      });
      console.log("Create Sales Order response:", response);
      const newSalesOrderId =
        response?.newSalesOrderId || response?.data?.newSalesOrderId;
      if (newSalesOrderId) {
        toast.success("Sales Order created successfully");
        handleDialogClose();
        await loadSalesQuotations();
        console.log("Navigating to /sales-order/detail/" + newSalesOrderId);
        navigate(`/sales-order/detail/${newSalesOrderId}`);
      } else {
        throw new Error("No Sales Order ID returned");
      }
    } catch (error) {
      const errorMessage =
        error.message || error?.data?.message || "Failed to create Sales Order";
      console.error("Error creating Sales Order:", errorMessage);
      toast.error(errorMessage);
      if (
        errorMessage.includes("User not authenticated") ||
        errorMessage.includes("No token found") ||
        errorMessage.includes("Authentication required")
      ) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSalesQuotationChange = (e) => {
    const { value } = e.target;
    console.log("Sales Quotation changed", {
      value,
      isValidNumber: !isNaN(parseInt(value)),
      salesQuotations,
    });
    setSelectedSalesQuotation(value);
    setErrors((prev) => ({
      ...prev,
      salesQuotation:
        value && !isNaN(parseInt(value)) ? "" : "Invalid Sales Quotation",
    }));
    console.log("Create button disabled state:", {
      loading,
      hasQuotation: !!value,
      isValidNumber: !isNaN(parseInt(value)),
    });
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
            fetchSalesOrdersList();
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
        <Typography variant="h5">Approved Estimate Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Approved Estimates..."
          />
          <Tooltip title="Add New Approved Estimate">
            <IconButton
              color="primary"
              onClick={() => {
                console.log("Add New Sales Order clicked");
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

      {salesOrders.length === 0 && !loading ? (
        <Typography>No sales orders available.</Typography>
      ) : (
        <DataTable
          rows={salesOrders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id || "unknown"}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={handleView}
          onDelete={handleDeleteClick}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Sales Order? This action cannot
            be undone.
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
        <DialogTitle>Create New Sales Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormSelect
              name="salesQuotation"
              label="Sales Quotation"
              value={selectedSalesQuotation}
              onChange={handleSalesQuotationChange}
              options={salesQuotations}
              error={!!errors.salesQuotation}
              helperText={errors.salesQuotation}
              disabled={loading}
            />
            {salesQuotations.length === 1 &&
              salesQuotations[0].value === "" && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  No Approved Sales Quotations available. Please approve a Sales
                  Quotation first.
                </Typography>
              )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateSalesOrder}
            color="primary"
            variant="contained"
            disabled={
              loading ||
              !selectedSalesQuotation ||
              isNaN(parseInt(selectedSalesQuotation))
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">
            Something went wrong: {this.state.error?.message || "Unknown error"}
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
    <SalesOrderList />
  </ErrorBoundary>
);