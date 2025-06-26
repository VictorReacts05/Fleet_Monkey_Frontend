import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ApprovalProgressTracker from "./ApprovalProgressTracker";
import APIBASEURL from "../../utils/apiBaseUrl";

const ApprovalTab = ({ moduleType, moduleId, apiEndpoint, refreshTrigger }) => {
  const [approvalData, setApprovalData] = useState({
    approvers: [],
    activeStep: 0,
    completedSteps: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  const fetchApprovalStatus = useCallback(async () => {
    if (!moduleId) return;

    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeader();
      const response = await axios.get(
        `${
          apiEndpoint ||
          `${APIBASEURL}/${moduleType}/${moduleId}/approval-status`
        }`,
        { headers }
      );

      if (response.data && response.data.success) {
        const { approvalStatus, completedApprovals } = response.data.data;
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
    } finally {
      setLoading(false);
    }
  }, [moduleId, moduleType, apiEndpoint]);

  useEffect(() => {
    fetchApprovalStatus();
  }, [fetchApprovalStatus, refreshTrigger]); // Add refreshTrigger to dependencies

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: isDarkMode ? "#1e1e1e" : "#fdecea",
          color: isDarkMode ? "#ffb3b3" : "#d32f2f",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: isDarkMode ? "#1c1c1c" : "#f3f3f3",
          borderRadius: 2,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: isDarkMode ? "#ddd" : "#333" }}>
          Loading approval status...
        </Typography>
      </Box>
    );
  }

  if (!approvalData.approvers.length) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: isDarkMode ? "#2c2c2c" : "#fff8e1",
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            color: isDarkMode ? "#ccc" : "#555",
            fontWeight: 500,
            fontSize: "1rem",
          }}
        >
          No approval data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: isDarkMode ? "#121212" : "#f5f5f5",
        borderRadius: 3,
        boxShadow: isDarkMode ? "0 0 10px #333" : "0 0 10px #ccc",
      }}
    >
      <ApprovalProgressTracker
        steps={approvalData.approvers}
        activeStep={approvalData.activeStep}
        completedSteps={approvalData.completedSteps}
      />
    </Box>
  );
};

export default ApprovalTab;