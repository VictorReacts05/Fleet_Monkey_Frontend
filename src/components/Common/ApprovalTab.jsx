import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ApprovalProgressTracker from "./ApprovalProgressTracker";
import APIBASEURL from "../../utils/apiBaseUrl";

const ApprovalTab = ({ moduleType, moduleId, apiEndpoint }) => {
  const [approvalData, setApprovalData] = useState({
    approvers: [],
    activeStep: 0,
    completedSteps: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  const fetchApprovalStatus = useCallback(async () => {
    if (!moduleId) return;

    setLoading(true);
    setError(null);

    try {
      const { headers } = getAuthHeader();
      const response = await axios.get(
        `${
          apiEndpoint ||
          `${APIBASEURL}/${moduleType}/${moduleId}/approval-status`
        }`,
        { headers }
      );

      if (response.data && response.data.success) {
        const { approvalStatus, completedApprovals, requiredApprovers } =
          response.data.data;
        const approvers = approvalStatus.map(
          (approver) => `${approver.FirstName} ${approver.LastName}`
        );
        const completedSteps = approvalStatus
          .map((approver, index) => (approver.Approved ? index : -1))
          .filter((index) => index !== -1);
        setApprovalData({
          approvers,
          activeStep: completedApprovals,
          completedSteps,
        });
      } else {
        throw new Error("Unexpected approval status response");
      }
    } catch (err) {
      console.error(`Error fetching approval status for ${moduleType}:`, err);
      setError(err.message || "Failed to load approval status");
      toast.error(`Failed to load approval status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [moduleId, moduleType, apiEndpoint]);

  useEffect(() => {
    fetchApprovalStatus();
  }, [fetchApprovalStatus]);

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading approval status...</Typography>
      </Box>
    );
  }

  if (!approvalData.approvers.length) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No approval data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <ApprovalProgressTracker
        steps={approvalData.approvers}
        activeStep={approvalData.activeStep}
        completedSteps={approvalData.completedSteps}
      />
    </Box>
  );
};

export default ApprovalTab;
