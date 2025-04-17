import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import SupplierModal from './SupplierModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchSuppliers, deleteSupplier } from './SupplierAPI';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const SupplierList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0); // Add this line
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "supplierName", headerName: "Supplier Name", flex: 1 },
    { field: "supplierTypeName", headerName: "Supplier Type", flex: 1 },
    { field: "exportCode", headerName: "Export Code", flex: 1 },
    { field: "companyName", headerName: "Company Name", flex: 1 },
    { field: "addressTypeId", headerName: "Address Type", flex: 1 },
    { field: "billingCurrencyName", headerName: "Currency Name", flex: 1 },
    { field: "createdDateTime", headerName: "Created Date", flex: 1 },
  ];

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      // Format dates to start of day and end of day
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      console.log('Date range:', { formattedFromDate, formattedToDate }); // Debug dates
      
      const response = await fetchSuppliers(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const suppliers = response.data || [];
      const totalCount = response.pagination?.totalRecords || suppliers.length;
      
      const formattedRows = suppliers.map((supplier) => ({
        id: supplier.SupplierID,
        supplierName: supplier.SupplierName || "N/A",
        supplierTypeName: supplier.SupplierTypeName || "N/A",
        exportCode: supplier.SupplierExportCode || "N/A",
        companyName: supplier.CompanyName || "N/A",
        addressTypeId: supplier.SupplierAddressID || "N/A",
        billingCurrencyName: supplier.BillingCurrencyName || "N/A",
        createdDateTime:
          dayjs(supplier.CreatedDateTime).format("YYYY-MM-DD HH:mm:ss") ||
          "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Failed to load suppliers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedSupplierId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedSupplierId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const supplier = rows.find(row => row.id === id);
    setItemToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSupplier(itemToDelete.id);
      toast.success('Supplier deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadSuppliers();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupplierId(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Supplier Management</Typography>
        <Stack direction="row" spacing={-1} alignItems="center">
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
            sx={{width: 200, height: 56}}
          >
            Add Supplier
          </Button>
        </Stack>
      </Box>

      {/* Remove this duplicate section
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Supplier Management</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New
        </Button>
      </Box>
      */}

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
        totalRows={totalRows} // Use the totalRows state instead of rows.length
        loading={loading}
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
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default SupplierList;
