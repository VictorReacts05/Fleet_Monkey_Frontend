import React, { useState, useEffect } from "react";
import { Typography, Box, Stack, Tooltip, IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import DataTable from "../../Common/DataTable";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchUOMs, deleteUOM } from "./uomapi";
import UOMModal from "./uommodal";
import SearchBar from "../../Common/SearchBar";

const UOMList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Changed to 5 for 2 pages with 10 records
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUOMId, setSelectedUOMId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "uom", headerName: "Unit of Measurement", flex: 1 },
  ];

  const loadUOMs = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchUOMs(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      const uoms = response.data || [];

      const formattedRows = uoms
        .filter((uom) => !uom.IsDeleted)
        .map((uom) => ({
          id: uom.UOMID,
          uom: uom.UOM || "N/A",
        }));

      setRows(formattedRows);
      // Fallback to rows.length if totalRecords is 0 or invalid
      const total =
        response.totalRecords > 0
          ? response.totalRecords
          : formattedRows.length * (page + 1);
      setTotalRows(total);

      console.log("Total number of rows:", total);
      console.log("Number of rows on current page:", formattedRows.length);
      console.log("Current page:", page);
      console.log("Rows per page:", rowsPerPage);
      console.log("Backend totalRecords:", response.totalRecords);
    } catch (error) {
      console.error("Error loading UOMs:", error);
      toast.error(
        "Failed to load UOMs: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUOMs();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedUOMId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedUOMId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const uom = rows.find((row) => row.id === id);
    setItemToDelete(uom);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUOM(itemToDelete.id);
      toast.success("UOM deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadUOMs();
    } catch (error) {
      toast.error(
        "Failed to delete UOM: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setSelectedUOMId(null);
    loadUOMs();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUOMId(null);
  };

  const handlePageChange = (newPage) => {
    console.log("Changing to page:", newPage);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    console.log("Changing rows per page to:", newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
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
        <Typography variant="h5">Unit of Measurement Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar placeholder="Search UOMs..." />
          <Tooltip title="Add UOM">
            <IconButton
              onClick={handleCreate}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                height: 40,
                width: 40,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <FormDatePicker
          label="From Date"
          value={fromDate}
          onChange={setFromDate}
          sx={{ width: 200 }}
        />
        <FormDatePicker
          label="To Date"
          value={toDate}
          onChange={setToDate}
          sx={{ width: 200 }}
        />
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => handlePageChange(newPage)}
        onRowsPerPageChange={(e) =>
          handleRowsPerPageChange(parseInt(e.target.value, 10))
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
        isPagination={true}
      />

      <UOMModal
        open={modalOpen}
        onClose={handleModalClose}
        uomId={selectedUOMId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete UOM ${itemToDelete?.uom}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default UOMList;
