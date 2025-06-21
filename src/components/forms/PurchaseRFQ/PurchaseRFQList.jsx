import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import { showToast } from "../../toastNotification";
import axios from "axios";
import PurchaseRFQForm from "./PurchaseRFQForm";
import { Chip } from "@mui/material";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const fetchPurchaseRFQs = async (
  page = 1,
  pageSize = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : {};

    let url = `${APIBASEURL}/purchase-rfq?pageNumber=${page}&pageSize=${pageSize}`;
    
    if (fromDate) {
      url += `&fromDate=${fromDate}`;
    }

    if (toDate) {
      url += `&toDate=${toDate}`;
    }

    const response = await axios.get(url, { headers });
    console.log("Raw API response for PurchaseRFQs:", response.data);

    if (response.data && response.data.data) {
      // Make sure each item has a Status field and proper ID
      const processedData = response.data.data.map((item) => ({
        ...item,
        id: item.PurchaseRFQID || item.id,
        Status: item.Status || item.status || "Pending",
        Series: item.Series
          ? item.Series.replace("Pur-RFQ", "Quot-Request")
          : item.Series || "N/A",
      }));

      return {
        data: processedData,
        totalRecords: response.data.totalRecords || processedData.length,
      };
    }

    return { data: [], totalRecords: 0 };
  } catch (error) {
    console.error("Error fetching PurchaseRFQs:", error);
    throw error;
  }
};

const PurchaseRFQList = () => {
  const [purchaseRFQs, setPurchaseRFQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const columns = [
    // { field: "Series", headerName: "Series", flex: 1 },
    {
      field: "CustomerName",
      headerName: "Customer",
      flex: 1,
      valueGetter: (params) => params.row.CustomerName || "-",
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value || "Pending";
        let color = "default";

        if (status === "Approved") color = "success";
        else if (status === "Rejected") color = "error";
        else if (status === "Pending") color = "warning";

        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const loadPurchaseRFQs = async () => {
      try {
        setLoading(true);
        const { data, totalRecords } = await fetchPurchaseRFQs(
          page + 1,
          rowsPerPage,
          null,
          null
        );
        setPurchaseRFQs(data);
        setTotalRows(totalRecords);
      } catch (error) {
        toast.error("Failed to load Purchase RFQs");
        setPurchaseRFQs([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseRFQs();
  }, [page, rowsPerPage]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleView = (id) => {
    console.log("View clicked for Purchase RFQ ID:", id);
    if (id && id !== "undefined") {
      navigate(`/purchase-rfq/view/${id}`);
    } else {
      console.error("Invalid Purchase RFQ ID:", id);
      toast.error("Cannot view Purchase RFQ: Invalid ID");
    }
  };

  const handleDeleteClick = (id) => {
    const item = purchaseRFQs.find((row) => row.id === id);
    if (item) {
      setItemToDelete(item);
      setSelectedRFQ(id);
      setDeleteDialogOpen(true);
    } else {
      toast.error("Item not found");
    }
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedRFQ(null);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { headers } = getHeaders();
      await axios.delete(`${APIBASEURL}/purchase-rfq/${selectedRFQ}`, {
        headers,
      });
      showToast("Purchase RFQ deleted successfully", "success");
      setDeleteDialogOpen(false);
      const { data, totalRecords } = await fetchPurchaseRFQs(
        page + 1,
        rowsPerPage,
        null,
        null
      );
      setPurchaseRFQs(data);
      setTotalRows(totalRecords);
    } catch (error) {
      console.error("Error deleting Purchase RFQ:", error);
      toast.error("Failed to delete Purchase RFQ");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
    // Note: Search functionality would require additional API support
    // You may need to modify fetchPurchaseRFQs to include searchTerm
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
        <Typography variant="h5">Quotation Request Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Quotation Requests..."
          />
        </Stack>
      </Box>

      <DataTable
        rows={purchaseRFQs.map((row) => ({
          ...row,
          id: row.PurchaseRFQID || row.id,
        }))}
        columns={[
          ...columns,
          {
            field: "PurchaseRFQID",
            headerName: "Purchase RFQ ID",
            width: 100,
            valueGetter: (params) =>
              params.row.PurchaseRFQID || params.row.id || "No ID",
          },
        ]}
        loading={loading}
        getRowId={(row) => {
          console.log("DataTable getRowId called with row:", row);
          return row.id || "unknown";
        }}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onDelete={handleDeleteClick}
      />

      <Dialog
        open={viewDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>View Purchase RFQ</DialogTitle>
        <DialogContent>
          {selectedRFQ && (
            <PurchaseRFQForm
              purchaseRFQId={selectedRFQ}
              onClose={handleDialogClose}
              readOnly={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Purchase RFQ? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseRFQList;