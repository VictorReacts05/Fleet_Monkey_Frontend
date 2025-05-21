import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import SupplierQuotationForm from "./SupplierQuotationForm";
import { toast } from "react-toastify";

const SupplierQuotationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = !!id;
  const isViewMode =
    new URLSearchParams(location.search).get("view") === "true";

  const handleSave = () => {
    toast.success(
      `Supplier Quotation ${isEditMode ? "updated" : "created"} successfully`
    );
    navigate("/supplier-quotation");
  };

  const handleCancel = () => {
    navigate("/supplier-quotation");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back to List
        </Button>
      </Box>

      <SupplierQuotationForm
        supplierQuotationId={id}
        onClose={handleCancel}
        onSave={handleSave}
        readOnly={isViewMode}
      />
    </Box>
  );
};

export default SupplierQuotationPage;