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
  approvePurchaseRFQ,
  fetchPurchaseRFQApprovalStatus,
} from "./PurchaseRFQAPI";

import APIBASEURL from "../../../utils/apiBaseUrl";
const StatusIndicator = ({
  status,
  purchaseRFQId,
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
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const fetchApprovalRecord = async () => {
    if (!purchaseRFQId) return;

    try {
      const user = getCurrentUser();
      if (!user?.personId) {
        throw new Error("No user found in localStorage");
      }

      console.log(
        `Fetching approval for user ${user.personId} and RFQ ${purchaseRFQId}`
      );
      const response = await fetchPurchaseRFQApprovalStatus(purchaseRFQId);
      console.log("Fetched approval record:", response);

      if (response.success && response.data) {
        // Handle single object or array
        const approval = Array.isArray(response.data)
          ? response.data.find(
              (record) =>
                parseInt(record.ApproverID) === parseInt(user.personId)
            )
          : response.data;

        if (approval) {
          const approved =
            Number(approval.ApprovedYN || approval.ApprovedStatus) === 1 ||
            approval.ApprovedYN === "true" ||
            approval.ApprovedStatus === "true";
          console.log(
            `User approval for ${user.personId}: Approved=${approved}`
          );
          setUserApprovalStatus(approved ? "Approved" : "Pending");
        } else {
          console.log(`No approval record for user ${user.personId}`);
          setUserApprovalStatus("Pending");
        }
      } else {
        console.log("No approval records or invalid response format");
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
    if (purchaseRFQId) {
      fetchApprovalRecord();
    }
  }, [purchaseRFQId]);

  const updateStatus = async (newStatus) => {
    if (!purchaseRFQId || isNaN(parseInt(purchaseRFQId, 10))) {
      toast.error("Invalid Purchase RFQ ID");
      setAnchorEl(null);
      return;
    }

    try {
      setLoading(true);
      const isApproved = newStatus === "Approved";
      console.log(
        `Updating approval status to: ${newStatus} for PurchaseRFQId: ${purchaseRFQId}`
      );

      const response = await approvePurchaseRFQ(purchaseRFQId, isApproved);
      console.log("Approval response:", response);

      setUserApprovalStatus(newStatus);

      // Fetch updated RFQ status
      const user = getCurrentUser();
      const headers = { Authorization: `Bearer ${user.personId}` };
      const rfqResponse = await fetch(
        `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
        { headers }
      );
      const rfqData = await rfqResponse.json();
      const overallStatus = rfqData.data?.Status || "Pending";

      if (onStatusChange && overallStatus !== status) {
        onStatusChange(overallStatus);
      }

      toast.success(
        `Purchase RFQ ${isApproved ? "approved" : "disapproved"} successfully`
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

export default StatusIndicator;
