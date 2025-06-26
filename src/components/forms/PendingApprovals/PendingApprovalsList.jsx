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
    Authorization: `Bearer ${
      JSON.parse(localStorage.getItem("user") || "{}")?.personId
    }`,
  },
});

const getUniqueFormNames = (data) => {
  const formNames = data.map((item) => item.FormName);
  const uniqueFormNames = [...new Set(formNames)];
  return uniqueFormNames.slice(0, 5).map((f) => ({ value: f, label: f }));
};

// Mapping of form names to routes and type IDs
const formConfigMap = {
  "Sales RFQ": { route: "sales-rfq", typeId: 1 },
  "Purchase RFQ": { route: "purchase-rfq", typeId: 2 },
  "Supplier Quotation": { route: "supplier-quotation", typeId: 3 },
  "Sales Quotation": { route: "sales-quotation", typeId: 4 },
  "Sales Order": { route: "sales-order", typeId: 5 },
  "Purchase Order": { route: "purchase-order", typeId: 6 },
  "Bill": { route: "purchase-invoice", typeId: 7 },
  "Invoice": { route: "sales-invoice", typeId: 8 },
  "Estimate": { route: "estimate", typeId: 9 },
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
      `${APIBASEURL}/pendingApprovals?pageSize=${rowsPerPage}&pageNumber=${page + 1}`, // 1-based indexing
      getHeaders()
    );

    console.log("API Response:", response.data); // Debug log

    const data = response.data?.data || [];
    const total = response.data?.total || response.data?.totalRecords || data.length;

    setPendingApprovals(data);
    setTotalRows(total);
    setAvailableFormNames(getUniqueFormNames(data));
  } catch (error) {
    console.error("Failed to fetch pending approvals:", error);
    console.log("Error fetching pending approvals.");
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

 const handleView = (id, formName) => {
  console.log("handleView called with:", { id, formName }); // Debug log
  if (!id || !formName) {
    console.log("Invalid record selected.");
    return;
  }

  const config = formConfigMap[formName];
  if (!config) {
    toast.warning(`View not implemented for: ${formName}`);
    return;
  }

  // Extract the number after the third hyphen
  const extractId = (str) => {
    const parts = str.split('-');
    if (parts.length >= 4) {
      return parts[3]; // Return the number after the third hyphen
    }
    return str; // Fallback to original id if format doesn't match
  };

  const extractedId = extractId(id);
  const { route, typeId } = config;
  navigate(`/${route}/view/${extractedId}`);
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
      console.log("Failed to delete approval.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const columns = [
    {
      field:"FormName",headerName:"Form Name",flex:1
    },
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
      headerName: "Action",
      flex: 0.6,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleView(params.row.Series, params.row.FormName)}
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
            placeholder="Search Text..."
            style={{ minWidth: 250 }}
          />
        </Box>
      </Box>

      <DataTable
  rows={filteredApprovals}
  columns={columns}
  loading={loading}
  getRowId={(row) => row.Series}
  page={page}
  rowsPerPage={rowsPerPage}
  totalRows={totalRows}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handleRowsPerPageChange}
  hideActions={true}
/>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this approval?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApprovalsList;