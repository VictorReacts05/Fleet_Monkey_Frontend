import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import DataTable from '../components/Common/DataTable';

const Settings = () => {
  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'settingName', label: 'Setting Name' },
    { id: 'category', label: 'Category' },
    { id: 'value', label: 'Value' },
    { id: 'lastModified', label: 'Last Modified' },
    { id: 'modifiedBy', label: 'Modified By' },
  ];

  const rows = [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">System Settings</Typography>
        <Button variant="contained" color="primary">
          Add Setting
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

export default Settings;