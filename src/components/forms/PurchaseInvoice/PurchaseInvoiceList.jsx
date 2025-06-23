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
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import PurchaseInvoiceForm from "./PurchaseInvoiceForm";
import { Chip } from "@mui/material";
import { fetchPurchaseInvoices, deletePurchaseInvoice } from "./PurchaseInvoiceAPI";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const PurchaseInvoiceList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoaded, setSuppliersLoaded] = useState(false);

  // Fetch suppliers list
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${APIBASEURL}/suppliers`, getHeaders());
        const suppliersData = response.data.data || [];
       
        const mappedSuppliers = suppliersData.map((supplier) => ({
          id: String(supplier.SupplierID),
          name: supplier.SupplierName || "Unknown Supplier",
        }));
        setSuppliers(mappedSuppliers);
        console.log("Fetched Suppliers (Detailed):", mappedSuppliers);
        setSuppliersLoaded(true);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Failed to fetch suppliers: " + error.message);
        setSuppliersLoaded(true);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch purchase invoices and map SupplierID to SupplierName
  useEffect(() => {
  const loadPurchaseInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchPurchaseInvoices(page + 1, rowsPerPage);
      const invoices = response.data || [];
      console.log("Fetched Purchase Invoices (length):", invoices.length, "Data:", invoices);

      // Map invoices with SupplierName using suppliers list
      const mappedInvoices = invoices.map((invoice, index) => {
        const supplier = suppliers.find(
          (s) => String(s.id) === String(invoice.SupplierID)
        );
        const invoiceId = invoice.PInvoiceID !== undefined && invoice.PInvoiceID !== null
          ? invoice.PInvoiceID
          : `fallback-${index}`; // Fallback if PInvoiceID is missing
        return {
          id: `${invoiceId}`, // Ensure unique ID for DataTable keys
          Series: invoice.Series || "-",
          SupplierID: String(invoice.SupplierID) || "-",
          SupplierName: supplier?.name || ` - `,
          CustomerName: invoice.CustomerName || "-",
          ServiceType: invoice.ServiceType?.ServiceType || "-",
          Status: invoice.Status || "Pending",
          IsPaid: invoice.IsPaid || false,
        };
      });

      console.log("Mapped Purchase Invoices (length):", mappedInvoices.length, "Data:", mappedInvoices);
      // Fallback: Limit to rowsPerPage if server returns more
      const limitedInvoices = mappedInvoices.slice(0, rowsPerPage);
      console.log("Limited Purchase Invoices (length):", limitedInvoices.length, "Data:", limitedInvoices);
      setPurchaseInvoices(limitedInvoices);
      setTotalRows(response.totalRecords || 0); // Updated to use totalRecords
    } catch (error) {
      console.error("Error fetching purchase invoices:", error);
      toast.error("Failed to fetch purchase invoices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (suppliersLoaded) {
    loadPurchaseInvoices();
  }
}, [page, rowsPerPage, suppliers, suppliersLoaded]);

  // Filter purchase invoices based on search term
  const filteredPurchaseInvoices = purchaseInvoices.filter((invoice) => {
    const searchString = searchTerm.toLowerCase();
    return (
      invoice.Series?.toLowerCase().includes(searchString) ||
      invoice.SupplierName?.toLowerCase().includes(searchString) ||
      invoice.CustomerName?.toLowerCase().includes(searchString) ||
      invoice.ServiceType?.toLowerCase().includes(searchString) ||
      invoice.Status?.toLowerCase().includes(searchString)
    );
  });

  // Table columns definition
  const columns = [
    /* {
      field: "Series",
      headerName: "Series",
      flex: 1,
    }, */
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
    /* {
      field: "IsPaid",
      headerName: "Payment Status",
      flex: 1,
      renderCell: (params) => {
        const isPaid = params.value;
        return (
          <Chip
            label={isPaid ? "Paid" : "Unpaid"}
            color={isPaid ? "success" : "error"}
            size="small"
          />
        );
      },
    }, */
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
      navigate(`/purchase-invoice/view/${id}`);
    } else {
      console.error("Invalid Purchase Invoice ID:", id);
      toast.error("Cannot view Purchase Invoice: Invalid ID");
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
      await deletePurchaseInvoice(selectedInvoice);
      setPurchaseInvoices(
        purchaseInvoices.filter((invoice) => invoice.id !== selectedInvoice)
      );
      setTotalRows((prev) => prev - 1);
      toast.success("Purchase Invoice deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting Purchase Invoice:", error);
      toast.error("Failed to delete Purchase Invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleAdd = () => {
    navigate("/purchase-invoice/add");
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
        <Typography variant="h5">Bill Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Invoices..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={filteredPurchaseInvoices}
        columns={[
          ...columns,
          {
            field: "id",
            headerName: "ID",
            width: 100,
            valueGetter: (params) => {
              const idParts = params.row.id.split('-');
              return idParts[0]; // Display only the PInvoiceID part (e.g., "2252")
            },
          },
        ]}
        loading={loading}
        getRowId={(row) => row.id} // Use the unique id with index
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
        <DialogTitle>View Purchase Invoice</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <PurchaseInvoiceForm
              purchaseInvoiceId={selectedInvoice}
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
            Are you sure you want to delete this Purchase Invoice? This action
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

export default PurchaseInvoiceList;