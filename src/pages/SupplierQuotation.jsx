import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const SupplierQuotation = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'quotationNumber', label: 'Quotation Number' },
    { id: 'supplierName', label: 'Supplier Name' },
    { id: 'quotationDate', label: 'Quotation Date' },
    { id: 'validUntil', label: 'Valid Until' },
    { id: 'status', label: 'Status' },
    { id: 'totalAmount', label: 'Total Amount' },
  ];

  const rows = [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Supplier Quotation Management</Typography>
        <Button variant="contained" color="primary">
          Create New
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={rows}
        page={0}
        rowsPerPage={10}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        totalRows={0}
      />
    </Box>
  );
};

export default SupplierQuotation;