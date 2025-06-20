import React, { useState, useEffect } from "react";
import { Typography, Box, Stack, Tooltip, IconButton } from "@mui/material";
import DataTable from "../../Common/DataTable";
import SubscriptionModal from "./SubscriptionModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { fetchSubscriptionPlans, deleteSubscriptionPlan } from "./SubscriptionAPI";
import SearchBar from "../../Common/SearchBar";
import { Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";
import FormDatePicker from "../../Common/FormDatePicker";
import dayjs from "dayjs";

const SubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      const response = await fetchSubscriptionPlans(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const subscriptions = response.data || [];
      const totalCount = response.pagination?.totalRecords || subscriptions.length;
      
      const formattedRows = subscriptions.map((subscription) => ({
        id: subscription.SubscriptionPlanID,
        planName: subscription.SubscriptionPlanName || "-",
        description: subscription.Description || "-",
        fees: subscription.Fees ? parseFloat(subscription.Fees).toFixed(2) : "-",
        billingType: subscription.BillingFrequencyName || "-",
        billingFrequencyId: subscription.BillingFrequencyID,
        daysInFrequency: subscription.DaysInFrequency
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleDelete = (id) => {
    const subscription = rows.find(row => row.id === id);
    setItemToDelete(subscription);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSubscriptionPlan(itemToDelete.id);
      showToast("Subscription plan deleted successfully", "success");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription plan: ' + error.message);
    }
  };

  const columns = [
    { field: "planName", headerName: "Plan Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "fees", headerName: "Fees", flex: 1 },
    { field: "billingType", headerName: "Billing Type", flex: 1 },
  ];

  const handleEdit = (id) => {
    setSelectedSubscriptionId(id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSubscriptionId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSubscriptionId(null);
  };

  const handleSave = () => {
    loadSubscriptions();
    setModalOpen(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Subscription Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Subscriptions..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Subscription">
            <IconButton
              onClick={handleCreate}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                height: 40,
                width: 40,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <SubscriptionModal
        open={modalOpen}
        onClose={handleModalClose}
        subscriptionId={selectedSubscriptionId}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete subscription plan ${itemToDelete?.planName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default SubscriptionList;