import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Stack, 
  Tooltip, 
  IconButton
} from '@mui/material';
import DataTable from '../../Common/DataTable';
import FormRoleModal from './FormRoleModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { fetchFormRoles, deleteFormRole } from './FormRoleAPI';
import { toast } from 'react-toastify';
import { Add } from '@mui/icons-material';
import SearchBar from "../../Common/SearchBar";

const FormRoleList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormRoleID, setSelectedFormRoleID] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "formName", headerName: "Form", flex: 1 },
    { field: "roleName", headerName: "Role", flex: 1 },
    { 
      field: "readOnly", 
      headerName: "Read Only", 
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.value ? "Yes" : "No"}</Typography>
      )
    },
    { 
      field: "write", 
      headerName: "Write", 
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.value ? "Yes" : "No"}</Typography>
      )
    }
  ];

  const loadFormRoles = async () => {
    try {
      setLoading(true);
      
      const response = await fetchFormRoles(
        page + 1,
        rowsPerPage,
        searchTerm
      );
      
      const formRoles = response.data || [];
      const totalCount = response.pagination?.totalRecords || formRoles.length;
      
      const formattedRows = formRoles.map((formRole) => ({
        id: formRole.FormRoleID,
        formName: formRole.FormName || "N/A",
        roleName: formRole.RoleName || "N/A",
        formId: formRole.FormID,
        roleId: formRole.RoleID,
        readOnly: formRole.ReadOnly || false,
        write: formRole.Write || false
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading form roles:', error);
      toast.error('Failed to load form roles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormRoles();
  }, [page, rowsPerPage, searchTerm]);

  const handleCreate = () => {
    setSelectedFormRoleID(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedFormRoleID(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const formRole = rows.find(row => row.id === id);
    setItemToDelete(formRole);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFormRole(itemToDelete.id);
      toast.success('Form Role deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadFormRoles();
    } catch (error) {
      toast.error('Failed to delete form role: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadFormRoles();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFormRoleID(null);
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
        <Typography variant="h5">Form Role Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Form Roles..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Form Role">
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
        emptyMessage="No form roles found"
      />

      <FormRoleModal
        open={modalOpen}
        onClose={handleModalClose}
        formRoleID={selectedFormRoleID}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete this form role?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default FormRoleList;