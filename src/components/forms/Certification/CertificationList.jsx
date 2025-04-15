import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CertificationModal from './CertificationModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getCertifications, deleteCertification } from './certificationStorage';

const CertificationList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCertificationId, setSelectedCertificationId] = useState(null);
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getCertifications());
  }, []);

  const columns = [
    { 
      id: 'certificationName', 
      label: 'Certification Name', 
      align: 'center' 
    }
  ];

  const handleEdit = (row) => {
    setSelectedCertificationId(row.id);
    setModalOpen(true);
  };

  // Update the handleDelete function to open the confirmation dialog
  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  // Add a new function to handle the actual deletion after confirmation
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    deleteCertification(itemToDelete.id);
    setRows(getCertifications());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Add a function to handle dialog cancellation
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCreate = () => {
    setSelectedCertificationId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCertificationId(null);
  };

  const handleSave = () => {
    setRows(getCertifications());
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Certification Management</Typography>
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
      />

      <CertificationModal
        open={modalOpen}
        onClose={handleModalClose}
        certificationId={selectedCertificationId}
        onSave={handleSave}
      />

      {/* Add the confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete certification ${itemToDelete?.certificationName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default CertificationList;