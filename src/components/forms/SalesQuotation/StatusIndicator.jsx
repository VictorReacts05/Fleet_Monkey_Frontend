import { 
  Box, 
  Typography, 
  Chip, 
  Menu, 
  MenuItem, 
  CircularProgress, 
  useTheme, 
} from "@mui/material"; 
import { CheckCircle, PendingActions, Cancel } from "@mui/icons-material"; 
import axios from "axios"; 
import { toast } from "react-toastify"; 
import { useState, useEffect } from "react";
import APIBASEURL from "../../../utils/apiBaseUrl";

const StatusIndicator = ({ status, salesQuotationId, onStatusChange, readOnly }) => { 
  const theme = useTheme(); 
  const [anchorEl, setAnchorEl] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [approvalRecord, setApprovalRecord] = useState(null); 

  useEffect(() => { 
    if (salesQuotationId) { 
      fetchApprovalRecord(); 
    } 
  }, [salesQuotationId]); 

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
        `${APIBASEURL}/sales-Quotation-Approvals?SalesQuotationID=${salesQuotationId}&ApproverID=${approverID}`, 
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
        console.log("No approval record exists yet for this Sales Quotation"); 
        setApprovalRecord(null); 
      } else { 
        console.error("Error fetching approval record:", error); 
        setApprovalRecord(null); 
      } 
    } 
  }; 

  const updateStatus = async (newStatus) => { 
    if (!salesQuotationId || isNaN(parseInt(salesQuotationId, 10))) { 
      toast.error("Invalid Sales Quotation ID"); 
      setAnchorEl(null); 
      return; 
    } 

    try { 
      setLoading(true); 
      console.log(`Updating Sales Quotation status to: ${newStatus}`); 
      console.log(`Sales Quotation ID: ${salesQuotationId}, Type: ${typeof salesQuotationId}`); 

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

      const approveEndpoint = `${APIBASEURL}/sales-quotation/approve/`; 
      const approveData = { 
        salesQuotationID: parseInt(salesQuotationId, 10), 
      }; 

      console.log("Sending approval request with data:", approveData); 

      const statusResponse = await axios.post( 
        approveEndpoint, 
        approveData, 
        { headers } 
      ); 

      console.log("Sales Quotation status update response:", statusResponse.data); 

      if (onStatusChange) { 
        onStatusChange(newStatus); 
      } 

      await fetchApprovalRecord(); 

      const isApproved = newStatus === "Approved"; 
      toast.success(`Sales Quotation ${isApproved ? "approved" : "disapproved"} successfully`); 
    } catch (error) { 
      console.error("Error updating status:", error); 
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
  const validStatus = status || "Unknown"; 

  return ( 
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
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
      > 
        <MenuItem onClick={handleApprove}>Approve</MenuItem> 
        <MenuItem onClick={handleDisapprove}>Disapprove</MenuItem> 
      </Menu> 
    </Box> 
  ); 
}; 

export default StatusIndicator;