import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const PurchaseRFQ = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'series', label: 'Series' },
    { id: 'externalRef', label: 'External Ref No' },
    { id: 'status', label: 'Status' },
    { id: 'deliveryDate', label: 'Delivery Date' },
    { id: 'requiredBy', label: 'Required By' },
  ];

  const rows = []; 

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Purchase RFQ Management</Typography>
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

export default PurchaseRFQ;