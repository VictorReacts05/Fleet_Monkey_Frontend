import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DataTable from "../../Common/DataTable";
import SearchBar from "../../Common/SearchBar";
import FormSelect from "../../Common/FormSelect";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getHeaders = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}")?.personId}`,
    },
});

const getUniqueFormNames = (data) => {
  const formNames = data.map((item) => item.FormName);
  const uniqueFormNames = [...new Set(formNames)];
  // Limit to first five unique form names
  return uniqueFormNames.slice(0, 5).map(f => ({ value: f, label: f }));
};

const PendingApprovalsList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [formNameFilter, setFormNameFilter] = useState("");
  const [availableFormNames, setAvailableFormNames] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIBASEURL}/pendingApprovals?pageSize=${rowsPerPage}&pageNumber=${page + 1}`,
        getHeaders()
      );

      const data = response.data?.data || [];
      const total = response.data?.total;

      setPendingApprovals(data);
      setTotalRows(typeof total === "number" ? total : data.length);
      setAvailableFormNames(getUniqueFormNames(data));
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      toast.error("Error fetching pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [page, rowsPerPage]);

  const filteredApprovals = pendingApprovals.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.Series?.toLowerCase().includes(search) ||
      item.Status?.toLowerCase().includes(search) ||
      item.RequestedBy?.toLowerCase().includes(search);

    const matchesForm = formNameFilter === "" || item.FormName === formNameFilter;

    return matchesSearch && matchesForm;
  });

  const formViewRouteMap = {
    "Sales RFQ": "sales-rfq",
    "Purchase RFQ": "purchase-rfq",
    "Supplier Quotation": "supplier-quotation",
    "Sales Quotation": "sales-quotation",
    "Sales Order": "sales-order",
    "Purchase Order": "purchase-order", // Corrected to 'purchase-order' for consistency
    "Invoice": "sales-invoice",
    "Bill": "purchase-invoice", // Assuming 'Bill' maps to Purchase Invoice
    "Estimate": "estimate",
  };

  const handleView = (id, formName) => {
    if (!id || !formName) {
      toast.error("Invalid record selected.");
      return;
    }
    const recordId = id || (typeof id === "string" ? id : id.toString()); // Ensure id is a string
    const route = formViewRouteMap[formName];
    if (route) {
      console.log(`Navigating to: /${route}/view/${recordId}`);
      navigate(`/${route}/view/${recordId}`);
    } else {
      toast.warning(`View not implemented for: ${formName}`);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${APIBASEURL}/pendingApprovals/${selectedId}`, getHeaders());
      setPendingApprovals((prev) => prev.filter((item) => item.id !== selectedId));
      setTotalRows((prev) => prev - 1);
      toast.success("Deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete approval.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const columns = [
    { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "Status",
      headerName: "Status",
      flex: 0.6,
      renderCell: (params) => {
        const status = params.value || "Pending";
        let color = "default";
        if (status === "Approved") color = "success";
        else if (status === "Rejected") color = "error";
        else color = "warning";
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleView(params._id || params.row.id, params.row.FormName)}
        >
          VIEW
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h5">Pending Approvals</Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <FormSelect
            label="Filter by Form"
            value={formNameFilter}
            onChange={(e) => setFormNameFilter(e.target.value)}
            options={[{ value: "", label: "Select Form" }, ...availableFormNames]}
            sx={{ minWidth: 50 }}
          />
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search approvals..."
            style={{ minWidth: 250 }}
          />
        </Box>
      </Box>

      <DataTable
        rows={filteredApprovals}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id || row._id}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        hideActions={true}
        // onView={handleView} // Added to enable view action
        // onDelete={handleDeleteClick} // Added to enable delete action
      />

      
    </Box>
  );
};

export default PendingApprovalsList;
