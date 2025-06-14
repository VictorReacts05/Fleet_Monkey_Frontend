// src/features/address/AddressModal.jsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, CircularProgress, Box } from "@mui/material";
import AddressForm from "./AddressForm";
import { getAddressById } from "./AddressAPI";
import { toast } from "react-toastify";

const AddressModal = ({ open, addressId = null, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Whenever addressId changes (or modal opens), load initial data
  useEffect(() => {
    if (addressId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await getAddressById(addressId);
          setInitialData(data);
        } catch (error) {
          console.error("Error loading address:", error);
          toast.error(`Failed to load address: ${error.message || error}`);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // “New Address” mode → clear any leftover data
      setInitialData(null);
    }
  }, [addressId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{addressId ? "Edit Address" : "New Address"}</DialogTitle>
      <DialogContent>
        {addressId && loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <AddressForm
            addressId={addressId}
            initialData={initialData}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
