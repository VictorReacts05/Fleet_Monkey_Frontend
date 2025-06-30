import React, { useState, useEffect } from 'react';
import { Typography, Box, Stack, Tooltip, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import DataTable from '../../Common/DataTable';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchUOMs, deleteUOM } from "./";
import UOMModal from './UOMModal';

const UOMList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUOMId, setSelectedUOMId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: 'uom', headerName: 'Unit of Measurement', flex: 1 },
  ];

  const loadUOMs = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : null;

      // Fetch all UOMs to get the actual count
      const allResponse = await fetchUOMs(1, 1000, formattedFromDate, formattedToDate);
      const allUOMs = allResponse.data || [];
      const activeUOMs = allUOMs.filter(uom => !uom.IsDeleted);
      const actualTotalCount = activeUOMs.length;

      // Fetch paginated data
      const response = await fetchUOMs(page + 1, rowsPerPage, formattedFromDate, formattedToDate);
      const uoms = response.data || [];

      const formattedRows = uoms
        .filter(uom => !uom.IsDeleted)
        .map(uom => ({
          id: uom.UOMID,
          uom: uom.UOM || 'N/A',
        }));

      setRows(formattedRows);
      setTotalRows(actualTotalCount);
    } catch (error) {
      console.error('Error loading UOMs:', error);
      console.log('Failed to load UOMs: ' + (error.message || 'Unknown error'));
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
    const uom = rows.find(row => row.id === id);
    setItemToDelete(uom);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUOM(itemToDelete.id);
      toast.success('UOM deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadUOMs();
    } catch (error) {
      console.log('Failed to delete UOM: ' + (error.message || 'Unknown error'));
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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Unit of Measurement Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormDatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            sx={{ width: 200 }}
          />
          <FormDatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            sx={{ width: 200 }}
          />
          <Tooltip title="Add UOM">
            <IconButton
              onClick={handleCreate}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
                height: 40,
                width: 40,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = parseInt(e.target.value, 10);
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      {/* Replace AddressTypeModal with UOMModal */}
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