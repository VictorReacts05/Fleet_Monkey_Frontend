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
import axios from "axios";
import PurchaseRFQForm from "./PurchaseRFQForm";
import { Chip } from "@mui/material";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const PurchaseRFQList = () => {
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Update the columns definition to include status
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

  // Update the fetchPurchaseRFQs function to include status
  const fetchPurchaseRFQs = async () => {
    try {
      setLoading(true);
      const { headers } = getHeaders();
      const response = await axios.get(
        "http://localhost:7000/api/purchase-rfq",
        { headers }
      );
  
      console.log("Purchase RFQs API response:", response);
  
      let purchaseRFQData = [];
      
      if (Array.isArray(response.data)) {
        purchaseRFQData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        purchaseRFQData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        purchaseRFQData = [];
      }
      
      // Map the data to include status
      const mappedData = purchaseRFQData.map(rfq => ({
        ...rfq,
        id: rfq.PurchaseRFQID,
        Status: rfq.Status || 'Pending'
      }));
      
      setPurchaseRFQs(mappedData);
    } catch (error) {
      console.error("Error fetching Purchase RFQs:", error);
      toast.error("Failed to load Purchase RFQs");
      setPurchaseRFQs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseRFQs();
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    console.log("View clicked for Purchase RFQ ID:", id);
    if (id && id !== "undefined") {
      navigate(`/purchase-rfq/view/${id}`);
    } else {
      console.error("Invalid Purchase RFQ ID:", id);
      toast.error("Cannot view Purchase RFQ: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    const item = rows.find((row) => row.id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
      
    }
    setSelectedRFQ(id);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedRFQ(null);
    fetchPurchaseRFQs(page + 1, rowsPerPage);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deletePurchaseRFQ(itemToDelete.id);
      // toast.success("Purchase RFQ deleted successfully");
      showToast("Purchase RFQ deleted successfully", "success");
      const { headers } = getHeaders();
      await axios.delete(
        `http://localhost:7000/api/purchase-rfqs/${selectedRFQ}`,
        { headers }
      );
      toast.success("Purchase RFQ deleted successfully");
      setDeleteDialogOpen(false);
      fetchPurchaseRFQs(page + 1, rowsPerPage);
    } catch (error) {
      console.error("Error deleting Purchase RFQ:", error);
      toast.error("Failed to delete Purchase RFQ");
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
        <Typography variant="h5">Purchase RFQ Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Purchase RFQs..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={purchaseRFQs.map((row) => ({
          ...row,
          id: row.PurchaseRFQID,
        }))}
        columns={[
          ...columns,
          {
            field: "id",
            headerName: "ID",
            width: 100,
            valueGetter: (params) =>
              params.row.PurchaseRFQID || params.row.id || "No ID",
          },
        ]}
        loading={loading}
        getRowId={(row) => {
          console.log("DataTable getRowId called with row:", row);
          return row.id || "unknown";
        }}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={purchaseRFQs.length}
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
        <DialogTitle>View Purchase RFQ</DialogTitle>
        <DialogContent>
          {selectedRFQ && (
            <PurchaseRFQForm
              purchaseRFQId={selectedRFQ}
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
            Are you sure you want to delete this Purchase RFQ? This action
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

export default PurchaseRFQList;
