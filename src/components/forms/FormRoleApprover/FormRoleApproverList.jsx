import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Stack, 
  Tooltip, 
  IconButton,
  Chip
} from '@mui/material';
import DataTable from '../../Common/DataTable';
import FormRoleApproverModal from './FormRoleApproverModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { fetchFormRoleApprovers, deleteFormRoleApprover } from './FormRoleApproverAPI';
import { toast } from 'react-toastify';
import { Add } from '@mui/icons-material';
import SearchBar from "../../Common/SearchBar";

const FormRoleApproverList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApproverID, setSelectedApproverID] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "roleName", headerName: "Form Role", flex: 1 },
    { field: "personName", headerName: "Person", flex: 1 }
  ];

  const loadApprovers = async () => {
    try {
      setLoading(true);
      
      const response = await fetchFormRoleApprovers(
        page + 1,
        rowsPerPage,
        searchTerm
      );
      
      const approvers = response.data || [];
      const totalCount = response.pagination?.totalRecords || approvers.length;
      
      const formattedRows = approvers.map((approver) => ({
        id: approver.FormRoleApproverID,
        roleName: approver.RoleName || "N/A",
        personName: `${approver.FirstName || ''} ${approver.LastName || ''}`.trim() || "N/A",
        activeYN: approver.ActiveYN === true || approver.ActiveYN === 1,
        formRoleID: approver.FormRoleID,
        userID: approver.UserID, // This is actually PersonID
        rowVersion: approver.RowVersionColumn
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading form role approvers:', error);
      console.log('Failed to load form role approvers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovers();
  }, [page, rowsPerPage, searchTerm]);

  const handleCreate = () => {
    setSelectedApproverID(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedApproverID(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const approver = rows.find(row => row.id === id);
    setItemToDelete(approver);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFormRoleApprover(itemToDelete.id);
      toast.success('Form Role Approver deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadApprovers();
    } catch (error) {
      console.log('Failed to delete form role approver: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadApprovers();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedApproverID(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0);
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
        <Typography variant="h5">Form Role Approver Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Form Role Approver">
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
        totalRows={totalRows}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No form role approvers found"
      />

      <FormRoleApproverModal
        open={modalOpen}
        onClose={handleModalClose}
        approverID={selectedApproverID}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete this form role approver?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default FormRoleApproverList;