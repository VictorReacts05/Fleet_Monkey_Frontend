import React, { useState, useEffect } from 'react';
import { Typography, Box, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import SupplierModal from './SupplierModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import { fetchSuppliers, deleteSupplier } from './SupplierAPI';
import { toast } from 'react-toastify';
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from "../../Common/SearchBar";

const SupplierList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");  
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  
  const columns = [
    { field: "supplierName", headerName: "Supplier Name", flex: 1 },
    { field: "supplierEmail", headerName: "Supplier Email", flex: 1 },
  ];

const loadSuppliers = async () => {
  try {
    setLoading(true);

    const formattedFromDate = fromDate
      ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
      : null;
    const formattedToDate = toDate
      ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
      : null;

    const validPage = Number.isInteger(page) ? page + 1 : 1;
    const validRowsPerPage = Number.isInteger(rowsPerPage) ? rowsPerPage : 10;

    console.log("Fetching suppliers with:", {
      validPage,
      validRowsPerPage,
      formattedFromDate,
      formattedToDate,
      searchTerm,
    });

    const response = await fetchSuppliers(
      validPage,
      validRowsPerPage,
      formattedFromDate,
      formattedToDate,
      searchTerm
    );

    const suppliers = response.data || [];
    const totalCount = response.totalRecords || suppliers.length;

    const formattedRows = suppliers.map((supplier, i) => ({
      id: supplier.SupplierID,
      serialNumber: (Number.isInteger(page) ? page : 0) * rowsPerPage + i + 1,

      supplierName: supplier.SupplierName || "N/A",
      supplierEmail: supplier.SupplierEmail || "N/A",
    }));

    setRows(formattedRows);
    setTotalRows(totalCount);
  } catch (error) {
    console.error("Error loading suppliers:", error);
    toast.error("Failed to load suppliers: " + error.message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  console.log("useEffect triggered with page:", page);
  loadSuppliers();
}, [page, rowsPerPage, fromDate, toDate, searchTerm]);

  const handleCreate = () => {
    setSelectedSupplierId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedSupplierId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const supplier = rows.find(row => row.id === id);
    setItemToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSupplier(itemToDelete.id);
      toast.success('Supplier deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier: ' + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadSuppliers();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSupplierId(null);
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
        <Typography variant="h5">Supplier Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Suppliers..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Supplier">
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
        onPageChange={(...args) => {
  const newPage = args.length === 2 ? args[1] : args[0];
  setPage(Number.isInteger(newPage) ? newPage : 0);
}}

        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <SupplierModal
        open={modalOpen}
        onClose={handleModalClose}
        supplierId={selectedSupplierId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete supplier ${itemToDelete?.supplierName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default SupplierList;
