// PurchaseInvoice/StatusIndicator.jsx
import {
  Box,
  Typography,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { Button } from "@mui/material";

// Helper function to get auth header and personId
const getAuthHeader = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("No user data found in localStorage");
      return { headers: {}, personId: null };
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return { headers: {}, personId: null };
    }

    const personId = user.personId || user.id || user.userId || null;
    if (!personId) {
      console.warn("personId is null or undefined for user:", user);
    }

    const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
    return { headers, personId };
  } catch (error) {
    console.error("Error retrieving auth header:", error);
    return { headers: {}, personId: null };
  }
};

const StatusIndicator = ({
  status,
  purchaseInvoiceId,
  onStatusChange,
  readOnly,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status || "Pending");

  useEffect(() => {
    if (purchaseInvoiceId) {
      fetchApprovalRecord();
    }
  }, [purchaseInvoiceId]);

  const fetchApprovalRecord = async () => {
    setLoading(true);
    try {
      const { headers, personId } = getAuthHeader();
      if (!personId) {
        throw new Error("User not authenticated: No personId found");
      }

      if (!purchaseInvoiceId || isNaN(parseInt(purchaseInvoiceId, 10))) {
        throw new Error("Invalid Purchase Invoice ID");
      }

      const response = await axios.get(
        `${APIBASEURL}/pInvoice-Approval/${purchaseInvoiceId}/${personId}`,
        { headers }
      );
      console.log("Fetched approval record:", response.data);

      let approvalStatus = "Pending";
      if (
        response.data?.success &&
        response.data?.data &&
        response.data.data.length > 0
      ) {
        const record = response.data.data[0];
        approvalStatus = record.ApprovedYN === 1 ? "Approved" : "Pending";
      } else if (response.data?.ApprovedYN === 1) {
        approvalStatus = "Approved";
      }

      setLocalStatus(approvalStatus);
    } catch (error) {
      console.error("Error fetching approval record:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 404) {
        console.log("No approval record exists for this Purchase Invoice");
      }
      setLocalStatus("Pending");
      toast.error("Failed to load approval status");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!purchaseInvoiceId || isNaN(parseInt(purchaseInvoiceId, 10))) {
      toast.error("Invalid Purchase Invoice ID");
      setAnchorEl(null);
      return;
    }

    setLoading(true);
    try {
      const { headers, personId } = getAuthHeader();
      if (!personId) {
        throw new Error("User not authenticated: No personId found");
      }

      const endpoint =
        newStatus === "Approved"
          ? `${APIBASEURL}/pinvoice/approve`
          : `${APIBASEURL}/purchase-invoice/disapprove/`;
      const approveData = {
        PInvoiceID: parseInt(purchaseInvoiceId, 10),
        ApproverID: parseInt(personId, 10), // Include ApproverID
      };

      console.log(`Sending ${newStatus} request with data:`, approveData);

      const statusResponse = await axios.post(endpoint, approveData, {
        headers,
      });

      console.log(
        `Purchase Invoice ${newStatus} response:`,
        statusResponse.data
      );

      setLocalStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      await fetchApprovalRecord(); // Refresh approval status

      toast.success(`Purchase Invoice ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, {
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
    console.log("Chip clicked, readOnly:", readOnly, "status:", localStatus);
    if (!readOnly && localStatus !== "Approved") {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    console.log("Closing menu");
    setAnchorEl(null);
  };

  const handleApprove = () => {
    console.log("Approve clicked");
    updateStatus("Approved");
  };

  const handleDisapprove = () => {
    console.log("Disapprove clicked");
    updateStatus("Pending");
  };

  const getChipProps = () => {
    switch (localStatus) {
      case "Approved":
        return {
          color: "success",
          icon: <CheckCircle />,
        };
      case "Pending":
        return {
          color: "warning",
          icon: <Cancel />,
        };
      default:
        return {
          color: "error",
          icon: <Cancel />,
        };
    }
  };

  const chipProps = getChipProps();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <Chip
            label={
              <Typography variant="body2">
                {loading ? "Processing..." : localStatus}
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
            sx={{
              height: 28,
              minWidth: 80,
              padding: "2px 0px",
              borderRadius: "12px",
              cursor:
                readOnly || localStatus === "Approved" ? "default" : "pointer",
              "& .MuiChip-label": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              "& .MuiMenu-paper": {
                minWidth: 200,
                borderRadius: "8px",
                boxShadow: theme.shadows[3],
                backgroundColor: theme.palette.background.paper,
              },
            }}
          ></Menu>
        </Box>
      </Box>
    </>
  );
};

export default StatusIndicator;
