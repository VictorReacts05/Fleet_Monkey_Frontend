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
import { useSelector } from "react-redux";

const StatusIndicator = ({ status, supplierQuotationId, onStatusChange, readOnly }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const token = useSelector((state) => state.loginReducer?.token);

  // Fetch existing approval record
  useEffect(() => {
    if (supplierQuotationId) {
      fetchApprovalRecord();
    }
  }, [supplierQuotationId]);

  const fetchApprovalRecord = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const approverID = 2; // Hardcoded as per original
      const response = await axios.get(
        `${APIBASEURL}/supplier-quotation-approvals/${supplierQuotationId}/${approverID}`,
        { headers }
      );

      if (response.data.success && response.data.data) {
        setApprovalRecord(response.data.data);
      } else {
        setApprovalRecord(null);
      }
    } catch (error) {
      console.error("Error fetching approval record:", error);
      if (error.response?.status === 404) {
        setApprovalRecord(null); // No approval record exists
      } else {
        toast.error("Failed to fetch approval status");
      }
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

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      handleClose();

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const approverID = 2;
      const payload = {
        SupplierQuotationID: supplierQuotationId,
        ApproverID: approverID,
        Status: newStatus,
        Comments: `Status changed to ${newStatus}`,
      };

      const response = await axios.post(
        `${APIBASEURL}/supplier-quotation/approve`,
        payload,
        { headers }
      );

      if (response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        await fetchApprovalRecord();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case "Approved":
        return theme.palette.success.main;
      case "Rejected":
        return theme.palette.error.main;
      case "Pending":
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case "Approved":
        return <CheckCircle fontSize="small" />;
      case "Rejected":
        return <Cancel fontSize="small" />;
      case "Pending":
      default:
        return <PendingActions fontSize="small" />;
    }
  };

  const currentStatus = approvalRecord?.Status || status || "Pending";

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="body2" sx={{ mr: 1, fontWeight: "medium" }}>
        Status:
      </Typography>
      <Chip
        label={currentStatus}
        color={
          currentStatus === "Approved"
            ? "success"
            : currentStatus === "Rejected"
            ? "error"
            : "warning"
        }
        size="small"
        icon={getStatusIcon(currentStatus)}
        onClick={handleClick}
        sx={{
          fontWeight: "bold",
          cursor: readOnly ? "default" : "pointer",
          "& .MuiChip-icon": {
            color: "inherit",
          },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem
          onClick={() => updateStatus("Approved")}
          disabled={loading || currentStatus === "Approved"}
          sx={{
            color: theme.palette.success.main,
            fontWeight: "bold",
          }}
        >
          {loading && currentStatus !== "Approved" ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
          )}
          Approve
        </MenuItem>
        <MenuItem
          onClick={() => updateStatus("Rejected")}
          disabled={loading || currentStatus === "Rejected"}
          sx={{
            color: theme.palette.error.main,
            fontWeight: "bold",
          }}
        >
          {loading && currentStatus !== "Rejected" ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            <Cancel fontSize="small" sx={{ mr: 1 }} />
          )}
          Reject
        </MenuItem>
        <MenuItem
          onClick={() => updateStatus("Pending")}
          disabled={loading || currentStatus === "Pending"}
          sx={{
            color: theme.palette.warning.main,
            fontWeight: "bold",
          }}
        >
          {loading && currentStatus !== "Pending" ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            <PendingActions fontSize="small" sx={{ mr: 1 }} />
          )}
          Set as Pending
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StatusIndicator;