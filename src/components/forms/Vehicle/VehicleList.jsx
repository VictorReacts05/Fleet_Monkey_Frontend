import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import DataTable from "../../Common/DataTable";
import VehicleModal from "./VehicleModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { getVehicles, deleteVehicle } from "./vehicleStorage";
import { getCompanies } from "../Company/companyStorage";

const VehicleList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    setRows(getVehicles());
  }, []);

  const handleDelete = (row) => {
    console.log("handleDelete called with row:", row); // Debug
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) {
      console.log("No item to delete"); // Debug
      return;
    }
    console.log("Deleting vehicle:", itemToDelete.id); // Debug
    deleteVehicle(itemToDelete.id);
    setRows(getVehicles());
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    console.log("Cancel delete"); // Debug
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns = [
    { id: "numberPlate", label: "Number Plate", align: "center" },
    { id: "vin", label: "VIN", align: "center" },
    { id: "companyId", label: "Company", align: "center" },
    { id: "companyId2", label: "Company 2", align: "center" },
  ];

  const handleEdit = (row) => {
    setSelectedVehicleId(row.id);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedVehicleId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedVehicleId(null);
  };

  const handleSave = () => {
    const vehicles = getVehicles();
    const companies = getCompanies();
    const mappedRows = vehicles.map((vehicle) => ({
      ...vehicle,
      companyId:
        companies.find((c) => c.id === Number(vehicle.companyId))
          ?.companyName || "",
      companyId2:
        companies.find((c) => c.id === Number(vehicle.companyId2))
          ?.companyName || "",
    }));
    setRows(mappedRows);
    setModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Vehicle Management</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New
        </Button>
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

      <VehicleModal
        open={modalOpen}
        onClose={handleModalClose}
        vehicleId={selectedVehicleId}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={
          itemToDelete
            ? `Are you sure you want to delete vehicle ${
                itemToDelete.vehicleName || itemToDelete.id
              }?`
            : "Are you sure you want to delete this vehicle?"
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export default VehicleList;
