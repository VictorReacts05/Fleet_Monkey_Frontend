import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import SubscriptionModal from './SubscriptionModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getSubscriptions, deleteSubscription } from './subscriptionStorage';

const SubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getSubscriptions());
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteSubscription(itemToDelete.id);
    setRows(getSubscriptions());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: 'planName', label: 'Plan Name', align: 'center' },
    { id: 'description', label: 'Description', align: 'center' },
    { id: 'fees', label: 'Fees', align: 'center' },
    { id: 'billingType', label: 'Billing Type', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedSubscriptionId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSubscriptionId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSubscriptionId(null);
  };

  const handleSave = () => {
    setRows(getSubscriptions());
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Subscription Management</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New
        </Button>
      </Box>

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
        totalRows={rows.length}
      />

      <SubscriptionModal
        open={modalOpen}
        onClose={handleModalClose}
        subscriptionId={selectedSubscriptionId}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete subscription plan ${itemToDelete?.planName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default SubscriptionList;