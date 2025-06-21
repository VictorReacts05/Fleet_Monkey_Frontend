import React, { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../common/DataTable";
import ConfirmDialog from "../../common/ConfirmDialog";
import { fetchSalesRFQs, deleteSalesRFQ } from "./SalesRFQAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton, Chip } from "@mui/material";
import SearchBar from "../../common/SearchBar";
import { showToast } from "../../toastNotification";
import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const SalesRFQList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);

  const columns = [
    { field: "series", headerName: "Series", flex: 1 },
    { field: "customerName", headerName: "Customer Name", flex: 1 },
    // { field: "supplierName", headerName: "Supplier Name", flex: 1 },
    { 
      field: "status",
      headerName: "Status", 
      flex: 1,
      renderCell: (params) => {
        const status = params.value || 'Pending';
        let color = 'default';
        
        if (status === 'Approved') color = 'success';
        else if (status === 'Pending') color = 'warning';
        
        return <Chip label={status} color={color} size="small" />;
      }
    },
    {
      field: "hasPurchaseRFQ",
      headerName: "Purchase RFQ",
      flex: 1,
      renderCell: (params) => {
        return params.value ? 
          <Chip label="Created" color="info" size="small" /> : 
          <Chip label="Not Created" color="default" size="small" variant="outlined" />;
      }
    },
  ];
 
  useEffect(() => {
    // Fetch purchase RFQs on mount and when page/rowsPerPage changes
    fetchPurchaseRFQs();
    // eslint-disable-next-line
  }, [page, rowsPerPage, fromDate, toDate]);
  
  useEffect(() => {
    loadSalesRFQs();
  }, [purchaseRFQs, page, rowsPerPage, fromDate, toDate]);
  
  // Fetch all purchase RFQs to check which sales RFQs have associated purchase RFQs
  const fetchPurchaseRFQs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};

      // We need to fetch from the Purchase RFQ endpoint
      const response = await axios.get(`${APIBASEURL}/purchase-rfq`, {
        headers,
      });

      if (response.data && response.data.data) {
        const purchaseRFQSourceIds = response.data.data
          .filter(rfq => rfq.SalesRFQID)
          .map(rfq => rfq.SalesRFQID);
        
        // Convert IDs to numbers for consistent comparison
        const numericSourceIds = purchaseRFQSourceIds.map(id => Number(id));
        
        setPurchaseRFQs(numericSourceIds);
      }
    } catch (error) {
      console.error("Error fetching purchase RFQs:", error);
    }
  };

  const loadSalesRFQs = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).format("YYYY-MM-DD")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).format("YYYY-MM-DD")
        : null;

      const response = await fetchSalesRFQs(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const salesRFQs = response.data || [];
      // console.log("Sales RFQs loaded:", salesRFQs);

      const mappedRows = salesRFQs.map((salesRFQ) => {
        const salesRFQId = Number(salesRFQ.SalesRFQID);
        const hasPurchaseRFQ = purchaseRFQs.includes(salesRFQId);
        
        return {
          id: salesRFQId,
          series: salesRFQ.Series || "N/A",
          customerName: salesRFQ.CustomerName || "N/A",
          supplierName: salesRFQ.SupplierName || "N/A",
          status: salesRFQ.Status || "Pending", 
          hasPurchaseRFQ: hasPurchaseRFQ,
          isEditable: !hasPurchaseRFQ,
          isDeletable: !hasPurchaseRFQ
        };
      });

      setRows(mappedRows);
      setTotalRows(response.totalRecords || salesRFQs.length);
    } catch (error) {
      console.error("Error loading SalesRFQs:", error);
      toast.error("Failed to load SalesRFQs");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreate = () => {
    navigate("/sales-rfq/create");
  };

  const handleRowClick = (id) => {
    navigate(`/sales-rfq/edit/${id}`);
  };

  const handleEdit = (id) => {
    const row = rows.find(r => r.id === id);
    if (row && !row.isEditable) {
      toast.warning("Cannot edit this Sales RFQ because a Purchase RFQ exists for it");
      return;
    }
    navigate(`/sales-rfq/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/sales-rfq/view/${id}?view=true`);
  };

  const handleDeleteClick = (id) => {
    const item = rows.find((row) => row.id === id);
    if (!item) {
      toast.error("Item not found");
      return;
    }
    
    if (!item.isDeletable) {
      toast.warning("Cannot delete this Sales RFQ because a Purchase RFQ exists for it");
      return;
    }
    
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteSalesRFQ(itemToDelete.id);
      // toast.success("SalesRFQ deleted successfully");
      showToast("SalesRFQ deleted successfully", "success");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSalesRFQs();
    } catch (error) {
      toast.error("Failed to delete SalesRFQ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Implement search functionality here
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Inquiry Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Inquiries..."
          />
          <Tooltip title="Add New Inquiry" arrow>
            <IconButton
              color="primary"
              onClick={handleCreate}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                height: 40,
                width: 40,
                ml: 1,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={(params) => handleRowClick(params.id)}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
        getRowClassName={(params) => 
          !params.row.isEditable ? 'disabled-row' : ''
        }
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Sales RFQ"
        message={`Are you sure you want to delete the Sales RFQ: ${itemToDelete?.series}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </Box>
  );
};

export default SalesRFQList;
