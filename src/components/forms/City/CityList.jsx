import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CityModal from './CityModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getCities, deleteCity } from './cityStorage';
import { getCountries } from '../Country/countryStorage';

const CityList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const cities = getCities();
    const countries = getCountries();
    const formattedRows = cities.map(city => ({
      id: city.id,
      cityName: city.cityName || city.name || '',
      countryName: countries.find(c => c.id === parseInt(city.countryId))?.countryName || ''
    }));
    setRows(formattedRows);
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteCity(itemToDelete.id);
    const cities = getCities();
    const countries = getCountries();
    const formattedRows = cities.map(city => ({
      id: city.id,
      cityName: city.cityName || city.name || '',
      countryName: countries.find(c => c.id === parseInt(city.countryId))?.countryName || ''
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
    { id: 'cityName', label: 'City Name', align: 'center' },
    { id: 'countryName', label: 'Country', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedCityId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCityId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCityId(null);
  };

  const handleSave = () => {
    const cities = getCities();
    const countries = getCountries();
    const formattedRows = cities.map(city => ({
      id: city.id,
      cityName: city.cityName || city.name || '',
      countryName: countries.find(c => c.id === parseInt(city.countryId))?.countryName || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">City Management</Typography>
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

      <CityModal
        open={modalOpen}
        onClose={handleModalClose}
        cityId={selectedCityId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete city ${itemToDelete?.cityName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default CityList;