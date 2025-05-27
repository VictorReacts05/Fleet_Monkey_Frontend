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

const StatusIndicator = ({ status, salesOrderId, onStatusChange, readOnly }) => { 
  const theme = useTheme(); 
  const [anchorEl, setAnchorEl] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [approvalRecord, setApprovalRecord] = useState(null); 
  const [localStatus, setLocalStatus] = useState(status || "Unknown"); // Local status state

  useEffect(() => { 
    setLocalStatus(status || "Unknown"); // Sync with prop
    if (salesOrderId) { 
      fetchApprovalRecord(); 
    } 
  }, [salesOrderId, status]); 

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
        `${APIBASEURL}/sales-order-approvals?salesOrderId=${salesOrderId}&ApproverID=${approverID}`, 
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
        console.log("No approval record exists yet for this Sales Order"); 
        setApprovalRecord(null); 
      } else { 
        console.error("Error fetching approval record:", error); 
        setApprovalRecord(null); 
      } 
    } 
  }; 

  const updateStatus = async (newStatus) => { 
    if (!salesOrderId || isNaN(parseInt(salesOrderId, 10))) { 
      toast.error("Invalid Sales Order ID"); 
      setAnchorEl(null); 
      return; 
    } 

    try { 
      setLoading(true); 
      console.log(`Updating Sales Order status to: ${newStatus}`); 
      console.log(`Sales Order ID: ${salesOrderId}, Type: ${typeof salesOrderId}`); 

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

      // Use different endpoints for approve and disapprove
      const endpoint = newStatus === "Approved" 
        ? `${APIBASEURL}/sales-order/approve/` 
        : `${APIBASEURL}/sales-order/disapprove/`; 
      const approveData = { 
        salesOrderId: parseInt(salesOrderId, 10), 
      }; 

      console.log(`Sending ${newStatus} request with data:`, approveData); 

      const statusResponse = await axios.post( 
        endpoint, 
        approveData, 
        { headers } 
      ); 

      console.log(`Sales Order ${newStatus} response:`, statusResponse.data); 

      setLocalStatus(newStatus); // Update local status
      if (onStatusChange) { 
        onStatusChange(newStatus); 
      } 

      await fetchApprovalRecord(); 

      const isApproved = newStatus === "Approved"; 
      toast.success(`Sales Order ${isApproved ? "approved" : "disapproved"} successfully`); 
    } catch (error) { 
      console.error(`Error updating status to ${newStatus}:`, error); 
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
    console.log("Chip clicked, readOnly:", readOnly); // Debug log
    if (!readOnly) { 
      setAnchorEl(event.currentTarget); 
    } 
  }; 

  const handleClose = () => { 
    setAnchorEl(null); 
  }; 

  const handleApprove = () => { 
    console.log("Approve clicked"); // Debug log
    updateStatus("Approved"); 
  }; 

  const handleDisapprove = () => { 
    console.log("Disapprove clicked"); // Debug log
    updateStatus("Pending"); 
  }; 

  const getChipProps = () => { 
    switch (localStatus) { 
      case "Approved": 
        return { 
          color: "success", 
          icon: <CheckCircle />, 
          clickable: !readOnly, 
        }; 
      default: // Handle "Pending" and "Unknown"
        return { 
          color: "error", // Use error for non-approved states
          icon: <Cancel />, // Show cross icon
          clickable: !readOnly, 
        }; 
    } 
  }; 

  const chipProps = getChipProps(); 
  const validStatus = localStatus; 

  return ( 
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1, 
        justifyContent: "center" // Match sample alignment
      }}
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
            justifyContent: "center"
          }
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiMenu-paper": {
            minWidth: 200, // Set a minimum width for the menu
            borderRadius: "8px", // Rounded corners for the menu
            boxShadow: theme.shadows[3], // Use theme shadows for consistency
            backgroundColor: theme.palette.background.paper, // Match theme background
          },
        }}
      >
        <MenuItem onClick={handleApprove}>Approve</MenuItem>
        <MenuItem onClick={handleDisapprove}>Disapprove</MenuItem>
      </Menu>
    </Box>
  ); 
}; 

export default StatusIndicator;