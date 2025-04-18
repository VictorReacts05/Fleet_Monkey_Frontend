import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CurrencyModal from './CurrencyModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchCurrencies, deleteCurrency } from './CurrencyAPI';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CurrencyList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: 'currencyName', headerName: 'Currency Name', flex: 1 },
  ];

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      // Get current page data
      const response = await fetchCurrencies(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const currencies = response.data || [];
      
      // Get total count from backend if available
      let totalCount = response.totalRecords;
      
      // If backend doesn't provide total count
      if (totalCount === undefined) {
        try {
          // Use the maximum of current rowsPerPage * 5 as a dynamic limit
          const dynamicLimit = Math.max(rowsPerPage * 5, 20);
          const countResponse = await fetchCurrencies(
            1,
            dynamicLimit,
            formattedFromDate,
            formattedToDate
          );
          
          totalCount = countResponse.data?.length || 0;
          
          // If we got exactly the dynamic limit of records, there might be more
          if (countResponse.data?.length === dynamicLimit) {
            // Add a small buffer to indicate there might be more
            totalCount += rowsPerPage;
          }
        } catch (err) {
          // Fallback: estimate based on current page
          const hasFullPage = currencies.length === rowsPerPage;
          totalCount = (page * rowsPerPage) + currencies.length;
          
          // If we have a full page, there might be more
          if (hasFullPage) {
            totalCount += rowsPerPage; // Add one more page worth to enable next page
          }
        }
      }
      
      const formattedRows = currencies.map((currency) => ({
        id: currency.CurrencyID,
        currencyName: currency.CurrencyName || "N/A",
      }));
  
      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading currencies:', error);
      toast.error('Failed to load currencies: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedCurrencyId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCurrencyId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const currency = rows.find(row => row.id === id);
    setItemToDelete(currency);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      // First update UI optimistically
      const deletedItemId = itemToDelete.id;
      setRows(prevRows => prevRows.filter(row => row.id !== deletedItemId));
      
      // Close the dialog
      setDeleteDialogOpen(false);
      
      // Then perform the actual delete operation
      await deleteCurrency(deletedItemId);
      
      // Show success message
      toast.success('Currency deleted successfully');
      
      // Clear the item to delete
      setItemToDelete(null);
      
      // Reload in the background after a short delay to ensure DB consistency
      setTimeout(() => {
        loadCurrencies();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error('Failed to delete currency: ' + (error.message || 'Unknown error'));
      
      // If delete failed, reload to restore the item
      loadCurrencies();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    loadCurrencies();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCurrencyId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Currency Management</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            sx={{ width: 200, paddingY: 1 }}
          >
            Add Currency
          </Button>
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

      <CurrencyModal
        open={modalOpen}
        onClose={handleModalClose}
        currencyId={selectedCurrencyId}
        onSave={handleSave}
        initialData={rows.find(row => row.id === selectedCurrencyId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete currency ${itemToDelete?.currencyName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default CurrencyList;