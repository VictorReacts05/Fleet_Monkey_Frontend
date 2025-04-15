import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CountryModal from './CountryModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getCountries, deleteCountry } from './countryStorage';

const CountryList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const countries = getCountries();
    const formattedRows = countries.map(country => ({
      id: country.id,
      countryName: country.countryName || country.name || '' // Handle both possible property names
    }));
    setRows(formattedRows);
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteCountry(itemToDelete.id);
    const countries = getCountries();
    const formattedRows = countries.map(country => ({
      id: country.id,
      countryName: country.countryName || country.name || '' // Match the same format as in useEffect
    }));
    setRows(formattedRows);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: 'countryName', label: 'Country Name', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedCountryId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCountryId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCountryId(null);
  };

  const handleSave = () => {
    const countries = getCountries();
    const formattedRows = countries.map(country => ({
      id: country.id,
      countryName: country.countryName || country.name || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Country Management</Typography>
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

      <CountryModal
        open={modalOpen}
        onClose={handleModalClose}
        countryId={selectedCountryId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete country ${itemToDelete?.countryName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default CountryList;