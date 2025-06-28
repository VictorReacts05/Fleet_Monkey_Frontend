import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import DataTable from "../../common/DataTable";
import VehicleModal from "./VehicleModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import FormDatePicker from "../../common/FormDatePicker";
import { fetchVehicles, deleteVehicle } from "./VehicleAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from '@mui/icons-material';
import { Tooltip, IconButton } from '@mui/material';
import SearchBar from "../../common/SearchBar";
import { showToast } from "../../toastNotification";

const VehicleList = (props) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "truckNumberPlate", headerName: "Truck Number Plate", flex: 1 },
    { field: "vin", headerName: "VIN", flex: 1 },
    { field: "companyName", headerName: "Company", flex: 1 },
    { field: "maxWeight", headerName: "Max Weight (kg)", flex: 1 },
    { field: "length", headerName: "Length (m)", flex: 1 },
    { field: "width", headerName: "Width (m)", flex: 1 },
    { field: "height", headerName: "Height (m)", flex: 1 },
    // { field: "vehicleTypeName", headerName: "Vehicle Type", flex: 1 },
  ];

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      const formattedToDate = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
      
      const response = await fetchVehicles(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
      
      const vehicles = response.data || [];
      const totalCount = response.pagination?.totalRecords || vehicles.length;
      
      const formattedRows = vehicles.map((vehicle) => ({
        id: vehicle.VehicleID,
        truckNumberPlate: vehicle.TruckNumberPlate || "-",
        vin: vehicle.VIN || "-",
        companyName: vehicle.CompanyName || "-",
        companyId: vehicle.CompanyID,
        maxWeight: vehicle.MaxWeight ? parseFloat(vehicle.MaxWeight).toFixed(2) : "-",
        length: vehicle.Length ? parseFloat(vehicle.Length).toFixed(2) : "-",
        width: vehicle.Width ? parseFloat(vehicle.Width).toFixed(2) : "-",
        height: vehicle.Height ? parseFloat(vehicle.Height).toFixed(2) : "-",
        // vehicleTypeName: vehicle.VehicleTypeName || "N/A",
        // vehicleTypeId: vehicle.VehicleTypeID,
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      console.log('Failed to load vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all vehicles (first page, large limit) and log the full data for debugging
    const fetchAndLogAllVehicles = async () => {
      try {
        const response = await fetchVehicles(1, 1000); // Adjust limit as needed
        console.log("All vehicles fetched on mount:", response);
      } catch (error) {
        console.error("Error fetching all vehicles on mount:", error);
      }
    };
    fetchAndLogAllVehicles();
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedVehicleId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedVehicleId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const vehicle = rows.find(row => row.id === id);
    setItemToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicle(itemToDelete.id);
      toast.success('Vehicle deleted successfully');
      // showToast("Vehicle deleted successfully", "success");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadVehicles();
    } catch (error) {
      console.log('Failed to delete vehicle: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadVehicles();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedVehicleId(null);
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
        <Typography variant="h5">Vehicle Management</Typography>
        <Stack direction="row" spacing={1}>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Vehicle">
            <IconButton
              onClick={handleCreate}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                height: 40,
                width: 40,
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
          const newRowsPerPage = parseInt(e.target.value, 10);
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <VehicleModal
        open={modalOpen}
        onClose={handleModalClose}
        vehicleId={selectedVehicleId}
        onSave={handleSave}
        initialData={rows.find((row) => row.id === selectedVehicleId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={<>Are you sure you want to delete vehicle <strong>{
          itemToDelete?.truckNumberPlate || ""
        }</strong> ?</>}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default VehicleList;
