import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Stack, 
  Tooltip, 
  IconButton
} from '@mui/material';
import DataTable from '../../Common/DataTable';
import FormModal from './FormModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { fetchForms, deleteForm } from './FormAPI';
import { toast } from 'react-toastify';
import { Add } from '@mui/icons-material';
import SearchBar from "../../Common/SearchBar";

const FormList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormID, setSelectedFormID] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "formName", headerName: "Form Name", flex: 1 },
    { 
      field: "createdDateTime", 
      headerName: "Created Date", 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        const date = new Date(params.value);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    }
  ];

  const loadForms = async () => {
    try {
      setLoading(true);
      
      const response = await fetchForms(
        page + 1,
        rowsPerPage,
        searchTerm
      );
      
      const forms = response.data || [];
      const totalCount = response.pagination?.totalRecords || forms.length;
      
      const formattedRows = forms.map((form) => ({
        id: form.FormID,
        formName: form.FormName || "N/A",
        createdDateTime: form.CreatedDateTime,
        rowVersion: form.RowVersionColumn
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading forms:', error);
      console.log('Failed to load forms: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [page, rowsPerPage, searchTerm]);

  const handleCreate = () => {
    setSelectedFormID(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedFormID(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const form = rows.find(row => row.id === id);
    setItemToDelete(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteForm(itemToDelete.id);
      toast.success('Form deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadForms();
    } catch (error) {
      console.log('Failed to delete form: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadForms();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFormID(null);
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
        <Typography variant="h5">Form Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Form">
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
        emptyMessage="No forms found"
      />

      <FormModal
        open={modalOpen}
        onClose={handleModalClose}
        formID={selectedFormID}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete the form "${itemToDelete?.formName}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default FormList;