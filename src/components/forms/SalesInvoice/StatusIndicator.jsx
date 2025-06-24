import React, { useState } from "react";
import {
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { CheckCircle, PendingActions } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { getAuthHeader } from "./SalesInvoiceAPI";

const StatusIndicator = ({ salesInvoiceId, onStatusChange, readOnly }) => {
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch user approval status when component mounts or salesInvoiceId changes
  React.useEffect(() => {
    const loadStatus = async () => {
      if (!salesInvoiceId) return;

      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const approverId = user?.personId;

        if (!approverId) {
          console.error("No personId found in localStorage");
          throw new Error("User not authenticated");
        }

        console.log("Fetching user approval status", {
          salesInvoiceId,
          approverId,
        });
        const { headers } = getAuthHeader();
        const response = await axios.get(
          `${APIBASEURL}/salesInvoiceApproval/${salesInvoiceId}/${approverId}`,
          { headers }
        );
        console.log("Fetched approval record:", response.data);

        const userStatus =
          response.data.success &&
          response.data.data &&
          response.data.data.ApprovedYN === 1
            ? "Approved"
            : "Pending";
        console.log("Fetched user status:", userStatus);
        setStatus(userStatus);
      } catch (error) {
        console.error("Failed to fetch user approval status:", error);
        if (error.response && error.response.status === 404) {
          console.log("No approval record exists yet for this Sales Invoice");
          setStatus("Pending");
        } else {
          console.log("Unable to load approval status");
          setStatus("Pending");
        }
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [salesInvoiceId]);

  const handleApprove = async () => {
    if (!salesInvoiceId || isNaN(parseInt(salesInvoiceId, 10))) {
      console.log("Invalid Sales Invoice ID");
      setAnchorEl(null);
      return;
    }

    setLoading(true);
    try {
      console.log(
        `Initiating approval for Sales Invoice ID: ${salesInvoiceId}`
      );
      const { headers } = getAuthHeader();
      const approveData = {
        SalesInvoiceID: parseInt(salesInvoiceId, 10),
      };

      const response = await axios.post(
        `${APIBASEURL}/salesInvoice/approve/`,
        approveData,
        { headers }
      );
      console.log("Approval response:", response);

      if (response.data.success) {
        toast.success("Approval recorded successfully");
        setStatus("Approved");
        onStatusChange?.("Approved");
      } else {
        throw new Error(response.data.message || "Approval failed");
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
