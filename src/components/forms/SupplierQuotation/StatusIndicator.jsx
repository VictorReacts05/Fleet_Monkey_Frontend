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
import { approveSupplierQuotation } from './SupplierQuotationAPI';

const StatusIndicator = ({ status, supplierQuotationId, onStatusChange, readOnly }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);

  // Fetch existing approval record when component mounts
  useEffect(() => {
    if (supplierQuotationId) {
      fetchApprovalRecord();
    }
  }, [supplierQuotationId]);

  const fetchApprovalRecord = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      // The approverID is hardcoded to 2 as in other components
      const approverID = 2;
      
      try {
        const response = await axios.get(
          `http://localhost:7000/api/supplier-quotation-approvals?SupplierQuotationID=${supplierQuotationId}&ApproverID=${approverID}`,
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
          console.log("No approval record exists yet for this Supplier Quotation");
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
      console.log(`Updating Supplier Quotation status to: ${newStatus}`);
      console.log(`Supplier Quotation ID: ${supplierQuotationId}, Type: ${typeof supplierQuotationId}`);
      
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const userId = user?.personId || 2;
      
      // First, update the Status in the SupplierQuotation table using the correct API endpoint
      try {
        // Use the specific approve API endpoint
        const approveEndpoint = `http://localhost:7000/api/supplier-Quotation/approve/`;
        
        // Create the payload with just the supplierQuotationID
        const approveData = {
          supplierQuotationID: parseInt(supplierQuotationId, 10)
        };
        
        console.log("Sending approval request with data:", approveData);
        
        // Make the API call to update the status
        const statusResponse = await axios.post(
          approveEndpoint,
          approveData,
          { headers }
        );
        
        console.log("Supplier Quotation status update response:", statusResponse.data);
        
        // Now handle the approval record
        const isApproved = newStatus === "Approved";
        const approvalData = {
          SupplierQuotationID: parseInt(supplierQuotationId, 10),
          ApproverID: 2,
          ApprovedYN: isApproved ? 1 : 0,
          ApproverDateTime: new Date().toISOString(),
          CreatedByID: userId
        };
        
        console.log("Updating approval record with data:", approvalData);
        
        // Check if approval record exists first
        const checkResponse = await axios.get(
          `http://localhost:7000/api/supplier-quotation-approvals?SupplierQuotationID=${supplierQuotationId}&ApproverID=2`,
          { headers }
        );
        
        let approvalResponse;
        
        if (checkResponse.data.success && checkResponse.data.data && checkResponse.data.data.length > 0) {
          // Update existing record
          console.log("Existing approval record found, updating...");
          approvalResponse = await axios.put(
            `http://localhost:7000/api/supplier-quotation-approvals`,
            approvalData,
            { headers }
          );
        } else {
          // Create new record
          console.log("No existing approval record, creating new one...");
          approvalResponse = await axios.post(
            `http://localhost:7000/api/supplier-quotation-approvals`,
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
        
        toast.success(`Supplier Quotation ${isApproved ? "approved" : "disapproved"} successfully`);
      } catch (error) {
        console.error("Error updating Supplier Quotation:", error);
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
    // Only allow clicking if not read-only and not already approved
    if (!readOnly && status !== "Approved") {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = () => {
    updateStatus("Approved");
  };

  const getChipProps = () => {
    switch (status) {
      case "Approved":
        return {
          color: "success",
          icon: <CheckCircle />,
          clickable: false, // Approved status is never clickable
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
        clickable={chipProps.clickable}
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
      </Menu>
    </Box>
  );
};

export default StatusIndicator;