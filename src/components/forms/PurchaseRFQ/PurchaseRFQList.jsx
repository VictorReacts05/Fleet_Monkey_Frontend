import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Common/DataTable";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchPurchaseRFQs, deletePurchaseRFQ } from "./PurchaseRFQAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from './../../Common/SearchBar';

const PurchaseRFQList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "series", headerName: "Purchase RFQ Series", flex: 1 }
  ];

  useEffect(() => {
    loadPurchaseRFQs();
  }, [page, rowsPerPage, fromDate, toDate]);

  const loadPurchaseRFQs = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).format("YYYY-MM-DD")
        : null;

      const response = await fetchPurchaseRFQs(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const purchaseRFQs = response.data || [];

      const mappedRows = purchaseRFQs.map((purchaseRFQ) => ({
        id: purchaseRFQ.PurchaseRFQID,
        series: purchaseRFQ.Series || "N/A"  // Changed from PurchaseRFQSeries to Series
      }));

      setRows(mappedRows);
      setTotalRows(response.totalRecords || purchaseRFQs.length);
    } catch (error) {
      console.error("Error loading PurchaseRFQs:", error);
      toast.error("Failed to load Purchase RFQs");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreate = () => {
    navigate("/purchase-rfq/create");
  };

  const handleRowClick = (id) => {
    navigate(`/purchase-rfq/edit/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/purchase-rfq/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/purchase-rfq/edit/${id}?view=true`);
  };

  const handleDeleteClick = (id) => {
    const item = rows.find((row) => row.id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deletePurchaseRFQ(itemToDelete.id);
      toast.success("Purchase RFQ deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadPurchaseRFQs();
    } catch (error) {
      toast.error("Failed to delete Purchase RFQ: " + error.message);
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
        <Typography variant="h5">Purchase RFQ Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            // onSearch={handleSearch}
            placeholder="Search Purchase RFQs..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add New Purchase RFQ">
            <IconButton
              color="primary"
              onClick={handleCreate}
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
        rows={rows}
        columns={columns}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={(params) => handleRowClick(params.id)}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDeleteClick}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        content={`Are you sure you want to delete this Purchase RFQ?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </Box>
  );
};

export default PurchaseRFQList;