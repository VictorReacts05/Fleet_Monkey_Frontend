
import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import FormSelect from "../../common/FormSelect";
import { toast } from "react-toastify";
import { Chip } from "@mui/material";
import {
  fetchPurchaseOrders,
  deletePurchaseOrder,
  fetchSalesOrders,
  createPurchaseOrder,
} from "./PurchaseOrderAPI";
import { useAuth } from "../../../context/AuthContext";
import Add from "@mui/icons-material/Add";

const PurchaseOrderList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const user = useSelector((state) => state.loginReducer?.loginDetails?.user);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to view purchase orders");
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch purchase orders
useEffect(() => {
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const { data, totalRecords } = await fetchPurchaseOrders(
        page + 1,
        rowsPerPage,
        null,
        null,
        searchTerm || null
      );
      console.log(
        "Fetched POs (length):",
        data.length,
        "Data:",
        data,
        "Total Records:",
        totalRecords,
        "Page:",
        page + 1,
        "RowsPerPage:",
        rowsPerPage,
        "SearchTerm:",
        searchTerm
      );
      // Fallback: Limit data to rowsPerPage if server returns more
      const paginatedData = data.slice(0, rowsPerPage);
      console.log(
        "Paginated Data (length after slice):",
        paginatedData.length,
        "Paginated Data:",
        paginatedData
      );
      setPurchaseOrders(paginatedData);
      setTotalRows(totalRecords);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load Purchase Orders");
      setPurchaseOrders([]);
      setTotalRows(0);
      setError(error.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  loadPurchaseOrders();
}, [page, rowsPerPage, searchTerm]);
  // Fetch sales orders for create modal
  useEffect(() => {
    const loadSalesOrders = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const salesOrdersData = await fetchSalesOrders(user);
        console.log("Fetched Sales Orders:", salesOrdersData);
        const formattedOptions = [
          { value: "", label: "Select a Sales Order" },
          ...salesOrdersData.map((order) => ({
            value: order.SalesOrderID,
            label: order.Series,
          })),
        ];
        setSalesOrders(formattedOptions);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        toast.error("Failed to load sales orders");
        setSalesOrders([{ value: "", label: "No Sales Orders Available" }]);
      }
    };

    loadSalesOrders();
  }, [user, isAuthenticated]);

  // Table columns definition
  const columns = [
    {
      field: "Series",
      headerName: "Series",
      flex: 1,
    },
    {
      field: "SupplierName",
      headerName: "Supplier",
      flex: 1.5,
      valueGetter: (params) => params.row.SupplierName || "-",
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
    {
      field: "POID",
      headerName: "Purchase Order ID",
      width: 100,
      valueGetter: (params) => params.row.POID || params.row.id || "No ID",
    },
  ];

  const handlePageChange = (newPage) => {
    console.log("Changing to page:", newPage);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    console.log("Changing rows per page to:", newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    console.log("handleView called with ID:", id);
    if (id && id !== "undefined") {
      navigate(`/purchase-order/view/${id}`);
    } else {
      console.error("Invalid Purchase Order ID:", id);
      toast.error("Cannot view Purchase Order: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    console.log("handleDeleteClick called with ID:", id);
    if (id && id !== "undefined") {
      setSelectedOrder(id);
      setDeleteDialogOpen(true);
    } else {
      console.error("Invalid Purchase Order ID for deletion:", id);
      toast.error("Cannot delete Purchase Order: Invalid ID");
    }
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedOrder(null);
    setSelectedSalesOrder("");
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deletePurchaseOrder(selectedOrder, user);
      toast.success("Purchase order deleted successfully");
      setDeleteDialogOpen(false);
      const { data, totalRecords } = await fetchPurchaseOrders(
        page + 1,
        rowsPerPage,
        null,
        null,
        searchTerm || null
      );
      const filteredData = searchTerm
        ? data.filter(
            (order) =>
              order.Series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.SupplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.ServiceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.Status?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data;
      setPurchaseOrders(filteredData);
      setTotalRows(searchTerm ? filteredData.length : totalRecords);
    } catch (error) {
      console.error("Error deleting Purchase Order:", error);
      toast.error("Failed to delete purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    console.log("Search term:", term);
    setSearchTerm(term);
    setPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedSalesOrder) {
      newErrors.salesOrder = "Sales Order is required";
    } else if (isNaN(parseInt(selectedSalesOrder))) {
      newErrors.salesOrder = "Invalid Sales Order selected";
    }
    setErrors(newErrors);
    console.log("Form validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePurchaseOrder = async () => {
    console.log("Create button clicked", {
      loading,
      selectedSalesOrder,
      isValidNumber: !isNaN(parseInt(selectedSalesOrder)),
      salesOrders,
    });
    if (!validateForm()) {
      toast.error("Please select a valid Sales Order");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating PO with data:", {
        salesOrderID: parseInt(selectedSalesOrder),
      });
      const response = await createPurchaseOrder(selectedSalesOrder, user);
      console.log("Create PO Response:", response);
      const newPurchaseOrderId =
        response?.data?.newPurchaseOrderId || response?.newPurchaseOrderId;
      if (newPurchaseOrderId) {
        toast.success("Purchase Order created successfully");
        handleDialogClose();
        const { data, totalRecords } = await fetchPurchaseOrders(
          page + 1,
          rowsPerPage,
          null,
          null,
          searchTerm || null
        );
        const filteredData = searchTerm
          ? data.filter(
              (order) =>
                order.Series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.SupplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.ServiceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.Status?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : data;
        setPurchaseOrders(filteredData);
        setTotalRows(searchTerm ? filteredData.length : totalRecords);
        navigate(`/purchase-order/view/${newPurchaseOrderId}`);
      } else {
        throw new Error("No Purchase Order ID returned");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create Purchase Order";
      console.error("Error creating Purchase Order:", errorMessage);
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

  const handleSalesOrderChange = (e) => {
    const { value } = e.target;
    console.log("Sales Order changed", {
      value,
      isValidNumber: !isNaN(parseInt(value)),
      salesOrders,
    });
    setSelectedSalesOrder(value);
    setErrors((prev) => ({
      ...prev,
      salesOrder: value && !isNaN(parseInt(value)) ? "" : "Invalid Sales Order",
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
            // Note: loadPurchaseOrders is not defined; call fetch directly
            fetchPurchaseOrders(page + 1, rowsPerPage, null, null, searchTerm || null)
              .then(({ data, totalRecords }) => {
                const filteredData = searchTerm
                  ? data.filter(
                      (order) =>
                        order.Series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.SupplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.ServiceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.Status?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : data;
                setPurchaseOrders(filteredData);
                setTotalRows(searchTerm ? filteredData.length : totalRecords);
                setLoading(false);
              })
              .catch((err) => {
                console.error("Retry Fetch Error:", err);
                toast.error("Failed to load Purchase Orders");
                setPurchaseOrders([]);
                setTotalRows(0);
                setError(err.message || "Failed to load purchase orders");
                setLoading(false);
              });
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
        <Typography variant="h6">Purchase Orders</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Purchase Orders..."
          />
          <Tooltip title="Add New Purchase Order">
            <IconButton
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                height: 40,
                width: 40,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

        <DataTable
          rows={purchaseOrders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.POID || row.id || "unknown"}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={handleView}
          onDelete={handleDeleteClick}
          paginationMode="server"
        />

      <Dialog
        open={viewDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>View Purchase Order</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <PurchaseOrderForm
              purchaseOrderId={selectedOrder}
              onClose={handleDialogClose}
              readOnly={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Purchase Order? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
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
        <DialogTitle>Create New Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormSelect
              name="salesOrder"
              label="Sales Order"
              value={selectedSalesOrder}
              onChange={handleSalesOrderChange}
              options={salesOrders}
              error={!!errors.salesOrder}
              helperText={errors.salesOrder}
              disabled={loading}
            />
            {salesOrders.length === 1 && salesOrders[0].value === "" && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                No Approved Sales Orders available.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreatePurchaseOrder}
            color="primary"
            variant="contained"
            disabled={
              loading ||
              !selectedSalesOrder ||
              isNaN(parseInt(selectedSalesOrder))
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ErrorBoundary component
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
    <PurchaseOrderList />
  </ErrorBoundary>
);
