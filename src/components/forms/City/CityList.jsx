import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CityModal from './CityModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchCities, deleteCity, fetchCountries } from './CityAPI';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CityList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [countries, setCountries] = useState({});

  const columns = [
    { field: 'cityName', headerName: 'City Name', flex: 1 },
    { field: 'countryName', headerName: 'Country', flex: 1 },
  ];

  // Load countries for reference
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetchCountries();
        const countryMap = {};
        (response.data || []).forEach(country => {
          countryMap[country.CountryOfOriginID] = country.CountryOfOrigin;
        });
        setCountries(countryMap);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    
    loadCountries();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      // Get current page data
      const response = await fetchCities(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const cities = response.data || [];
      
      // Get total count from backend if available
      let totalCount = response.totalRecords;
      
      // If backend doesn't provide total count
      if (totalCount === undefined) {
        try {
          // Use the maximum of current rowsPerPage * 5 as a dynamic limit
          const dynamicLimit = Math.max(rowsPerPage * 5, 20);
          const countResponse = await fetchCities(
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
          const hasFullPage = cities.length === rowsPerPage;
          totalCount = (page * rowsPerPage) + cities.length;
          
          // If we have a full page, there might be more
          if (hasFullPage) {
            totalCount += rowsPerPage; // Add one more page worth to enable next page
          }
        }
      }
      
      const formattedRows = cities.map((city) => ({
        id: city.CityID,
        cityName: city.CityName || "N/A",
        countryId: city.CountryID,
        countryName: countries[city.CountryID] || "N/A",
      }));
  
      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, [page, rowsPerPage, fromDate, toDate, countries]);

  const handleCreate = () => {
    setSelectedCityId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCityId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const city = rows.find(row => row.id === id);
    setItemToDelete(city);
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
      await deleteCity(deletedItemId);
      
      // Show success message
      toast.success('City deleted successfully');
      
      // Clear the item to delete
      setItemToDelete(null);
      
      // No need to reload immediately - we've already updated the UI
      // This will make the deletion appear instant
      
      // Reload in the background after a short delay to ensure DB consistency
      setTimeout(() => {
        loadCities();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting city:', error);
      toast.error('Failed to delete city: ' + (error.message || 'Unknown error'));
      
      // If delete failed, reload to restore the item
      loadCities();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    loadCities();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCityId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">City Management</Typography>
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
            Add City
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

      <CityModal
        open={modalOpen}
        onClose={handleModalClose}
        cityId={selectedCityId}
        onSave={handleSave}
        initialData={rows.find(row => row.id === selectedCityId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete city ${itemToDelete?.cityName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default CityList;