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

const StatusIndicator = ({ status, purchaseInvoiceId, onStatusChange, readOnly }) => { 
  const theme = useTheme(); 
  const [anchorEl, setAnchorEl] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [approvalRecord, setApprovalRecord] = useState(null); 
  const [localStatus, setLocalStatus] = useState(status || "Pending");

  useEffect(() => { 
    if (purchaseInvoiceId) { 
      fetchApprovalRecord(); 
    } 
  }, [purchaseInvoiceId]); 

  const fetchApprovalRecord = async () => { 
    try { 
      const userData = localStorage.getItem("user"); 
      if (!userData) { 
        console.warn("No user data found in localStorage"); 
        setApprovalRecord(null); 
        setLocalStatus("Pending");
        return; 
      } 

      let user; 
      try { 
        user = JSON.parse(userData); 
      } catch (error) { 
        console.error("Error parsing user data:", error); 
        setApprovalRecord(null); 
        setLocalStatus("Pending"); 
        return; 
      } 

      const headers = user?.token 
        ? { Authorization: `Bearer ${user.token}` } 
        : {}; 

      const approverID = 2; 
      const response = await axios.get( 
        `${APIBASEURL}/pInvoice-approval/${purchaseInvoiceId}/${approverID}`, 
        { headers } 
      ); 
      console.log("Fetched approval record:", response.data); 

      if ( 
        response.data.success && 
        response.data.data && 
        response.data.data.length > 0 
      ) { 
        const record = response.data.data[0];
        setApprovalRecord(record); 
        setLocalStatus(record.ApprovedYN === 1 ? "Approved" : "Pending");
      } else { 
        setApprovalRecord(null); 
        setLocalStatus("Pending");
      } 
    } catch (error) { 
      if (error.response && error.response.status === 404) { 
        console.log("No approval record exists yet for this Purchase Invoice"); 
        setApprovalRecord(null); 
        setLocalStatus("Pending"); 
      } else { 
        console.error("Error fetching approval record:", error); 
        setApprovalRecord(null); 
        setLocalStatus("Pending"); 
      } 
    } 
  }; 

  const updateStatus = async (newStatus) => { 
    if (!purchaseInvoiceId || isNaN(parseInt(purchaseInvoiceId, 10))) { 
      toast.error("Invalid Purchase Invoice ID"); 
      setAnchorEl(null); 
      return; 
    } 

    try { 
      setLoading(true); 
      console.log(`Updating Purchase Invoice status to: ${newStatus}`); 
      console.log(`Purchase Invoice ID: ${purchaseInvoiceId}, Type: ${typeof purchaseInvoiceId}`); 

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

      const endpoint = newStatus === "Approved" 
        ? `${APIBASEURL}/pinvoice/approve` 
        : `${APIBASEURL}/purchase-invoice/disapprove/`; 
      const approveData = { 
        PInvoiceID: parseInt(purchaseInvoiceId, 10), 
      }; 

      console.log(`Sending ${newStatus} request with data:`, approveData); 

      const statusResponse = await axios.post( 
        endpoint, 
        approveData, 
        { headers } 
      ); 

      console.log(`Purchase Invoice ${newStatus} response:`, statusResponse.data); 

      setLocalStatus(newStatus); 
      if (onStatusChange) { 
        onStatusChange(newStatus); 
      } 

      await fetchApprovalRecord(); 

      const isApproved = newStatus === "Approved"; 
      toast.success(`Purchase Invoice ${isApproved ? "approved" : "disapproved"} successfully`); 
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
      console.log("AnchorEl set to:", event.currentTarget); 
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
  const validStatus = localStatus; 

  // Log the Menu open state
  console.log("Menu open state:", Boolean(anchorEl));

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
        // Removed clickable prop, control cursor via sx
        sx={{
          height: 28,
          minWidth: 80,
          padding: "2px 0px",
          borderRadius: "12px",
          position: "relative",
          cursor: readOnly ? "default" : "pointer",
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
            zIndex: 1500, // Ensure menu appears above other elements
          },
        }}
      >
        <MenuItem onClick={handleApprove}>Approve</MenuItem>
        <MenuItem onClick={handleDisapprove}>Disapprove</MenuItem>
      </Menu>
      <button onClick={handleApprove}>Approve</button>
    </Box>
  ); 
}; 

export default StatusIndicator;