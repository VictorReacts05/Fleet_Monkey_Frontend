import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import SalesQuotationForm from "./SalesQuotationForm";

const SalesQuotationModal = ({ open, onClose, salesQuotationId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <SalesQuotationForm
          salesQuotationId={salesQuotationId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SalesQuotationModal;
