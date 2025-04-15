import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import WarehouseModal from './WarehouseModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getWarehouses, deleteWarehouse } from './warehouseStorage';

const WarehouseList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getWarehouses());
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteWarehouse(itemToDelete.id);
    setRows(getWarehouses());
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
    setSelectedWarehouseId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWarehouseId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedWarehouseId(null);
  };

  const handleSave = () => {
    setRows(getWarehouses());
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Warehouse Management</Typography>
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

      <WarehouseModal
        open={modalOpen}
        onClose={handleModalClose}
        warehouseId={selectedWarehouseId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete warehouse ${itemToDelete?.warehouseName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default WarehouseList;