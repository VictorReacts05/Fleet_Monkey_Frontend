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
import axios from "axios";
import { toast } from "react-toastify";
import DataTable from "../../Common/DataTable";
import SearchBar from "../../Common/SearchBar";
import FilterListIcon from '@mui/icons-material/FilterList';
import FormSelect from "../../common/FormSelect";


const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}")?.personId}`,
    },
  };
};

const PendingApprovalsList = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState([]);
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
        `http://localhost:7000/api/pendingApprovals?pageSize=${rowsPerPage}&pageNumber=${page + 1}`,
        getHeaders()
      );

      const data = response.data?.data || [];
      setPendingApprovals(data);
      setTotalRows(response.data?.total || data.length);
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
    return (
      item.Series?.toLowerCase().includes(search) ||
      item.Status?.toLowerCase().includes(search) ||
      item.RequestedBy?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value || "Pending";
        let color = "default";
        if (status === "Approved") color = "success";
        else if (status === "Rejected") color = "error";
        else color = "warning";
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

  // const handleView = (id) => {
  //   if (id) navigate(`/pending-approval/view/${id}`);
  // };

  // const handleDeleteClick = (id) => {
  //   setSelectedId(id);
  //   setDeleteDialogOpen(true);
  // };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:7000/api/pendingApprovals/${selectedId}`, getHeaders());
      setPendingApprovals(prev => prev.filter(item => item.id !== selectedId));
      setTotalRows(prev => prev - 1);
      toast.success("Deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete approval.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Pending Approvals</Typography>
        <SearchBar onSearch={setSearchTerm} placeholder="Search approvals..." />

        {/* <Button
      variant="text"
      startIcon={<FilterListIcon />}
      onClick={() => {
        // You can open a filter dialog or dropdown here
        toast.info("Filter UI not implemented yet.");
      }}
    >
      Add Filter
    </Button> */}

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
        // onView={handleView}
        // onDelete={handleDeleteClick}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApprovalsList;
