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
import SalesInvoiceForm from "./SalesInvoiceForm";
import { Chip } from "@mui/material";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const SalesInvoiceList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Static data for the table
  const salesInvoices = [
    {
      id: 1,
      Series: "SI2025-001",
      CustomerName: "John Smith",
      SupplierName: "ABC Suppliers Inc",
      PostingDate: "2025-06-10",
      DeliveryDate: "2025-06-15",
      ServiceType: "International Shipping",
      Status: "Approved",
      Total: 13750.0,
    },
    {
      id: 2,
      Series: "SI2025-002",
      CustomerName: "Jane Doe",
      SupplierName: "XYZ Logistics",
      PostingDate: "2025-06-12",
      DeliveryDate: "2025-06-18",
      ServiceType: "Domestic Shipping",
      Status: "Pending",
      Total: 8500.0,
    },
    {
      id: 3,
      Series: "SI2025-003",
      CustomerName: "Robert Johnson",
      SupplierName: "Global Transport Co",
      PostingDate: "2025-06-14",
      DeliveryDate: "2025-06-20",
      ServiceType: "Express Delivery",
      Status: "Approved",
      Total: 22000.0,
    },
    {
      id: 4,
      Series: "SI2025-004",
      CustomerName: "Emily Williams",
      SupplierName: "Fast Freight Ltd",
      PostingDate: "2025-06-15",
      DeliveryDate: "2025-06-22",
      ServiceType: "International Shipping",
      Status: "Rejected",
      Total: 15300.0,
    },
    {
      id: 5,
      Series: "SI2025-005",
      CustomerName: "Michael Brown",
      SupplierName: "Reliable Shipping Inc",
      PostingDate: "2025-06-16",
      DeliveryDate: "2025-06-25",
      ServiceType: "Domestic Shipping",
      Status: "Approved",
      Total: 9800.0,
    },
  ];

  // Filter sales invoices based on search term
  const filteredSalesInvoices = salesInvoices.filter((invoice) => {
    const searchString = searchTerm.toLowerCase();
    return (
      invoice.Series.toLowerCase().includes(searchString) ||
      invoice.CustomerName.toLowerCase().includes(searchString) ||
      invoice.SupplierName.toLowerCase().includes(searchString) ||
      invoice.ServiceType.toLowerCase().includes(searchString) ||
      invoice.Status.toLowerCase().includes(searchString)
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
        const status = params.value || 'Pending';
        let color = 'default';
        
        if (status === 'Approved') color = 'success';
        else if (status === 'Rejected') color = 'error';
        else if (status === 'Pending') color = 'warning';
        
        return <Chip label={status} color={color} size="small" />;
      }
    },
    {
      field: "Total",
      headerName: "Total",
      flex: 1,
      valueGetter: (params) => 
        params.row.Total ? `$${params.row.Total.toFixed(2)}` : "$0.00",
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
    console.log("View clicked for Sales Invoice ID:", id);
    if (id && id !== "undefined") {
      navigate(`/sales-invoice/view/${id}`);
    } else {
      console.error("Invalid Sales Invoice ID:", id);
      toast.error("Cannot view Sales Invoice: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedInvoice(id);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedInvoice(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // In a real app, you would call an API to delete the sales invoice
      console.log(`Deleting sales invoice with ID: ${selectedInvoice}`);
      toast.success("Sales Invoice deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting Sales Invoice:", error);
      toast.error("Failed to delete Sales Invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleAdd = () => {
    navigate("/sales-invoice/add");
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
        <Typography variant="h5">Sales Invoice Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center"> 
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Sales Invoices..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={filteredSalesInvoices}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id || "unknown"}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredSalesInvoices.length}
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
        <DialogTitle>View Sales Invoice</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <SalesInvoiceForm
              salesInvoiceId={selectedInvoice}
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
            Are you sure you want to delete this Sales Invoice? This action
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

export default SalesInvoiceList;