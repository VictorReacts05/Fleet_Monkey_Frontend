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
  fetchPurchaseOrderApprovalStatus,
  approvePurchaseOrder,
} from "./PurchaseOrderAPI";
import APIBASEURL from "../../../utils/apiBaseUrl";

const PurchaseOrderStatusIndicator = ({
  status,
  purchaseOrderId,
  onStatusChange,
  readOnly,
  user,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userApprovalStatus, setUserApprovalStatus] = useState("Pending");

  const fetchApprovalRecord = async () => {
    if (!purchaseOrderId || !user?.personId) {
      console.warn("Missing purchaseOrderId or user.personId");
      setUserApprovalStatus("Pending");
      return;
    }

    try {
      console.log(
        `Fetching approval for user ${user.personId} and PO ${purchaseOrderId}`
      );
      const response = await fetchPurchaseOrderApprovalStatus(
        purchaseOrderId,
        user
      );
      console.log("Fetched approval record:", response);

      if (response.success && response.data && response.data.length > 0) {
        const approval = response.data[0];
        const approved =
          Number(approval.ApprovedYN) === 1 || approval.ApprovedYN === "true";
        console.log(`User approval for ${user.personId}: Approved=${approved}`);
        setUserApprovalStatus(approved ? "Approved" : "Pending");
      } else {
        console.log(`No approval record for user ${user.personId}`);
        setUserApprovalStatus("Pending");
      }
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
    if (purchaseOrderId && user) {
      fetchApprovalRecord();
    }
  }, [purchaseOrderId, user]);

  const updateStatus = async (newStatus) => {
    if (!purchaseOrderId || isNaN(parseInt(purchaseOrderId, 10))) {
      toast.error("Invalid Purchase Order ID");
      setAnchorEl(null);
      return;
    }

    if (!user?.personId) {
      toast.error("User not authenticated");
      setAnchorEl(null);
      return;
    }

    try {
      setLoading(true);
      const isApproved = newStatus === "Approved";
      console.log(
        `Updating approval status to: ${newStatus} for PurchaseOrderId: ${purchaseOrderId}`
      );

      const response = await approvePurchaseOrder(
        purchaseOrderId,
        isApproved,
        user
      );
      console.log("Approval response:", response);

      if (!response.success) {
        throw new Error(
          response.message ||
            `Failed to ${newStatus.toLowerCase()} Purchase Order`
        );
      }

      setUserApprovalStatus(newStatus);

      // Fetch updated PO status
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const poResponse = await fetch(`${APIBASEURL}/po/${purchaseOrderId}`, {
        headers,
      });
      const poData = await poResponse.json();
      const overallStatus = poData.data?.Status || "Pending";

      if (onStatusChange && overallStatus !== status) {
        onStatusChange(overallStatus);
      }

      toast.success(
        `Purchase Order ${isApproved ? "approved" : "disapproved"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        `Failed to update status: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleClick = (event) => {
    if (!readOnly) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = () => {
    updateStatus("Approved");
  };

  const handleDisapprove = () => {
    updateStatus("Pending");
  };

  const getChipProps = () => {
    switch (userApprovalStatus) {
      case "Approved":
        return {
          color: "success",
          icon: <CheckCircle />,
          clickable: !readOnly,
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
  const validStatus = userApprovalStatus || "Pending";

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
            color: theme.palette.mode === "light" ? "white" : "black",
            borderRadius: "12px",
          },
        }}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
        {validStatus === "Approved" && (
          <MenuItem onClick={handleDisapprove} disabled={loading}>
            {loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <Cancel sx={{ mr: 1 }} color="error" />
            )}
            Disapprove
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PurchaseOrderStatusIndicator;
