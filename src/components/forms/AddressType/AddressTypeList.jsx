import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import AddressTypeModal from './AddressTypeModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchAddressTypes, deleteAddressType } from './AddressTypeAPI';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const AddressTypeList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddressTypeId, setSelectedAddressTypeId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Update the columns to only include the addressType field
  const columns = [
    { field: 'addressType', headerName: 'Address Type', flex: 1 },
  ];

  const loadAddressTypes = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      // Fetch all address types to get the actual count
      const allResponse = await fetchAddressTypes(1, 1000, formattedFromDate, formattedToDate);
      const allAddressTypes = allResponse.data || [];
      const actualTotalCount = allAddressTypes.length;
      
      // Now fetch the paginated data
      const response = await fetchAddressTypes(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const addressTypes = response.data || [];
      
      const formattedRows = addressTypes.map((addressType) => ({
        id: addressType.AddressTypeID,
        addressType: addressType.AddressType || "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(actualTotalCount);
    } catch (error) {
      console.error('Error loading address types:', error);
      toast.error('Failed to load address types: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add these missing functions
    useEffect(() => {
      loadAddressTypes();
    }, [page, rowsPerPage, fromDate, toDate]);
  
    const handleCreate = () => {
      setSelectedAddressTypeId(null);
      setModalOpen(true);
    };
  
    const handleEdit = (id) => {
      setSelectedAddressTypeId(id);
      setModalOpen(true);
    };
  
    const handleDelete = (id) => {
      const addressType = rows.find(row => row.id === id);
      setItemToDelete(addressType);
      setDeleteDialogOpen(true);
    };
  
    const confirmDelete = async () => {
      try {
        await deleteAddressType(itemToDelete.id);
        toast.success('Address type deleted successfully');
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        loadAddressTypes();
      } catch (error) {
        toast.error('Failed to delete address type: ' + error.message);
      }
    };
  
    const handleSave = () => {
      setModalOpen(false);
      loadAddressTypes();
    };
  
    const handleModalClose = () => {
      setModalOpen(false);
      setSelectedAddressTypeId(null);
    };
  
    // Make sure the DataTable component has the correct props for pagination
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Address Type Management</Typography>
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
            Add Address Type
          </Button>
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => {
          // console.log('Page changed to:', newPage);
          setPage(newPage);
        }}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = parseInt(e.target.value, 10);
          // console.log('Rows per page changed to:', newRowsPerPage);
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
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
        message={`Are you sure you want to delete address type ${itemToDelete?.addressType}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default AddressTypeList;