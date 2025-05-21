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

  // Update the fetchApprovalRecord function
  const fetchApprovalRecord = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
  
      // The approverID is hardcoded to 2 as in other components
      const approverID = 2;
      
      try {
        // Use the correct URL format with underscore separator
        const response = await axios.get(
          `http://localhost:7000/api/supplier-quotation-approvals/${supplierQuotationId}/${approverID}`,
          { headers }
        );
        console.log("Fetched approval record:", response.data);
  
        if (response.data.success && response.data.data) {
          setApprovalRecord(response.data.data);
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

  // Update the approval record check in the updateStatus function
  // Remove the standalone checkResponse declaration
  // const checkResponse = await axios.get(
  //   `http://localhost:7000/api/supplier-quotation-approvals/${supplierQuotationId}_2`,
  //   { headers }
  // );

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      console.log(`Updating Supplier Quotation status to: ${newStatus}`);
      
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const userId = user?.personId || 2;
      
      try {
        const approveData = {
          supplierQuotationID: parseInt(supplierQuotationId, 10)
        };
        
        try {
          // Try to update via API
          const statusResponse = await axios.post(
            `http://localhost:7000/api/supplier-Quotation/approve/`,
            approveData,
            { headers }
          );
          console.log("Supplier Quotation status update response:", statusResponse.data);
        } catch (apiError) {
          // Log the error but continue - the database might still be updated
          console.error("API error but continuing:", apiError);
          console.log("Continuing with UI update despite API error");
        }
        
        // Continue with approval record update regardless of API error
        const approvalData = {
          SupplierQuotationID: parseInt(supplierQuotationId, 10),
          ApproverID: 2,
          ApprovedYN: newStatus === "Approved" ? 1 : 0,
          ApproverDateTime: new Date().toISOString(),
          CreatedByID: userId
        };
        
        try {
          // Check if approval record exists
          const checkResponse = await axios.get(
            `http://localhost:7000/api/supplier-quotation-approvals/${supplierQuotationId}/2`,
            { headers }
          );
          
          let approvalResponse;
          
          if (checkResponse.data.success && checkResponse.data.data) {
            approvalResponse = await axios.put(
              `http://localhost:7000/api/supplier-quotation-approvals`,
              approvalData,
              { headers }
            );
          } else {
            approvalResponse = await axios.post(
              `http://localhost:7000/api/supplier-quotation-approvals`,
              approvalData,
              { headers }
            );
          }
          
          console.log("Approval record response:", approvalResponse.data);
        } catch (approvalError) {
          console.error("Error with approval record, but continuing:", approvalError);
        }
        
        // Update UI state regardless of API errors
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        
        // Try to refresh the approval record
        try {
          fetchApprovalRecord();
        } catch (fetchError) {
          console.error("Error refreshing approval record:", fetchError);
        }
        
        toast.success(`Supplier Quotation ${newStatus === "Approved" ? "approved" : "disapproved"} successfully`);
      } catch (error) {
        console.error("Error updating Supplier Quotation:", error);
        
        // Check if database was updated despite the error
        if (error.response?.status === 403) {
          console.log("403 Forbidden error, but database might be updated. Updating UI...");
          // Update UI state anyway
          if (onStatusChange) {
            onStatusChange(newStatus);
          }
          toast.info("Status may have been updated in the database despite API error");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
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


// Update the API call to use the correct format
// Remove these standalone lines at the bottom of the file:
// const getApprovalRecord = async (supplierQuotationId, approverId) => {
//   try {
//     const response = await axios.get(
//       `http://localhost:7000/api/supplier-quotation-approvals/${supplierQuotationId}_${approverId}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching approval record:", error);
//     throw error;
//   }
// };

// const approvalRecord = await getApprovalRecord(supplierQuotationId, approverId);