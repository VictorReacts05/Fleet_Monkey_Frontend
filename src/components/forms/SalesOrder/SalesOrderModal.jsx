import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import SalesOrderForm from "./SalesOrderForm";

const SalesOrderModal = ({ open, onClose, salesOrderId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <SalesOrderForm
          salesOrderId={salesOrderId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SalesOrderModal;