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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Common/DataTable";
import SearchBar from "../../Common/SearchBar";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { showToast } from "../../toastNotification";
import axios from "axios";
import SalesOrderForm from "./SalesOrderForm";
import { Chip } from "@mui/material";
import { getAuthHeader } from "./SalesOrderAPI";

const SalesOrderList = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personId, setPersonId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState(null);

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
      field: "OrderDate",
      headerName: "Order Date",
      flex: 1,
      valueGetter: (params) => {
        if (params.row.OrderDate) {
          return dayjs(params.row.OrderDate).isValid()
            ? dayjs(params.row.OrderDate).format("YYYY-MM-DD")
            : "Invalid Date";
        }
        return "-";
      },
    },
    {
      field: "Total",
      headerName: "Total Amount",
      flex: 1,
      valueGetter: (params) => {
        const total = params.row.Total || params.row.TotalAmount || 0;
        return `$${Number(total).toFixed(2)}`;
      },
    },
  ];

  const navigate = useNavigate();

  // Check authentication and load personId
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

  // Fetch Sales Orders
  const fetchSalesOrders = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const { headers } = getAuthHeader();
      console.log("Fetching Sales Orders with headers:", headers);
      
      const response = await axios.get(
        `${APIBASEURL}/sales-order?page=${page + 1}&limit=${rowsPerPage}`,
        { headers }
      );
      
      console.log("Sales Orders API response:", response.data);
      
      const orderData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];
        
      if (!orderData.length) {
        console.warn("No sales orders found in response:", response.data);
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
        setTotalRows(response.data.total || mappedData.length);
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
      
      console.error("Error fetching Sales Orders:", error.response || error.message);
      
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

  useEffect(() => {
    checkAuthAndLoadPersonId();
  }, []);

  useEffect(() => {
    if (personId) {
      fetchSalesOrders();
    }
  }, [personId, page, rowsPerPage]);

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    await fetchSalesOrders();
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchSalesOrders();
  };

  const handleView = (id) => {
    console.log("View clicked for Sales Order ID:", id);
    if (id && id !== "undefined") {
      navigate(`/sales-order/view/${id}`);
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
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { headers } = getAuthHeader();
      await axios.delete(
        `${APIBASEURL}/sales-order/${selectedOrder}`,
        { headers }
      );
      showToast("Sales Order deleted successfully", "success");
      setDeleteDialogOpen(false);
      fetchSalesOrders();
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
            fetchSalesOrders();
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
        <Typography variant="h5">Sales Order Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Sales Orders..."
          />
        </Stack>
      </Box>
      
      {salesOrders.length === 0 && !loading ? (
        <Typography>No sales orders available.</Typography>
      ) : (
        <DataTable
          rows={salesOrders}
          columns={[
            ...columns,
            {
              field: "id",
              headerName: "ID",
              width: 100,
              valueGetter: (params) =>
                params.row.SalesOrderID || params.row.id || "No ID",
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
          onDelete={handleDeleteClick}
        />
      )}

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>View Sales Order</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <SalesOrderForm
              salesOrderId={selectedOrder}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Sales Order? This action
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
    </Box>
  );
};

// Error boundary component
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
    <SalesOrderList />
  </ErrorBoundary>
);