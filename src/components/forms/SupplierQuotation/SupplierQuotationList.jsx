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
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import {
  fetchSupplierQuotations,
  deleteSupplierQuotation,
} from "./SupplierQuotationAPI";
import FormDatePicker from "../../common/FormDatePicker";
import dayjs from "dayjs";

const SupplierQuotationList = () => {
  const navigate = useNavigate();
  const [supplierQuotations, setSupplierQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Define columns for the data table
  const columns = [
    // { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "PurchaseRFQID",
      headerName: "Purchase RFQ ID",
      flex: 1,
      valueGetter: (params) => params.row.SupplierName || "-",
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        console.log(
          "Status renderCell params.value:",
          params.value,
          "row:",
          params.row
        ); // Debug
        const status = params.value ? String(params.value).trim() : "Pending";
        let color = "default";

        if (status.toLowerCase() === "approved") color = "success";
        else if (status.toLowerCase() === "pending") color = "warning";
        else if (status.toLowerCase() === "rejected") color = "error";

        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  // Fetch supplier quotations from API
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).format("YYYY-MM-DD")
        : null;

      const response = await fetchSupplierQuotations(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      console.log("Raw API response:", response); // Debug
      const quotations = response.data || [];
      console.log("Supplier Quotations loaded:", quotations);

      // Map the data for the table
      const mappedData = quotations.map((quotation) => {
        console.log("Mapping quotation:", quotation); // Debug
        return {
          ...quotation,
          id: quotation.SupplierQuotationID,
          Status: quotation.Status || "Pending", // Ensure Status is set
        };
      });

      setSupplierQuotations(mappedData);
      setTotalRows(response.totalRecords || quotations.length);
    } catch (error) {
      console.error("Error loading Supplier Quotations:", error);
      toast.error("Failed to load Supplier Quotations");
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when page/rowsPerPage changes
  useEffect(() => {
    fetchQuotations();
  }, [page, rowsPerPage, fromDate, toDate]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchQuotations();
      return;
    }

    const filteredQuotations = supplierQuotations.filter(
      (quotation) =>
        quotation.Series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.SupplierName?.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        quotation.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSupplierQuotations(filteredQuotations);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreateNew = () => {
    navigate("/supplier-quotation/create");
  };

  const handleView = (id) => {
    console.log("View clicked for Supplier Quotation ID:", id);
    if (id && id !== "undefined") {
      navigate(`/supplier-quotation/view/${id}`);
    } else {
      console.error("Invalid Supplier Quotation ID:", id);
      toast.error("Cannot view Supplier Quotation: Invalid ID");
    }
  };

  const handleEdit = (id) => {
    console.log("Edit clicked for Supplier Quotation ID:", id);
    if (id && id !== "undefined") {
      navigate(`/supplier-quotation/edit/${id}`);
    } else {
      console.error("Invalid Supplier Quotation ID:", id);
      toast.error("Cannot edit Supplier Quotation: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedQuotation(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteSupplierQuotation(selectedQuotation);
      toast.success("Supplier Quotation deleted successfully");
      fetchQuotations();
    } catch (error) {
      console.error("Error deleting Supplier Quotation:", error);
      toast.error("Failed to delete Supplier Quotation");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedQuotation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedQuotation(null);
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
        <Typography variant="h5">Supplier Quotation Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            placeholder="Search Supplier Quotations..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={supplierQuotations.map((row) => ({
          ...row,
          id: row.SupplierQuotationID,
        }))}
        columns={[
          ...columns,
          {
            field: "id",
            headerName: "ID",
            width: 100,
            valueGetter: (params) =>
              params.row.SupplierQuotationID || params.row.id || "No ID",
          },
        ]}
        loading={loading}
        getRowId={(row) => {
          console.log("DataTable getRowId called with row:", row);
          return row.id || "unknown";
        }}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Supplier Quotation? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierQuotationList;
