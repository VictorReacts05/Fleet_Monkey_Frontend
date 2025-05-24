import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import PurchaseOrderForm from './PurchaseOrderForm';

const PurchaseOrderPage = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Purchase Order Details
      </Typography>
      <PurchaseOrderForm purchaseOrderId={id} readOnly={true} />
    </Box>
  );
};

export default PurchaseOrderPage;