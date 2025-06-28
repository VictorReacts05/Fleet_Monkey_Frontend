import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import WarehouseModal from "./WarehouseModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchWarehouses, deleteWarehouse } from "./WarehouseAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from "../../Common/SearchBar";

const WarehouseList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "warehouseName", headerName: "Warehouse Name", flex: 1 },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      renderCell: (params) => {
        const address = params.row.address;
        return address
          ? `${address.AddressLine1}, ${address.AddressLine2}`
          : "N/A";
      },
    },
  ];

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchWarehouses(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const warehouses = response.data || [];
      let totalCount = response.pagination?.totalRecords;

      if (totalCount === undefined) {
        try {
          const dynamicLimit = Math.max(rowsPerPage * 5, 20);
          const countResponse = await fetchWarehouses(
            1,
            dynamicLimit,
            formattedFromDate,
            formattedToDate
          );
          totalCount = countResponse.data?.length || 0;
          if (countResponse.data?.length === dynamicLimit) {
            totalCount += rowsPerPage;
          }
        } catch (err) {
          const hasFullPage = warehouses.length === rowsPerPage;
          totalCount = page * rowsPerPage + warehouses.length;
          if (hasFullPage) {
            totalCount += rowsPerPage;
          }
        }
      }

      const formattedRows = warehouses.map((warehouse) => ({
        id: warehouse.WarehouseID,
        warehouseName: warehouse.WarehouseName || "N/A",
        address: warehouse.Address || null,
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      toast.error("Failed to load warehouses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedWarehouseId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedWarehouseId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const warehouse = rows.find((row) => row.id === id);
    setItemToDelete(warehouse);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const personId = user?.personId || user?.id || user?.userId;
      await deleteWarehouse(itemToDelete.id, personId);
      toast.success("Warehouse deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadWarehouses();
    } catch (error) {
      toast.error("Failed to delete warehouse: " + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadWarehouses();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedWarehouseId(null);
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
        <Typography variant="h5">Warehouse Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={(term) => setPage(0)}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Warehouse">
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
          const newRowsPerPage = parseInt(e.target.value, 10);
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <WarehouseModal
        open={modalOpen}
        onClose={handleModalClose}
        warehouseId={selectedWarehouseId}
        onSave={handleSave}
        initialData={rows.find((row) => row.id === selectedWarehouseId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete warehouse ${itemToDelete?.warehouseName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default WarehouseList;
