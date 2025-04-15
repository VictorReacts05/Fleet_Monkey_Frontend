import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const SalesOrder = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'orderNumber', label: 'Order Number' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'orderDate', label: 'Order Date' },
    { id: 'status', label: 'Status' },
    { id: 'totalAmount', label: 'Total Amount' },
  ];

  const rows = [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Sales Order Management</Typography>
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

export default SalesOrder;