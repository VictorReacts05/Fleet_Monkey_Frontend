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
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { toast } from "react-toastify";
import DataTable from "../../Common/DataTable";
import SearchBar from "../../Common/SearchBar";
import SalesOrderForm from "./SalesOrderForm";

const SalesOrderList = () => {
  const [loading, setLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  // Fetch sales orders from API
  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${APIBASEURL}/sales-Order`);
        if (response.data && response.data.data) {
          const normalized = response.data.data.map(order => ({
            ...order,
            id: order.SalesOrderID || order.id, // Normalize ID field
          }));
          setSalesOrders(normalized);
        } else {
          toast.warn("No sales orders found.");
        }
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        toast.error("Failed to fetch sales orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  // Filter sales orders based on search term
  const filteredSalesOrders = salesOrders.filter((order) => {
    const searchString = searchTerm.toLowerCase();
    return (
      order.Series?.toLowerCase().includes(searchString) ||
      order.CustomerName?.toLowerCase().includes(searchString) ||
      order.SupplierName?.toLowerCase().includes(searchString) ||
      order.ServiceType?.toLowerCase().includes(searchString) ||
      order.Status?.toLowerCase().includes(searchString)
    );
  });

  // Table columns
  const columns = [
    {
      field: "Series",
      headerName: "Series",
      flex: 1,
    },
    {
      field: "CustomerName",
      headerName: "Customer",
      flex: 1.5,
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
    {
      field: "id",
      headerName: "ID",
      width: 100,
      valueGetter: (params) => params.row.id || "No ID",
    },
  ];

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleView = (id) => {
    if (id && id !== "undefined") {
      navigate(`/sales-order/view/${id}`);
    } else {
      toast.error("Cannot view Sales Order: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedOrder(id);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // Replace with actual API call if deletion is implemented
      console.log(`Deleting sales order with ID: ${selectedOrder}`);
      toast.success("Sales Order deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting Sales Order:", error);
      toast.error("Failed to delete Sales Order");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate("/sales-order/add");
  };

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

      <DataTable
        rows={filteredSalesOrders}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id || "unknown"}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredSalesOrders.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onDelete={handleDeleteClick}
      />

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
          <Button onClick={handleDialogClose} color="primary">
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

export default SalesOrderList;
