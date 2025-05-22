import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import SalesQuotationForm from "./SalesQuotationForm";
import { toast } from "react-toastify";

const SalesQuotationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = !!id;
  const isViewMode =
    new URLSearchParams(location.search).get("view") === "true";

  const handleSave = () => {
    toast.success(
      `Sales Quotation ${isEditMode ? "updated" : "created"} successfully`
    );
    navigate("/sales-quotation");
  };

  const handleCancel = () => {
    navigate("/sales-quotation");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back to List
        </Button>
      </Box>

      <SalesQuotationForm
        salesQuotationId={id}
        onClose={handleCancel}
        onSave={handleSave}
        readOnly={isViewMode}
      />
    </Box>
  );
};

export default SalesQuotationPage;