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

const StatusIndicator = ({ status, purchaseOrderId, onStatusChange, readOnly,approverID }) => { 
  const theme = useTheme(); 
  const [anchorEl, setAnchorEl] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [approvalRecord, setApprovalRecord] = useState(null); 
  const [localStatus, setLocalStatus] = useState(status || "Unknown");

  useEffect(() => { 
    setLocalStatus(status || "Unknown");
    if (purchaseOrderId) { 
      fetchApprovalRecord(); 
    } 
  }, [purchaseOrderId, status]); 

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

      
      const response = await axios.get( 
        `${APIBASEURL}/po-Approval/${purchaseOrderId}/${approverID}`, 
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
        console.log("No approval record exists yet for this Purchase Order"); 
        setApprovalRecord(null); 
      } else { 
        console.error("Error fetching approval record:", error); 
        setApprovalRecord(null); 
      } 
    } 
  }; 

  const updateStatus = async (newStatus) => { 
    if (!purchaseOrderId || isNaN(parseInt(purchaseOrderId, 10))) { 
      toast.error("Invalid Purchase Order ID"); 
      setAnchorEl(null); 
      return; 
    } 

    try { 
      setLoading(true); 
      console.log(`Updating Purchase Order status to: ${newStatus}`); 
      console.log(`Purchase Order ID: ${purchaseOrderId}, Type: ${typeof purchaseOrderId}`); 

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

      const endpoint = 
         `${APIBASEURL}/po/approve` 
      const approveData = { 
        POID: parseInt(purchaseOrderId, 10), 
      }; 

      console.log(`Sending ${newStatus} request with data:`, approveData); 

      const statusResponse = await axios.post( 
        endpoint, 
        approveData, 
        { headers } 
      ); 

      console.log(`Purchase Order ${newStatus} response:`, statusResponse.data); 

      if (!statusResponse.data.success) {
        throw new Error(statusResponse.data.message || `Failed to ${newStatus.toLowerCase()} Purchase Order`);
      }

      setLocalStatus(newStatus);
      if (onStatusChange) { 
        onStatusChange(newStatus); 
      } 

      await fetchApprovalRecord(); 

      const isApproved = newStatus === "Approved"; 
      toast.success(`Purchase Order ${isApproved ? "approved" : "disapproved"} successfully`); 
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
    console.log("Chip clicked, readOnly:", readOnly);
    if (!readOnly) { 
      setAnchorEl(event.currentTarget); 
    } 
  }; 

  const handleClose = () => { 
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
          clickable: !readOnly, 
        }; 
      default:
        return { 
          color: "error",
          icon: <Cancel />,
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
        justifyContent: "center"
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
            minWidth: 200,
            borderRadius: "8px",
            boxShadow: theme.shadows[3],
            backgroundColor: theme.palette.background.paper,
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