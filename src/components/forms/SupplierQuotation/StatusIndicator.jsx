import React, { useState, useEffect } from "react";
import {
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { CheckCircle, PendingActions } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  approveSupplierQuotation,
  fetchUserApprovalStatus,
} from "./SupplierQuotationAPI";

const StatusIndicator = ({ supplierQuotationId, onStatusChange, readOnly }) => {
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userApprovalStatus, setUserApprovalStatus] = useState("Pending");

  // Log props for debugging
  useEffect(() => {
    console.log("StatusIndicator props:", {
      supplierQuotationId,
      readOnly,
      status,
    });
  }, [supplierQuotationId, readOnly, status]);

  // Fetch user approval status
  useEffect(() => {
    const loadStatus = async () => {
      if (!supplierQuotationId) {
        console.warn("No supplierQuotationId provided");
        return;
      }

      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const approverId = user?.personId;

        if (!approverId) {
          console.error("No personId found in localStorage:", user);
          throw new Error("User not authenticated");
        }

        console.log("Fetching user approval status", {
          supplierQuotationId,
          approverId,
        });
        const userStatus = await fetchUserApprovalStatus(
          supplierQuotationId,
          approverId
        );
        console.log("Fetched user status:", userStatus);
        setStatus(userStatus);
      } catch (error) {
        console.error("Failed to fetch user approval status:", {
          message: error.message,
          stack: error.stack,
        });
        console.log("Unable to load approval status");
        setStatus("Pending");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [supplierQuotationId]);

  const handleApprove = async () => {
    console.log("handleApprove triggered for ID:", supplierQuotationId);
    setLoading(true);
    try {
      const response = await approveSupplierQuotation(supplierQuotationId);
      console.log("Approval response:", response);

      if (response.success) {
        toast.success("Approval recorded successfully");
        setStatus("Approved");
        onStatusChange?.("Approved");
      } else {
        throw new Error(response.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approval error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      console.log(`Failed to approve: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleChipClick = (event) => {
    console.log("handleChipClick triggered", { readOnly, status });
    if (!readOnly && status.toLowerCase() !== "approved") {
      setAnchorEl(event.currentTarget);
      console.log("Menu should open, anchorEl set");
    } else {
      console.warn("Chip click ignored:", { readOnly, status });
    }
  };

  const handleMenuClose = () => {
    console.log("Closing approval menu");
    setAnchorEl(null);
  };

  const chipProps = {
    label: (
      <Typography variant="caption">
        {loading ? "Processing..." : status}
      </Typography>
    ),
    icon: loading ? (
      <CircularProgress size={16} />
    ) : status === "Approved" ? (
      <CheckCircle />
    ) : (
      <PendingActions />
    ),
    color: status === "Approved" ? "success" : "warning",
    onClick: readOnly || status === "Approved" ? undefined : handleChipClick,
    sx: {
      height: 28,
      minWidth: 80,
      cursor: readOnly || status === "Approved" ? "default" : "pointer",
    },
  };

  const validStatus = userApprovalStatus || "Pending";

  return (
    <>
      <Chip {...chipProps} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        /* sx={{
          "& .MuiMenuItem-root": {
            fontSize: 12,
            minHeight: 24,
            px: 1,
          },
        }} */
      >
        {/* <MenuItem onClick={handleApprove} disabled={loading}>
          Approve
        </MenuItem> */}
        {validStatus !== "Approved" && (
          <MenuItem onClick={handleApprove} disabled={loading}>
            {loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <CheckCircle sx={{ mr: 1 }} color="success" />
            )}
            Approve
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default StatusIndicator;
