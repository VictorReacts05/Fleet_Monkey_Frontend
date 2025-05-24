import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import PurchaseRFQForm from "./PurchaseRFQForm";
import { toast } from "react-toastify";

const PurchaseRFQPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = !!id;
  const isViewMode =
    new URLSearchParams(location.search).get("view") === "true";

  const handleSave = () => {
    toast.success(
      `Purchase RFQ ${isEditMode ? "updated" : "created"} successfully`
    );
    navigate("/purchase-rfq");
  };

  const handleCancel = () => {
    navigate("/purchase-rfq");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back to List
        </Button>
      </Box>

      <PurchaseRFQForm
        purchaseRFQId={id}
        onClose={handleCancel}
        onSave={handleSave}
        readOnly={isViewMode}
      />
    </Box>
  );
};

export default PurchaseRFQPage;