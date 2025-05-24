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
import { Add } from "@mui/icons-material";
import { showToast } from "../../toastNotification";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { Chip } from "@mui/material";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const PurchaseOrderList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Static data for the table
  const purchaseOrders = [
    {
      id: 1,
      Series: "PO2025-001",
      SupplierName: "ABC Suppliers Inc",
      CustomerName: "John Smith",
      PostingDate: "2025-06-10",
      DeliveryDate: "2025-06-15",
      ServiceType: "International Shipping",
      Status: "Approved",
      Total: 13750.0,
    },
    {
      id: 2,
      Series: "PO2025-002",
      SupplierName: "XYZ Logistics",
      CustomerName: "Jane Doe",
      PostingDate: "2025-06-12",
      DeliveryDate: "2025-06-18",
      ServiceType: "Domestic Shipping",
      Status: "Pending",
      Total: 8500.0,
    },
    {
      id: 3,
      Series: "PO2025-003",
      SupplierName: "Global Transport Co",
      CustomerName: "Robert Johnson",
      PostingDate: "2025-06-14",
      DeliveryDate: "2025-06-20",
      ServiceType: "Express Delivery",
      Status: "Approved",
      Total: 22000.0,
    },
    {
      id: 4,
      Series: "PO2025-004",
      SupplierName: "Fast Freight Ltd",
      CustomerName: "Emily Williams",
      PostingDate: "2025-06-15",
      DeliveryDate: "2025-06-22",
      ServiceType: "International Shipping",
      Status: "Rejected",
      Total: 15300.0,
    },
    {
      id: 5,
      Series: "PO2025-005",
      SupplierName: "Reliable Shipping Inc",
      CustomerName: "Michael Brown",
      PostingDate: "2025-06-16",
      DeliveryDate: "2025-06-25",
      ServiceType: "Domestic Shipping",
      Status: "Approved",
      Total: 9800.0,
    },
  ];

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const searchString = searchTerm.toLowerCase();
    return (
      order.Series.toLowerCase().includes(searchString) ||
      order.SupplierName.toLowerCase().includes(searchString) ||
      order.CustomerName.toLowerCase().includes(searchString) ||
      order.ServiceType.toLowerCase().includes(searchString) ||
      order.Status.toLowerCase().includes(searchString)
    );
  });

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
        const status = params.value || 'Pending';
        let color = 'default';
        
        if (status === 'Approved') color = 'success';
        else if (status === 'Rejected') color = 'error';
        else if (status === 'Pending') color = 'warning';
        
        return <Chip label={status} color={color} size="small" />;
      }
    },
  ];

  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    console.log("View clicked for Purchase Order ID:", id);
    if (id && id !== "undefined") {
      navigate(`/purchase-order/view/${id}`);
    } else {
      console.error("Invalid Purchase Order ID:", id);
      toast.error("Cannot view Purchase Order: Invalid ID");
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
      // In a real app, you would call an API to delete the purchase order
      console.log(`Deleting purchase order with ID: ${selectedOrder}`);
      toast.success("Purchase Order deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting Purchase Order:", error);
      toast.error("Failed to delete Purchase Order");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleAdd = () => {
    navigate("/purchase-order/add");
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
        <Typography variant="h5">Purchase Order Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Purchase Orders..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={filteredPurchaseOrders}
        columns={[
          ...columns,
          {
            field: "id",
            headerName: "ID",
            width: 100,
            valueGetter: (params) => params.row.id || "No ID",
          },
        ]}
        loading={loading}
        getRowId={(row) => row.id || "unknown"}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredPurchaseOrders.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onDelete={handleDeleteClick}
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
            Are you sure you want to delete this Purchase Order? This action
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

export default PurchaseOrderList;