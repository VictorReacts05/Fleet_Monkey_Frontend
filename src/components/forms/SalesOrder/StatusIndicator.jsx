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
import { CheckCircle, PendingActions, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  fetchUserApprovalStatus,
  approveSalesOrder,
  disapproveSalesOrder,
} from "./SalesOrderAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";

const StatusIndicator = ({
  status,
  salesOrderId,
  onStatusChange,
  readOnly,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userApprovalStatus, setUserApprovalStatus] = useState("Pending");

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.warn("No user data found in localStorage");
        return null;
      }
      const user = JSON.parse(userData);
      console.log("Current user data:", user);
      return user;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const fetchApprovalRecord = async () => {
    if (!salesOrderId) return;

    try {
      const user = getCurrentUser();
      if (!user?.personId) {
        throw new Error("No user found in localStorage");
      }

      console.log(
        `Fetching approval for user ${user.personId} and SalesOrder ${salesOrderId}`
      );
      const approvalStatus = await fetchUserApprovalStatus(
        salesOrderId,
        user.personId
      );
      console.log("Fetched approval status:", approvalStatus);
      setUserApprovalStatus(
        approvalStatus === "Approved" ? "Approved" : "Pending"
      );
    } catch (error) {
      console.error("Error fetching approval record:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setUserApprovalStatus("Pending");
    }
  };

  useEffect(() => {
    if (salesOrderId) {
      fetchApprovalRecord();
    }
  }, [salesOrderId]);

  const updateStatus = async (newStatus) => {
    if (!salesOrderId || isNaN(parseInt(salesOrderId, 10))) {
      toast.error("Invalid Sales Order ID");
      setAnchorEl(null);
      return;
    }

    try {
      setLoading(true);
      const isApproved = newStatus === "Approved";
      console.log(
        `Updating approval status to: ${newStatus} for SalesOrderId: ${salesOrderId}`
      );

      const response = isApproved
        ? await approveSalesOrder(salesOrderId)
        : await disapproveSalesOrder(salesOrderId);
      console.log("Approval response:", response);

      setUserApprovalStatus(newStatus);

      // Fetch updated Sales Order status
      const user = getCurrentUser();
      const headers = { Authorization: `Bearer ${user?.token}` };
      const salesOrderResponse = await fetch(
        `${APIBASEURL}/sales-Order/${salesOrderId}`,
        { headers }
      );
      const salesOrderData = await salesOrderResponse.json();
      const overallStatus = salesOrderData.data?.Status || "Pending";

      if (onStatusChange && overallStatus !== status) {
        onStatusChange(overallStatus);
      }

      toast.success(
        `Sales Order ${isApproved ? "approved" : "disapproved"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        `Failed to update status: ${
          error.response?.data?.message || error.message || "Unknown"
        }`
      );
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleClick = (event) => {
    if (!readOnly) {
      console.log("StatusIndicator clicked, opening menu");
      setAnchorEl(event.currentTarget);
    } else {
      console.log("StatusIndicator is read-only, click ignored");
    }
  };

  const handleClose = () => {
    console.log("Closing menu");
    setAnchorEl(null);
  };

  const handleApprove = () => {
    console.log("Approve action triggered");
    updateStatus("Approved");
  };

  const handleDisapprove = () => {
    console.log("Disapprove action triggered");
    updateStatus("Pending");
  };

  const getChipProps = () => {
    if (userApprovalStatus === "Approved") {
      return {
        color: "success",
        icon: <CheckCircle />,
        clickable: !readOnly,
      };
    }
    return {
      color: "warning",
      icon: <PendingActions />,
      clickable: !readOnly,
    };
  };

  const chipProps = getChipProps();
  const validStatus = userApprovalStatus;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Chip
        label={
          <Typography variant="body2">
            {loading ? "Processing..." : validStatus}
          </Typography>
        }
        color={chipProps.color}
        icon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            chipProps.icon
          )}
        onClick={readOnly ? undefined : handleClick}
        clickable={!readOnly}
        sx={{
          height: 28,
          minWidth: 80,
          padding: "2px 0px",
          borderRadius: "12px",
          position: "relative",
          cursor: readOnly ? "default" : chipProps.clickable ? "pointer" : "default",
          "& .MuiChip-label": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.mode === "light" ? "white" : "black",
            borderRadius: "12px",
          },
        }}
      />
    </Box>
  );
};

export default StatusIndicator;