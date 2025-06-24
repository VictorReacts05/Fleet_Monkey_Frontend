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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import { toast } from "react-toastify";
import SalesInvoiceForm from "./SalesInvoiceForm";
import { Chip } from "@mui/material";
import {
  fetchSalesInvoices,
  deleteSalesInvoice,
  fetchSalesOrders,
  createSalesInvoice,
} from "./SalesInvoiceAPI";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";
import Add from "@mui/icons-material/Add";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        JSON.parse(localStorage.getItem("user") || "{}")?.personId
      }`,
    },
  };
};

const SalesInvoiceList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState("");

  const navigate = useNavigate();

  const loadSalesInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchSalesInvoices(
        page + 1,
        rowsPerPage,
        null,
        null,
        searchTerm
      );
      const invoices = response.data || [];
      console.log(
        "Fetched Sales Invoices (length):",
        invoices.length,
        "Data:",
        invoices,
        "Full Response:",
        response
      );

      const mappedInvoices = invoices.map((invoice, index) => {
        const customer = customers.find(
          (c) => String(c.id) === String(invoice.CustomerID)
        );
        const invoiceId =
          invoice.SalesInvoiceID !== undefined &&
          invoice.SalesInvoiceID !== null
            ? invoice.SalesInvoiceID
            : `fallback-${index}`;
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
          Total: invoice.totalRecords || 0,
        };
      });

      console.log(
        "Mapped Sales Invoices (length):",
        mappedInvoices.length,
        "Data:",
        mappedInvoices
      );
      setSalesInvoices(mappedInvoices);
      setTotalRows(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching sales invoices:", error);
      console.log("Failed to fetch sales invoices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customersLoaded) {
      loadSalesInvoices();
    }
  }, [page, rowsPerPage, searchTerm, customers, customersLoaded]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${APIBASEURL}/customers`,
          getHeaders()
        );
        const customersData = response.data.data || [];
        if (customersData.length === 0) {
          console.warn("No customers found in API response");
          toast.warn(
            "No customers found. Customer names may not display correctly."
          );
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
        console.log("Failed to fetch customers: " + error.message);
        setCustomersLoaded(true);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const loadSalesOrders = async () => {
      try {
        const salesOrdersData = await fetchSalesOrders();
        const formattedSalesOrders = [
          { value: "", label: "Select a Sales Order" },
          ...salesOrdersData.map((order) => ({
            value: String(order.SalesOrderID),
            label: order.Series || `Sales Order #${order.SalesOrderID}`,
          })),
        ];
        setSalesOrders(formattedSalesOrders);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        console.log("Failed to fetch sales orders: " + error.message);
        setSalesOrders([{ value: "", label: "No Sales Orders Available" }]);
      }
    };

    loadSalesOrders();
  }, []);

  const columns = [
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
  ];

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
      console.log("Cannot view Sales Invoice: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedInvoice(id);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedInvoice(null);
    setSelectedSalesOrder("");
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
      console.log("Failed to delete Sales Invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleCreateSalesInvoice = async () => {
    if (!selectedSalesOrder) {
      console.log("Please select a Sales Order");
      return;
    }

    try {
      setLoading(true);
      const response = await createSalesInvoice({
        salesOrderId: parseInt(selectedSalesOrder),
      });
       console.log("Create SAAAAALES Response:", response);
      toast.success("Sales Invoice created successfully");
      // Refresh invoice list
      await loadSalesInvoices();
      handleDialogClose();
      navigate(`/sales-invoice/view/${response?.data?.salesInvoiceId}`);
    } catch (error) {
      console.error("Error creating Sales Invoice:", error);
      console.log("Failed to create Sales Invoice: " + error.message);
    } finally {
      setLoading(false);
    }
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
        <Typography variant="h5">Invoice Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar onSearch={handleSearch} placeholder="Search Text..." />
          <Tooltip title="Add New Sales Invoice">
            <IconButton
              color="primary"
              onClick={() => {
                console.log("Add New Sales Invoice clicked");
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
        rows={salesInvoices}
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
        paginationMode="server"
      />

      <Dialog
        open={viewDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
        disableEnforceFocus
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
        disableEnforceFocus
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

      <Dialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
        disableEnforceFocus
      >
        <DialogTitle>Create New Sales Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="sales-order-select-label">Sales Order</InputLabel>
              <Select
                labelId="sales-order-select-label"
                value={selectedSalesOrder}
                label="Sales Order"
                onChange={(e) => setSelectedSalesOrder(e.target.value)}
              >
                {salesOrders.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {salesOrders.length === 1 && salesOrders[0].value === "" && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                No Sales Orders available. Please create a Sales Order first.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateSalesInvoice}
            color="primary"
            variant="contained"
            disabled={loading || !selectedSalesOrder}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesInvoiceList;
