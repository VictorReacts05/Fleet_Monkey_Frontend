import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { CheckCircle, PendingActions } from "@mui/icons-material";
import { toast } from "react-toastify";
import { approveSalesRFQ, fetchUserApprovalStatus } from "./SalesRFQAPI";

const StatusIndicator = ({ salesRFQId, onStatusChange, readOnly }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Pending");

  // Fetch user-specific approval status
  useEffect(() => {
    const loadUserApprovalStatus = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const approverId = user?.personId;

        console.log("Loading approval status:", { salesRFQId, approverId });

        if (!approverId) {
          console.error("No personId found in localStorage");
          toast.error("User not authenticated");
          setStatus("Pending");
          return;
        }

        const userStatus = await fetchUserApprovalStatus(
          salesRFQId,
          approverId
        );
        console.log("Fetched user approval status:", {
          salesRFQId,
          approverId,
          userStatus,
        });
        setStatus(userStatus);
      } catch (error) {
        console.error("Error loading user approval status:", {
          error: error.message,
          stack: error.stack,
        });
        toast.error("Failed to load approval status");
        setStatus("Pending");
      } finally {
        setLoading(false);
      }
    };

    if (salesRFQId) {
      loadUserApprovalStatus();
    }
  }, [salesRFQId]);

  const handleApprove = async () => {
    try {
      setLoading(true);
      console.log(`Approving SalesRFQ with ID: ${salesRFQId}`);

      const response = await approveSalesRFQ(salesRFQId);

      console.log("Approval response in handleApprove:", response);

      if (response.success) {
        toast.success("SalesRFQ approved successfully");
        setStatus("Approved");
        onStatusChange("Approved");
        // Refresh status with retry mechanism
        const user = JSON.parse(localStorage.getItem("user"));
        let userStatus = "Approved"; // Optimistic default
        try {
          userStatus = await fetchUserApprovalStatus(
            salesRFQId,
            user?.personId
          );
          console.log("Refreshed user approval status:", {
            salesRFQId,
            userStatus,
          });
        } catch (refreshError) {
          console.warn(
            "Failed to refresh approval status, retaining Approved:",
            {
              error: refreshError.message,
            }
          );
        }
        setStatus(userStatus);
      } else {
        toast.error(
          `Failed to approve: ${response.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error approving SalesRFQ:", {
        error: error.message,
        response: error.response?.data,
      });
      toast.error(
        `Error approving: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleClick = (event) => {
    console.log("Chip clicked", { status, readOnly, anchorEl });
    if (!readOnly && status !== "Approved") {
      setAnchorEl(event.currentTarget);
    } else {
      console.log("Click ignored", { readOnly, status });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getChipProps = () => {
    switch (status) {
      case "Approved":
        return {
          color: "success",
          icon: <CheckCircle />,
          clickable: false,
        };
      case "Pending":
        return {
          color: "warning",
          icon: <PendingActions />,
          clickable: !readOnly,
        };
      default:
        return {
          color: "default",
          icon: null,
          clickable: !readOnly,
        };
    }
  };

  const chipProps = getChipProps();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Chip
        label={
          <Typography variant="body2">
            {loading ? "Processing..." : status || "Unknown"}
          </Typography>
        }
        color={chipProps.color}
        icon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            chipProps.icon
          )
        }
        onClick={handleClick}
        clickable={chipProps.clickable}
        sx={{
          height: 28,
          minWidth: 80,
          padding: "2px 0px",
          borderRadius: "12px",
          position: "relative",
          cursor: chipProps.clickable ? "pointer" : "default",
          "& .MuiChip-label": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: useTheme().palette.mode === "light" ? "white" : "black",
            borderRadius: "12px",
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 1300 }}
      >
        {status !== "Approved" && (
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
    </Box>
  );
};

export default StatusIndicator;
