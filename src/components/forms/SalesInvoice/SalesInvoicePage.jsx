import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import SalesInvoiceForm from './SalesInvoiceForm';

const SalesInvoicePage = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Sales Invoice Details
      </Typography>
      <SalesInvoiceForm salesInvoiceId={id} readOnly={true} />
    </Box>
  );
};

export default SalesInvoicePage;