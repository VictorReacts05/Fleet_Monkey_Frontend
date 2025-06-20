import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddressForm from "./AddressForm";

const AddressModal = ({ open, addressId = null, onClose, onSave }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {addressId ? "Edit Address" : "Add New Address"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <AddressForm addressId={addressId} onClose={onClose} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
