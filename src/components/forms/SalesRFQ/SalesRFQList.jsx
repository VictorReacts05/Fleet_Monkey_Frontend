import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Alert } from '@mui/material';
import DataTable from '../../Common/DataTable';
import SalesRFQModal from './SalesRFQModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { format } from 'date-fns';
import { fetchSalesRFQs, deleteSalesRFQ } from '../../../utils/api';

const SalesRFQList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSalesRFQId, setSelectedSalesRFQId] = useState(null);
  
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const columns = [
    { id: 'SalesRFQID', label: 'ID' },
    { id: 'Series', label: 'Series' },
    { id: 'ExternalRefNo', label: 'External Ref No' },
    { id: 'Status', label: 'Status' },
    { 
      id: 'DeliveryDate', 
      label: 'Delivery Date',
      format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    },
    { 
      id: 'RequiredByDate', 
      label: 'Required By',
      format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesRFQs();
      
      if (response.success) {
        let data = response.data;
        if (data && typeof data === 'object' && !Array.isArray(data) && data.data) {
          data = data.data;
        }

        if (!Array.isArray(data)) {
          data = data && typeof data === 'object' ? [data] : [];
        }

        const formattedRows = data.map(row => ({
          ...row,
          Status: row.Status || 'Pending',
          ExternalRefNo: row.ExternalRefNo || '-',
          Series: row.Series || '-',
          DeliveryDate: row.DeliveryDate || null,
          RequiredByDate: row.RequiredByDate || null
        }));
        
        setRows(formattedRows);
        setTotalRows(formattedRows.length);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching Sales RFQs:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    setSelectedSalesRFQId(row.SalesRFQID);
    setModalOpen(true);
  };

  // Update the handleDelete function to open the confirmation dialog
  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  // Add a new function to handle the actual deletion after confirmation
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      const response = await deleteSalesRFQ(itemToDelete.SalesRFQID);
      
      if (response.success) {
        fetchData(); // Refresh the list
      } else {
        setError(response.error || 'Failed to delete Sales RFQ');
      }
    } catch (error) {
      console.error('Error deleting Sales RFQ:', error);
      setError('An unexpected error occurred while deleting');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Add a function to handle dialog cancellation
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCreate = () => {
    setSelectedSalesRFQId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSalesRFQId(null);
  };

  const handleSave = () => {
    fetchData();
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Sales RFQ Management</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <SalesRFQModal
        open={modalOpen}
        onClose={handleModalClose}
        salesRFQId={selectedSalesRFQId}
        onSave={handleSave}
      />
      
      {/* Add the confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete Sales RFQ ${itemToDelete?.Series || itemToDelete?.SalesRFQID}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default SalesRFQList;