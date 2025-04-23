import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import DataTable from "../../Common/DataTable";
import PersonModal from "./PersonModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { getPersons, deletePerson } from "./personStorage";
import { getCompanies } from "../Company/companyStorage";
import { Add } from '@mui/icons-material';
import { Tooltip, IconButton, Stack } from '@mui/material';
import FormDatePicker from "../../Common/FormDatePicker";

const PersonList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Load persons and map with company names on component mount
  useEffect(() => {
    const persons = getPersons();
    const companies = getCompanies();

    const mappedRows = persons.map((person) => ({
      ...person,
      companyName:
        companies.find((c) => c.id === parseInt(person.companyId))
          ?.companyName || "",
    }));

    setRows(mappedRows);
  }, []);

  // Handle delete action by opening confirmation dialog
  const handleDelete = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion and refresh the list
  const confirmDelete = () => {
    if (!itemToDelete) return;
    deletePerson(itemToDelete.id);

    // Refresh the list with updated company names
    const persons = getPersons();
    const companies = getCompanies();
    const mappedRows = persons.map((person) => ({
      ...person,
      companyName:
        companies.find((c) => c.id === parseInt(person.companyId))
          ?.companyName || "",
    }));
    setRows(mappedRows);

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: "firstName", label: "First Name", align: "center" },
    { id: "lastName", label: "Last Name", align: "center" },
    { id: "role", label: "Role", align: "center" },
    { id: "designation", label: "Designation", align: "center" },
    { id: "companyName", label: "Company", align: "center" },
  ];

  // Handle edit action by opening modal with selected person
  const handleEdit = (row) => {
    setSelectedPersonId(row.id);
    setModalOpen(true);
  };

  // Handle create action by opening modal without a selected person
  const handleCreate = () => {
    setSelectedPersonId(null);
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPersonId(null);
  };

  // Handle save action (after create/edit) and refresh the list
  const handleSave = () => {
    const persons = getPersons();
    const companies = getCompanies();
    const mappedRows = persons.map((person) => ({
      ...person,
      companyName:
        companies.find((c) => c.id === parseInt(person.companyId))
          ?.companyName || "",
    }));
    setRows(mappedRows);
    setModalOpen(false);
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
        <Typography variant="h5">Person Management</Typography>
        <Stack direction="row" spacing={1}>
          <FormDatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            sx={{ width: 200 }}
          />
          <FormDatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            sx={{ width: 200 }}
          />
          <Tooltip title="Add Person">
            <IconButton
              onClick={handleCreate}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                height: 56,
                width: 56,
                ml: 1,
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

      <PersonModal
        open={modalOpen}
        onClose={handleModalClose}
        personId={selectedPersonId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={
          itemToDelete
            ? `Are you sure you want to delete ${itemToDelete.firstName} ${itemToDelete.lastName}?`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default PersonList;
