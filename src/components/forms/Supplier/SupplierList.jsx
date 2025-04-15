import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../../Common/DataTable';
import SupplierModal from './SupplierModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getSuppliers, deleteSupplier } from './supplierStorage';
import { getCompanies } from '../Company/companyStorage';
import { getCurrencies } from '../Currency/currencyStorage';
import { getAddressTypes } from '../AddressType/addressTypeStorage';

const SupplierList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const suppliers = getSuppliers();
    const companies = getCompanies();
    const currencies = getCurrencies();
    const addressTypes = getAddressTypes();

    const formattedRows = suppliers.map(supplier => ({
      id: supplier.id,
      supplierName: supplier.supplierName || '',
      supplierType: supplier.supplierType || '',
      exportCode: supplier.exportCode || '',
      companyName: companies.find(c => c.id === parseInt(supplier.companyId))?.companyName || '',
      addressTypeName: addressTypes.find(a => a.id === parseInt(supplier.addressTypeId))?.name || '',
      currencyName: currencies.find(c => c.id === parseInt(supplier.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
  }, []);

  const columns = [
    { id: 'supplierName', label: 'Supplier Name', align: 'center' },
    { id: 'supplierType', label: 'Supplier Type', align: 'center' },
    { id: 'exportCode', label: 'Export Code', align: 'center' },
    { id: 'companyName', label: 'Company', align: 'center' },
    { id: 'addressTypeName', label: 'Address Type', align: 'center' },
    { id: 'currencyName', label: 'Currency', align: 'center' }
  ];

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteSupplier(itemToDelete.id);
    const suppliers = getSuppliers();
    const companies = getCompanies();
    const currencies = getCurrencies();
    const addressTypes = getAddressTypes();

    const formattedRows = suppliers.map(supplier => ({
      id: supplier.id,
      supplierName: supplier.supplierName || '',
      supplierType: supplier.supplierType || '',
      exportCode: supplier.exportCode || '',
      companyName: companies.find(c => c.id === parseInt(supplier.companyId))?.companyName || '',
      addressTypeName: addressTypes.find(a => a.id === parseInt(supplier.addressTypeId))?.name || '',
      currencyName: currencies.find(c => c.id === parseInt(supplier.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Remove this duplicate columns declaration
  // const columns = [
  //   { id: 'supplierName', label: 'Supplier Name', align: 'center' },
  //   { id: 'companyName', label: 'Company', align: 'center' }
  // ];

  const handleEdit = (row) => {
    setSelectedSupplierId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSupplierId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupplierId(null);
  };

  const handleSave = () => {
    const suppliers = getSuppliers();
    const companies = getCompanies();
    const currencies = getCurrencies();
    const addressTypes = getAddressTypes();

    const formattedRows = suppliers.map(supplier => ({
      id: supplier.id,
      supplierName: supplier.supplierName || '',
      supplierType: supplier.supplierType || '',
      exportCode: supplier.exportCode || '',
      companyName: companies.find(c => c.id === parseInt(supplier.companyId))?.companyName || '',
      addressTypeName: addressTypes.find(a => a.id === parseInt(supplier.addressTypeId))?.name || '',
      currencyName: currencies.find(c => c.id === parseInt(supplier.currencyId))?.currencyName || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Supplier Management</Typography>
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

      <SupplierModal
        open={modalOpen}
        onClose={handleModalClose}
        supplierId={selectedSupplierId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete supplier ${itemToDelete?.supplierName}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default SupplierList;
