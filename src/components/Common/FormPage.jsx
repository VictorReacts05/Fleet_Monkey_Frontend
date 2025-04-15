import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FormPage = ({ title, children, onSubmit, onCancel }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={3}>
            {children}
          </Stack>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCancel} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormPage;