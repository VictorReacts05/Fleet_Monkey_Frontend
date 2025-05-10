import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, PendingActions, Cancel } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const StatusIndicator = ({ status, salesRFQId, onStatusChange, readOnly }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);

  // Fetch existing approval record when component mounts
  useEffect(() => {
    if (salesRFQId) {
      fetchApprovalRecord();
    }
  }, [salesRFQId]);

  const fetchApprovalRecord = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      // Try to fetch the approval record, but don't fail if it doesn't exist
      try {
        const response = await axios.get(
          `http://localhost:7000/api/sales-rfq-approvals/${salesRFQId}`,
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
        // If we get a 404, it means no record exists yet
        if (error.response && error.response.status === 404) {
          console.log("No approval record exists yet for this SalesRFQ");
          setApprovalRecord(null);
        } else {
          console.error("Error fetching approval record:", error);
        }
      }
    } catch (error) {
      console.error("Error in fetchApprovalRecord:", error);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);

      // Get auth token from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const userId = user?.personId || user?.id || 2; // Default to 2 if not found

      console.log(
        `Sending PUT request to update status to ${newStatus} for SalesRFQ ID: ${salesRFQId}`
      );

      // 1. Update the Status in SalesRFQ table
      const salesRFQResponse = await axios.put(
        `http://localhost:7000/api/sales-rfq/${salesRFQId}`,
        {
          Status: newStatus,
          SalesRFQID: salesRFQId,
        },
        { headers }
      );

      console.log("Status update response:", salesRFQResponse.data);

      // 2. Create or update record in SalesRFQApproval table
      const isApproved = newStatus === "Approved";
      const approvalData = {
        SalesRFQID: parseInt(salesRFQId, 10), // Convert to number
        ApproverID: 2, // Hardcoded to 2
        ApprovedYN: isApproved ? 1 : 0,
        FormName: "Sales RFQ",
        RoleName: "Sales RFQ Approver",
        UserID: 2, // Hardcode UserID to 2 as well
        ApproverDateTime: new Date().toISOString(), // Add timestamp
        CreatedByID: 2 // Add CreatedByID
      };

      let approvalResponse;

      try {
        // Always try to create a new record first
        console.log(`${isApproved ? "Creating" : "Updating"} approval record:`, approvalData);
        
        try {
          // Try POST first (create new record)
          approvalResponse = await axios.post(
            `http://localhost:7000/api/sales-rfq-approvals`,
            approvalData,
            { headers }
          );
          console.log("POST approval response:", approvalResponse.data);
        } catch (postError) {
          // If POST fails with 400 (likely because record exists), try PUT
          if (postError.response && postError.response.status === 400) {
            console.log("POST failed, trying PUT instead");
            approvalResponse = await axios.put(
              `http://localhost:7000/api/sales-rfq-approvals`,
              approvalData,
              { headers }
            );
            console.log("PUT approval response:", approvalResponse.data);
          } else {
            // If it's not a 400 error, rethrow
            throw postError;
          }
        }
      } catch (error) {
        console.error("Error with approval record:", error);
        // Continue with the status update even if approval record fails
        approvalResponse = { data: { success: true } };
      }

      // Update local state if both operations were successful
      if (salesRFQResponse.data.success && approvalResponse.data.success) {
        toast.success(
          `SalesRFQ ${isApproved ? "approved" : "disapproved"} successfully`
        );
        onStatusChange(newStatus);

        // Update the approval record state and refetch
        fetchApprovalRecord();
      } else {
        toast.error(
          `Failed to ${isApproved ? "approve" : "disapprove"}: ${
            salesRFQResponse.data.message || approvalResponse.data.message
          }`
        );
      }
    } catch (error) {
      console.error(`Error updating SalesRFQ status to ${newStatus}:`, error);
      toast.error(
        `Error updating status: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleClick = (event) => {
    if (readOnly) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = () => {
    console.log("Approve button clicked");
    updateStatus("Approved");
  };

  const handleDisapprove = () => {
    console.log("Disapprove button clicked");
    updateStatus("Pending");
  };

  // Determine chip color based on status
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

  return (
    <Box>
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
        onClick={chipProps.clickable ? handleClick : undefined}
        sx={{
          cursor: chipProps.clickable ? "pointer" : "default",
          "& .MuiChip-label": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
        {status === "Approved" && (
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
