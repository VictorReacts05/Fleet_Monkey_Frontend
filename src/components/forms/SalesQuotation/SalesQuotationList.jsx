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
import SalesQuotationForm from "./SalesQuotationForm";
import { Chip } from "@mui/material";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const SalesQuotationList = () => {
  const [salesQuotations, setSalesQuotations] = useState([  {
    SalesQuotationID: 1,
    Series: "SQ-2024-001",
    CustomerName: "ABC Company",
    Status: "Approved",
    CreatedDate: "2024-01-15"
  },
  {
    SalesQuotationID: 2,
    Series: "SQ-2024-002",
    CustomerName: "XYZ Corp",
    Status: "Pending",
    CreatedDate: "2024-01-16"
  },
  {
    SalesQuotationID: 3,
    Series: "SQ-2024-003",
    CustomerName: "123 Industries",
    Status: "Rejected",
    CreatedDate: "2024-01-17"
  },
  {
    SalesQuotationID: 4,
    Series: "SQ-2024-004",
    CustomerName: "Tech Solutions",
    Status: "Approved",
    CreatedDate: "2024-01-18"
  },
  {
    SalesQuotationID: 5,
    Series: "SQ-2024-005",
    CustomerName: "Global Trading",
    Status: "Pending",
    CreatedDate: "2024-01-19"
  }
]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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

  const fetchSalesQuotations = async () => {
    try {
      setLoading(true);
      const { headers } = getHeaders();
      const response = await axios.get(
        "http://localhost:7000/api/sales-quotation",
        { headers }
      );
      console.log("Sales Quotations API response:", response);
      let quotationData = [];
      if (Array.isArray(response.data)) {
        quotationData = response.data;
      } 
      else if (response.data && Array.isArray(response.data.data)) {
        quotationData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        quotationData = [];
      }
      const mappedData = quotationData.map(quotation => ({
        ...quotation,
        id: quotation.SalesQuotationID,
        Status: quotation.Status || 'Pending',
        CreatedDate: dayjs(quotation.CreatedDate).format("YYYY-MM-DD")
      }));
      setSalesQuotations(mappedData);
      setTotalRows(mappedData.length);
    } catch (error) {
      console.error("Error fetching Sales Quotations:", error);
      toast.error("Failed to fetch Sales Quotations");
    }
  };

  useEffect(() => {
    fetchSalesQuotations();
  }, []);

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    try {
      setLoading(true);
      const { headers } = getHeaders();
      const response = await axios.get(
        "http://localhost:7000/api/sales-quotation",
        { headers }
      );

      console.log("Sales Quotations API response:", response);

      let quotationData = [];

      if (Array.isArray(response.data)) {
        quotationData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        quotationData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        quotationData = [];
      }

      const mappedData = quotationData.map(quotation => ({
        ...quotation,
        id: quotation.SalesQuotationID,
        Status: quotation.Status || 'Pending'
      }));

      setSalesQuotations(mappedData);
    } catch (error) {
      console.error("Error fetching", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    console.log("View clicked for Sales Quotation ID:", id);
    if (id && id !== "undefined") {
      navigate(`/sales-quotation/view/${id}`);
    } else {
      console.error("Invalid Sales Quotation ID:", id);
      toast.error("Cannot view Sales Quotation: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    const item = salesQuotations.find((row) => row.id === id);
    if (item) {
      setSelectedQuotation(id);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
    }
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedQuotation(null);
    fetchSalesQuotations();
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { headers } = getHeaders();
      await axios.delete(
        `http://localhost:7000/api/sales-quotation/${selectedQuotation}`,
        { headers }
      );
      showToast("Sales Quotation deleted successfully", "success");
      setDeleteDialogOpen(false);
      fetchSalesQuotations();
    } catch (error) {
      console.error("Error deleting Sales Quotation:", error);
      toast.error("Failed to delete Sales Quotation");
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
        <Typography variant="h5">Sales Quotation Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Sales Quotations..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={salesQuotations.map((row) => ({
          ...row,
          id: row.SalesQuotationID,
        }))}
        columns={[
          ...columns,
          {
            field: "id",
            headerName: "ID",
            width: 100,
            valueGetter: (params) =>
              params.row.SalesQuotationID || params.row.id || "No ID",
          },
        ]}
        loading={loading}
        getRowId={(row) => row.id || "unknown"}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={salesQuotations.length}
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
        <DialogTitle>View Sales Quotation</DialogTitle>
        <DialogContent>
          {selectedQuotation && (
            <SalesQuotationForm
              salesQuotationId={selectedQuotation}
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
            Are you sure you want to delete this Sales Quotation? This action
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

export default SalesQuotationList;