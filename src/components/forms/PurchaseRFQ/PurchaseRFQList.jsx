import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Stack,
  Tooltip,
  IconButton,
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
import { Add, Visibility, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import PurchaseRFQForm from "./PurchaseRFQForm";

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
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const columns = [
    { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "CustomerName",
      headerName: "Customer",
      flex: 1,
      valueGetter: (params) => params.row.CustomerName || "-",
    },
  ];

  const navigate = useNavigate();

  const fetchPurchaseRFQs = async () => {
    try {
      setLoading(true);
      const { headers } = getHeaders();
      const response = await axios.get(
        "http://localhost:7000/api/purchase-rfq",
        { headers }
      );

      console.log("Purchase RFQs API response:", response);
      console.log("Purchase RFQs data structure:", response.data);

      if (Array.isArray(response.data)) {
        console.log("Response is an array with length:", response.data.length);
        if (response.data.length > 0) {
          console.log("First item properties:", Object.keys(response.data[0]));
          console.log(
            "First item PurchaseRFQID:",
            response.data[0].PurchaseRFQID
          );
        }
        setPurchaseRFQs(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log(
          "Response has data property with length:",
          response.data.data.length
        );
        if (response.data.data.length > 0) {
          console.log(
            "First item properties:",
            Object.keys(response.data.data[0])
          );
          console.log(
            "First item PurchaseRFQID:",
            response.data.data[0].PurchaseRFQID
          );
        }
        setPurchaseRFQs(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setPurchaseRFQs([]);
      }
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

  const handleCreateNew = () => {
    navigate("/purchase-rfq/create");
  };

  const handleView = (id) => {
    console.log("View clicked for Purchase RFQ ID:", id);
    if (id && id !== 'undefined') {
      navigate(`/purchase-rfq/view/${id}`);
    } else {
      console.error("Invalid Purchase RFQ ID:", id);
      toast.error("Cannot view Purchase RFQ: Invalid ID");
    }
  };

  const handleEdit = (id) => {
    setSelectedRFQ(id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedRFQ(id);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedRFQ(null);
    fetchPurchaseRFQs(page + 1, rowsPerPage);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
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

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Purchase RFQs</Typography>
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
        onEdit={handleEdit}
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
        open={editDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Edit Purchase RFQ</DialogTitle>
        <DialogContent>
          {selectedRFQ && (
            <PurchaseRFQForm
              purchaseRFQId={selectedRFQ}
              onClose={handleDialogClose}
              onSave={handleDialogClose}
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
