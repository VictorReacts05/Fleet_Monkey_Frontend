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
  approveSalesQuotation,
  fetchUserApprovalStatus,
} from "./SalesQuotationAPI";

const StatusIndicator = ({ salesQuotationId, onStatusChange, readOnly }) => {
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      if (!salesQuotationId) return;

      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const approverId = user?.personId;

        if (!approverId) {
          console.error("No personId found in localStorage");
          throw new Error("User not authenticated");
        }

        console.log("Fetching user approval status", {
          salesQuotationId,
          approverId,
        });
        const userStatus = await fetchUserApprovalStatus(
          salesQuotationId,
          approverId
        );
        console.log("Fetched user status:", userStatus);
        setStatus(userStatus);
      } catch (error) {
        console.error("Failed to fetch user approval status:", error);
        console.log("Unable to load approval status");
        setStatus("Pending");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [salesQuotationId]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      console.log(
        `Initiating approval for Sales Quotation ID: ${salesQuotationId}`
      );
      const response = await approveSalesQuotation(salesQuotationId);
      console.log("Approval response:", response);

      if (response.success) {
        toast.success("Approval recorded successfully");
        setStatus("Approved");
        onStatusChange?.("Approved");
      } else {
        throw new Error(response.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approval error:", error);
      console.log(`Failed to approve: ${error.message}`);
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleChipClick = (event) => {
    if (!readOnly && status !== "Approved") {
      console.log("Opening approval menu");
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    console.log("Closing approval menu");
    setAnchorEl(null);
  };

  const chipProps = {
    label: (
      <Typography variant="body2">
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

  return (
    <>
      <Chip {...chipProps} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleApprove} disabled={loading}>
          Approve
        </MenuItem>
      </Menu>
    </>
  );
};

export default StatusIndicator;
