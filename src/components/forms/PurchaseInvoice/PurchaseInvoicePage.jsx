import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import PurchaseInvoiceForm from './PurchaseInvoiceForm';

const PurchaseInvoicePage = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Purchase Invoice Details
      </Typography>
      <PurchaseInvoiceForm purchaseInvoiceId={id} readOnly={true} />
    </Box>
  );
};

export default PurchaseInvoicePage;