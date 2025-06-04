import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack, Tooltip, IconButton } from '@mui/material';
import DataTable from '../../Common/DataTable';
import ProjectParameterModal from './ProjectParameterModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { getProjectParameters, deleteProjectParameter } from './projectParameterStorage';
import { Add } from "@mui/icons-material";
import SearchBar from "../../Common/SearchBar";
import { toast } from 'react-toastify';

const ProjectParameterList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParameterId, setSelectedParameterId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const parameters = getProjectParameters();
    const formattedRows = parameters.map(param => ({
      id: param.id,
      parameterName: param.parameterName || '',
      parameterValue: param.parameterValue || ''
    }));
    setRows(formattedRows);
  }, []);

  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteProjectParameter(itemToDelete.id);
    const parameters = getProjectParameters();
    const formattedRows = parameters.map(param => ({
      id: param.id,
      parameterName: param.parameterName || '',
      parameterValue: param.parameterValue || ''
    }));
    toast.success("Parameter deleted successfully")
    setRows(formattedRows);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: 'parameterName', label: 'Parameter Name', align: 'center' },
    { id: 'parameterValue', label: 'Parameter Value', align: 'center' }
  ];

  const handleEdit = (row) => {
    setSelectedParameterId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedParameterId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedParameterId(null);
  };

  const handleSave = () => {
    const parameters = getProjectParameters();
    const formattedRows = parameters.map(param => ({
      id: param.id,
      parameterName: param.parameterName || '',
      parameterValue: param.parameterValue || ''
    }));
    setRows(formattedRows);
    setModalOpen(false);
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
          mb: 3,
        }}
      >
        <Typography variant="h5">Project Parameter Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Project Parameters..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Project Parameters">
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

      <ProjectParameterModal
        open={modalOpen}
        onClose={handleModalClose}
        parameterId={selectedParameterId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={
          itemToDelete
            ? `Are you sure you want to delete parameter ${itemToDelete.parameterName}?`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default ProjectParameterList;