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
import { Add } from "@mui/icons-material";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { Chip } from "@mui/material";
import { fetchPurchaseOrders, deletePurchaseOrder } from "./PurchaseOrderAPI";

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
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const searchString = searchTerm.toLowerCase();
    return (
      order.Series?.toLowerCase().includes(searchString) ||
      order.SupplierName?.toLowerCase().includes(searchString) ||
      order.CustomerName?.toLowerCase().includes(searchString) ||
      order.ServiceType?.toLowerCase().includes(searchString) ||
      order.Status?.toLowerCase().includes(searchString)
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

  // Fetch purchase orders on component mount
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      setLoading(true);
      try {
        const response = await fetchPurchaseOrders(page + 1, rowsPerPage);
        setPurchaseOrders(response.data || []);
        setTotalRows(response.total || 0);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Failed to fetch purchase orders");
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
  }, [page, rowsPerPage]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
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
      await deletePurchaseOrder(selectedOrder);
      setPurchaseOrders(purchaseOrders.filter(order => order.id !== selectedOrder));
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