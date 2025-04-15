import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const Inventory = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'itemCode', label: 'Item Code' },
    { id: 'itemName', label: 'Item Name' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'unit', label: 'Unit' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'lastUpdated', label: 'Last Updated' },
  ];

  const rows = []; 

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Inventory Management</Typography>
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

export default Inventory;