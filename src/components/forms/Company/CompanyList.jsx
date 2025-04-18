import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CompanyModal from './CompanyModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getCompanies, deleteCompany } from "../Company/companyStorage";
// import { getCurrencies } from "../Currency/currencyStorage";

const CompanyList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const companies = getCompanies();
    const currencies = getCurrencies();
    const formattedRows = companies.map(company => ({
      id: company.id,
      companyName: company.companyName || '',
      companyType: company.companyType || '',
      websiteLink: company.websiteLink || '',
      addressType: company.addressType || '',
      notes: company.companyNotes || '', // Updated to use companyNotes instead of notes
      currencyName: currencies.find(c => c.id === parseInt(company.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
  }, []);

  // Also update the handleSave function with the same change
  const handleSave = () => {
    const companies = getCompanies();
    const currencies = getCurrencies();
    const formattedRows = companies.map(company => ({
      id: company.id,
      companyName: company.companyName || '',
      companyType: company.companyType || '',
      websiteLink: company.websiteLink || '',
      addressType: company.addressType || '',
      notes: company.companyNotes || '', // Updated to use companyNotes instead of notes
      currencyName: currencies.find(c => c.id === parseInt(company.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  };

  const columns = [
    { id: 'companyName', label: 'Company Name', align: 'center' },
    { id: 'companyType', label: 'Company Type', align: 'center' },
    { id: 'websiteLink', label: 'Website', align: 'center' },
    { id: 'addressType', label: 'Address Type', align: 'center' },
    { id: 'notes', label: 'Notes', align: 'center' },
    { id: 'currencyName', label: 'Currency', align: 'center' }
  ];

  /* const handleSave = () => {
    const companies = getCompanies();
    const currencies = getCurrencies();
    const formattedRows = companies.map(company => ({
      id: company.id,
      companyName: company.companyName || '',
      companyType: company.companyType || '',
      websiteLink: company.websiteLink || '',
      addressType: company.addressType || '',
      notes: company.notes || '',
      currencyName: currencies.find(c => c.id === parseInt(company.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  }; */

  const handleEdit = (row) => {
    setSelectedCompanyId(row.id);
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
    
    deleteCompany(itemToDelete.id);
    setRows(getCompanies());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Add a function to handle dialog cancellation
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCreate = () => {
    setSelectedCompanyId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCompanyId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Company Management</Typography>
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

      <CompanyModal
        open={modalOpen}
        onClose={handleModalClose}
        companyId={selectedCompanyId}
        onSave={handleSave}
      />

      {/* Add the confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete company ${itemToDelete?.companyName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default CompanyList;