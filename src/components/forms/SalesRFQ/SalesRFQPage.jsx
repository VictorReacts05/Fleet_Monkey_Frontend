import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import SalesRFQForm from "./SalesRFQForm";
import { toast } from "react-toastify";

const SalesRFQPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;
  const isViewMode =
    new URLSearchParams(location.search).get("view") === "true";

  const handleSave = () => {
    toast.success(
      `SalesRFQ ${isEditMode ? "updated" : "created"} successfully`
    );
    navigate("/sales-rfq");
  };

  const handleCancel = () => {
    navigate("/sales-rfq");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back to List
        </Button>
      </Box>

      <SalesRFQForm
        salesRFQId={id}
        onClose={handleCancel}
        onSave={handleSave}
        readOnly={isViewMode}
      />
    </Box>
  );
};

export default SalesRFQPage;
