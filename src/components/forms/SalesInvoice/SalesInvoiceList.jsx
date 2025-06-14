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
import SalesInvoiceForm from "./SalesInvoiceForm";
import { Chip } from "@mui/material";
import { fetchSalesInvoices, deleteSalesInvoice } from "./SalesInvoiceAPI";
import axios from "axios";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}")?.personId}`,
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
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);

  // Fetch customers list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/customers",
          getHeaders()
        );
        const customersData = response.data.data || [];
        if (customersData.length === 0) {
          console.warn("No customers found in API response");
          toast.warn("No customers found. Customer names may not display correctly.");
        }
        const mappedCustomers = customersData.map((customer) => ({
          id: String(customer.CustomerID),
          name: customer.CustomerName || "Unknown Customer",
        }));
        setCustomers(mappedCustomers);
        console.log("Fetched Customers (Detailed):", mappedCustomers);
        setCustomersLoaded(true);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customers: " + error.message);
        setCustomersLoaded(true);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch sales invoices and map CustomerID to CustomerName
  useEffect(() => {
    const loadSalesInvoices = async () => {
      setLoading(true);
      try {
        const response = await fetchSalesInvoices(page + 1, rowsPerPage);
        const invoices = response.data || [];
        console.log("Fetched Sales Invoices:", invoices);

        if (invoices.length === 0) {
          console.warn("No sales invoices found in API response");
          toast.warn("No sales invoices found.");
        }

        // Map invoices with CustomerName using customers list
        const mappedInvoices = invoices.map((invoice, index) => {
          const customer = customers.find(
            (c) => String(c.id) === String(invoice.CustomerID)
          );
          const invoiceId = invoice.SalesInvoiceID !== undefined && invoice.SalesInvoiceID !== null
            ? invoice.SalesInvoiceID
            : `fallback-${index}`; // Fallback if SalesInvoiceID is missing
          return {
            id: `${invoiceId}`,
            Series: invoice.Series || "-",
            CustomerID: String(invoice.CustomerID) || "N/A",
            CustomerName: customer?.name || "-",
            SupplierName: invoice.SupplierName || "Unknown Supplier",
            PostingDate: invoice.PostingDate || "-",
            DeliveryDate: invoice.DeliveryDate || "-",
            ServiceType: invoice.ServiceType?.ServiceType || "Unknown Service",
            Status: invoice.Status || "Pending",
            Total: invoice.Total || 0,
          };
        });

        console.log("Mapped Sales Invoices:", mappedInvoices);
        setSalesInvoices(mappedInvoices);
        setTotalRows(response.total || 0);
      } catch (error) {
        console.error("Error fetching sales invoices:", error);
        toast.error("Failed to fetch sales invoices: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (customersLoaded) {
      loadSalesInvoices();
    }
  }, [page, rowsPerPage, customers, customersLoaded]);

  // Filter sales invoices based on search term
  const filteredSalesInvoices = salesInvoices.filter((invoice) => {
    const searchString = searchTerm.toLowerCase();
    return (
      invoice.Series?.toLowerCase().includes(searchString) ||
      invoice.CustomerName?.toLowerCase().includes(searchString) ||
      invoice.SupplierName?.toLowerCase().includes(searchString) ||
      invoice.ServiceType?.toLowerCase().includes(searchString) ||
      invoice.Status?.toLowerCase().includes(searchString)
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
        const status = params.value || "Pending";
        let color = "default";
        if (status === "Approved") color = "success";
        else if (status === "Rejected") color = "error";
        else if (status === "Pending") color = "warning";
        return <Chip label={status} color={color} size="small" />;
      },
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
      await deleteSalesInvoice(selectedInvoice);
      setSalesInvoices(
        salesInvoices.filter((invoice) => invoice.id !== selectedInvoice)
      );
      setTotalRows((prev) => prev - 1);
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
        getRowId={(row) => row.id}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
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