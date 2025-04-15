import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import BankModal from './BankModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getBanks, deleteBank } from './bankStorage';

const BankList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getBanks());
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteBank(itemToDelete.id);
    setRows(getBanks());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: 'accountName', label: 'Account Name', align: 'center' },
    { id: 'accountType', label: 'Account Type', align: 'center' },
    { id: 'bankName', label: 'Bank Name', align: 'center' },
    { id: 'branchCode', label: 'Branch Code', align: 'center' },
    { id: 'ibanNo', label: 'IBAN No', align: 'center' },
    { id: 'ifscCode', label: 'IFSC Code', align: 'center' },
    { id: 'micraCode', label: 'MICRA Code', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedBankId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBankId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBankId(null);
  };

  const handleSave = () => {
    setRows(getBanks());
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Bank Management</Typography>
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

      <BankModal
        open={modalOpen}
        onClose={handleModalClose}
        bankId={selectedBankId}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete bank account ${itemToDelete?.accountName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default BankList;