import React, { useState, useEffect } from "react";
import { Typography, Box, Stack, Tooltip, IconButton } from "@mui/material";
import DataTable from "../../Common/DataTable";
import SubscriptionModal from "./SubscriptionModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { getSubscriptions, deleteSubscription } from "./subscriptionStorage";
import SearchBar from "../../Common/SearchBar";
import { Add } from "@mui/icons-material";
import { showToast } from "../../toastNotification";
import { toast } from "react-toastify";

const SubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const updateRows = () => {
    const subscriptions = getSubscriptions();
    const filteredRows = subscriptions
      .filter(sub =>
        (sub.planName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(sub => ({
        id: Number(sub.id),
        planName: sub.planName || '',
        description: sub.description || '',
        fees: sub.fees || '',
        billingType: sub.billingType || ''
      }));
    console.log('Formatted rows:', filteredRows);
    setRows(filteredRows);
  };

  useEffect(() => {
    updateRows();
  }, [searchTerm]);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteSubscription(Number(itemToDelete.id));
    toast.success("Subscription plan deleted successfully");
    updateRows();
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: "planName", label: "Plan Name", align: "center" },
    { id: "description", label: "Description", align: "center" },
    { id: "fees", label: "Fees", align: "center" },
    { id: "billingType", label: "Billing Type", align: "center" },
  ];

  const handleEdit = (row) => {
    console.log('Editing row:', row);
    if (!row || typeof row !== 'object' || !row.id) {
      console.error('Invalid row or row.id:', row);
      return;
    }
    setSelectedSubscriptionId(Number(row.id));
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
    updateRows();
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
          <Tooltip title="Add Subscriptions">
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
        totalRows={rows.length}
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
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default SubscriptionList;