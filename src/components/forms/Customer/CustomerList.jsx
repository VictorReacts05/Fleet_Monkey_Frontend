import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CustomerModal from './CustomerModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getCustomers, deleteCustomer } from './customerStorage';
import { getCompanies } from "../Company/companyStorage";
// import { getCurrencies } from '../Currency/currencyStorage';

const CustomerList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const customers = getCustomers();
    const companies = getCompanies();
    const currencies = getCurrencies();

    // Map the IDs to their actual names
    const mappedRows = customers.map(customer => ({
      ...customer,
      companyId: companies.find(c => c.id === parseInt(customer.companyId))?.companyName || '',
      currencyId: currencies.find(c => c.id === parseInt(customer.currencyId))?.currencyName || ''
    }));

    setRows(mappedRows);
  }, []);

  const columns = [
    { id: 'customerName', label: 'Customer Name', align: 'center' },
    { id: 'companyId', label: 'Company', align: 'center' },
    { id: 'importCode', label: 'Import Code', align: 'center' },
    { id: 'currencyId', label: 'Currency', align: 'center' },
    { id: 'websiteUrl', label: 'Website', align: 'center' },
    { id: 'addressType', label: 'Address Type', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedCustomerId(row.id);
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
    
    deleteCustomer(itemToDelete.id);
    
    // Refresh the list
    const customers = getCustomers();
    const companies = getCompanies();
    const currencies = getCurrencies();

    const mappedRows = customers.map(customer => ({
      ...customer,
      companyId: companies.find(c => c.id === parseInt(customer.companyId))?.companyName || '',
      currencyId: currencies.find(c => c.id === parseInt(customer.currencyId))?.currencyName || ''
    }));

    setRows(mappedRows);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Add a function to handle dialog cancellation
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCreate = () => {
    setSelectedCustomerId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCustomerId(null);
  };

  const handleSave = () => {
    const customers = getCustomers();
    const companies = getCompanies();
    const currencies = getCurrencies();

    const mappedRows = customers.map(customer => ({
      ...customer,
      companyId: companies.find(c => c.id === parseInt(customer.companyId))?.companyName || '',
      currencyId: currencies.find(c => c.id === parseInt(customer.currencyId))?.currencyName || ''
    }));

    setRows(mappedRows);
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Customer Management</Typography>
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

      <CustomerModal
        open={modalOpen}
        onClose={handleModalClose}
        customerId={selectedCustomerId}
        onSave={handleSave}
      />

      {/* Add the confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete customer ${itemToDelete?.customerName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default CustomerList;