import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../Common/DataTable";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchSalesRFQs, deleteSalesRFQ } from "./SalesRFQAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";

const SalesRFQList = () => {
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

  const columns = [{ field: "series", headerName: "Series", flex: 1 }];

  useEffect(() => {
    loadSalesRFQs();
  }, [page, rowsPerPage, fromDate, toDate]);

  const loadSalesRFQs = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).format("YYYY-MM-DD")
        : null;

      const response = await fetchSalesRFQs(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const salesRFQs = response.data || [];

      const mappedRows = salesRFQs.map((salesRFQ) => ({
        id: salesRFQ.SalesRFQID,
        series: salesRFQ.Series || "N/A",
      }));

      setRows(mappedRows);
      setTotalRows(response.totalRecords || salesRFQs.length);
    } catch (error) {
      console.error("Error loading SalesRFQs:", error);
      toast.error("Failed to load SalesRFQs");
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
    navigate("/sales-rfq/create");
  };

  const handleRowClick = (id) => {
    navigate(`/sales-rfq/edit/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/sales-rfq/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/sales-rfq/edit/${id}?view=true`);
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
      await deleteSalesRFQ(itemToDelete.id);
      toast.success("SalesRFQ deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSalesRFQs();
    } catch (error) {
      toast.error("Failed to delete SalesRFQ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    loadSalesRFQs();
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
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
        <Typography variant="h5">Sales RFQ Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormDatePicker
            label="From Date"
            value={fromDate}
            onChange={handleFromDateChange}
            sx={{ width: 200 }}
          />
          <FormDatePicker
            label="To Date"
            value={toDate}
            onChange={handleToDateChange}
            sx={{ width: 200 }}
          />
          <Tooltip title="Add New Sales RFQ">
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
        onDelete={handleDeleteClick}
        onView={handleView}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Sales RFQ"
        message={`Are you sure you want to delete the Sales RFQ: ${itemToDelete?.series}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </Box>
  );
};

export default SalesRFQList;
