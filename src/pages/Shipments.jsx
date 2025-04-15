import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const Shipments = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'shipmentNumber', label: 'Shipment Number' },
    { id: 'origin', label: 'Origin' },
    { id: 'destination', label: 'Destination' },
    { id: 'status', label: 'Status' },
    { id: 'scheduledDate', label: 'Scheduled Date' },
    { id: 'driver', label: 'Driver' },
    { id: 'vehicle', label: 'Vehicle' },
  ];

  const rows = [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Shipments Management</Typography>
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

export default Shipments;