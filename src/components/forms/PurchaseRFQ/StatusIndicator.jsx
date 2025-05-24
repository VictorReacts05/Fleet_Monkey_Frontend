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
import axios from "axios";
import { toast } from "react-toastify";
import APIBASEURL from "../../../utils/apiBaseUrl";

const StatusIndicator = ({ status, purchaseRFQId, onStatusChange, readOnly }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);

  // Fetch existing approval record when component mounts
  useEffect(() => {
    if (purchaseRFQId) {
      fetchApprovalRecord();
    }
  }, [purchaseRFQId]);

  const fetchApprovalRecord = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.warn("No user data found in localStorage");
        setApprovalRecord(null);
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setApprovalRecord(null);
        return;
      }

      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      const approverID = 2;
      const response = await axios.get(
        `${APIBASEURL}/purchase-rfq-approvals?PurchaseRFQID=${purchaseRFQId}&ApproverID=${approverID}`,
        { headers }
      );
      console.log("Fetched approval record:", response.data);

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setApprovalRecord(response.data.data[0]);
      } else {
        setApprovalRecord(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No approval record exists yet for this PurchaseRFQ");
        setApprovalRecord(null);
      } else {
        console.error("Error fetching approval record:", error);
        setApprovalRecord(null);
      }
    }
  };

  const updateStatus = async (newStatus) => {
    if (!purchaseRFQId || isNaN(parseInt(purchaseRFQId, 10))) {
      toast.error("Invalid PurchaseRFQ ID");
      setAnchorEl(null);
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating PurchaseRFQ status to: ${newStatus}`);
      console.log(`PurchaseRFQ ID: ${purchaseRFQId}, Type: ${typeof purchaseRFQId}`);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User data not found in localStorage");
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (error) {
        throw new Error("Invalid user data format");
      }

      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      const approveEndpoint = `${APIBASEURL}/purchase-rfq/approve/`;
      const approveData = {
        purchaseRFQID: parseInt(purchaseRFQId, 10),
      };

      console.log("Sending approval request with data:", approveData);

      const statusResponse = await axios.post(
        approveEndpoint,
        approveData,
        { headers }
      );

      console.log("PurchaseRFQ status update response:", statusResponse.data);

      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      await fetchApprovalRecord();

      const isApproved = newStatus === "Approved";
      toast.success(`PurchaseRFQ ${isApproved ? "approved" : "disapproved"} successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
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
    switch (status) {
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
  const validStatus = status || "Unknown";

  return (
    <Box
    sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"}}
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