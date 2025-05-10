import React, { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import { fetchRoles, updateRole } from "./RolesAPI";
import { toast } from "react-toastify";
import SearchBar from "../../Common/SearchBar";
import FormCheckbox from "../../Common/FormCheckbox";

const RolesList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "roleName", headerName: "Role Name", flex: 1 },
    {
      field: "readAccess",
      headerName: "Read",
      width: 120,
      renderCell: (params) => {
        console.log("Rendering ReadAccess for row:", params); // Debug log
        return (
          <FormCheckbox
            checked={params.value || false}
            onChange={(e) =>
              handleAccessChange(params.row.id, "ReadAccess", e.target.checked)
            }
            name="readAccess"
            disabled={false}
          />
        );
      },
    },
    {
      field: "writeAccess",
      headerName: "Write",
      width: 120,
      renderCell: (params) => {
        console.log("Rendering WriteAccess for row:", params); // Debug log
        return (
          <FormCheckbox
            checked={params.value || false}
            onChange={(e) =>
              handleAccessChange(params.row.id, "WriteAccess", e.target.checked)
            }
            name="writeAccess"
            disabled={false}
          />
        );
      },
    },
  ];

  const loadRoles = async () => {
    try {
      setLoading(true);

      const response = await fetchRoles(page + 1, rowsPerPage);

      const roles = response.data || [];
      const totalCount = response.pagination?.totalRecords || roles.length;

      const formattedRows = roles.map((role) => ({
        id: role.RoleID,
        roleName: role.RoleName || "N/A",
        readAccess: role.ReadAccess === "-" ? false : role.ReadAccess || false, // Transform "-" to false
        writeAccess:
          role.WriteAccess === "-" ? false : role.WriteAccess || false, // Transform "-" to false
        rowVersion: role.RowVersionColumn,
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Failed to load roles: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page, rowsPerPage]);

  const handleAccessChange = async (id, accessType, value) => {
    try {
      const role = rows.find((row) => row.id === id);
      if (!role) return;

      const updatedRole = {
        ...role,
        RoleName: role.roleName,
        ReadAccess: accessType === "ReadAccess" ? value : role.readAccess,
        WriteAccess: accessType === "WriteAccess" ? value : role.writeAccess,
        RowVersionColumn: role.rowVersion,
      };

      await updateRole(id, updatedRole);
      toast.success(
        `${accessType.replace("Access", "")} access updated successfully`
      );
      loadRoles();
    } catch (error) {
      toast.error("Failed to update access: " + error.message);
    }
  };

  const handleCreate = () => {
    setSelectedRoleId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedRoleId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const role = rows.find((row) => row.id === id);
    setItemToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRole(itemToDelete.id);
      toast.success("Role deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadRoles();
    } catch (error) {
      toast.error("Failed to delete role: " + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadRoles();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRoleId(null);
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
        <Typography variant="h5">Role Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar onSearch={handleSearch} placeholder="Search roles..." />
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
        loading={loading}
        emptyMessage="No roles found"
        hideActions={true}
      />
    </Box>
  );
};

export default RolesList;
