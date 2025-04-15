import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import AddressTypeModal from './AddressTypeModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getAddressTypes, deleteAddressType } from './addressTypeStorage';

const AddressTypeList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddressTypeId, setSelectedAddressTypeId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getAddressTypes());
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteAddressType(itemToDelete.id);
    setRows(getAddressTypes());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: 'name', label: 'Address Type', align: 'center' }  // Changed from 'addressTypeName' to 'name'
  ];

  useEffect(() => {
    const addressTypes = getAddressTypes();
    // Map the data to ensure consistent structure
    const formattedRows = addressTypes.map(type => ({
      id: type.id,
      name: type.name || type.addressTypeName || '' // Handle both possible property names
    }));
    setRows(formattedRows);
  }, []);

  const handleSave = () => {
    const addressTypes = getAddressTypes();
    const formattedRows = addressTypes.map(type => ({
      id: type.id,
      name: type.name || type.addressTypeName || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  };

  const handleEdit = (row) => {
    setSelectedAddressTypeId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAddressTypeId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAddressTypeId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Address Type Management</Typography>
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

      <AddressTypeModal
        open={modalOpen}
        onClose={handleModalClose}
        addressTypeId={selectedAddressTypeId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete address type ${itemToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default AddressTypeList;