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
import { approvePurchaseRFQ } from './purchaserfqapi';

const StatusIndicator = ({ status, purchaseRFQId, onStatusChange, readOnly }) => {
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
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      // The approverID is hardcoded to 2 as specified
      const approverID = 2;
      
      try {
        const response = await axios.get(
          `http://localhost:7000/api/purchase-rfq-approvals?PurchaseRFQID=${purchaseRFQId}&ApproverID=${approverID}`,
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
          console.log("No approval record exists yet for this PurchaseRFQ");
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
      console.log(`Updating PurchaseRFQ status to: ${newStatus}`);
      console.log(`PurchaseRFQ ID: ${purchaseRFQId}, Type: ${typeof purchaseRFQId}`);
      
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const userId = user?.personId || 2;
      
      // First, update the Status in the PurchaseRFQ table using the correct API endpoint
      try {
        // Use the specific approve API endpoint
        const approveEndpoint = `http://localhost:7000/api/purchase-rfq/approve/`;
        
        // Create the payload with just the purchaseRFQID
        const approveData = {
          purchaseRFQID: parseInt(purchaseRFQId, 10)
        };
        
        console.log("Sending approval request with data:", approveData);
        
        // Make the API call to update the status
        const statusResponse = await axios.post(
          approveEndpoint,
          approveData,
          { headers }
        );
        
        console.log("PurchaseRFQ status update response:", statusResponse.data);
        
        // Now handle the approval record - this part is working correctly so we keep it unchanged
        const isApproved = newStatus === "Approved";
        const approvalData = {
          PurchaseRFQID: parseInt(purchaseRFQId, 10),
          ApproverID: 2,
          ApprovedYN: isApproved ? 1 : 0,
          ApproverDateTime: new Date().toISOString(),
          CreatedByID: userId
        };
        
        console.log("Updating approval record with data:", approvalData);
        
        // Check if approval record exists first
        const checkResponse = await axios.get(
          `http://localhost:7000/api/purchase-rfq-approvals?PurchaseRFQID=${purchaseRFQId}&ApproverID=2`,
          { headers }
        );
        
        let approvalResponse;
        
        if (checkResponse.data.success && checkResponse.data.data && checkResponse.data.data.length > 0) {
          // Update existing record
          console.log("Existing approval record found, updating...");
          approvalResponse = await axios.put(
            `http://localhost:7000/api/purchase-rfq-approvals`,
            approvalData,
            { headers }
          );
        } else {
          // Create new record
          console.log("No existing approval record, creating new one...");
          approvalResponse = await axios.post(
            `http://localhost:7000/api/purchase-rfq-approvals`,
            approvalData,
            { headers }
          );
        }
        
        console.log("Approval record response:", approvalResponse.data);
        
        // Call the onStatusChange callback to update parent component's state
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        
        // Refresh the approval record
        fetchApprovalRecord();
        
        toast.success(`PurchaseRFQ ${isApproved ? "approved" : "disapproved"} successfully`);
      } catch (error) {
        console.error("Error updating PurchaseRFQ:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
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
        onClick={handleClick}
        clickable={!readOnly}
        sx={{
          cursor: readOnly ? "default" : "pointer",
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