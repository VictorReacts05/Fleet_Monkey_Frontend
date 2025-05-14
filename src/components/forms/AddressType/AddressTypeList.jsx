import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton, Stack, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import DataTable from "../../Common/DataTable";
import AddressTypeModal from "./AddressTypeModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import SearchBar from "../../Common/SearchBar";
import { fetchAddressTypes, deleteAddressType } from "./AddressTypeAPI";
import { showToast } from "../../toastNotification";

const AddressTypeList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddressTypeId, setSelectedAddressTypeId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "addressType", headerName: "Address Type", flex: 1 },
  ];

  const loadAddressTypes = async () => {
    try {
      setLoading(true);

      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchAddressTypes(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate,
        searchTerm
      );

      const addressTypes = response.data || [];
      const totalCount = response.totalRecords || 0;

      const formattedRows = addressTypes.map((addressType, i) => ({
        id: addressType.AddressTypeID,
        addressType: addressType.AddressType || "N/A",
        serialNumber: page * rowsPerPage + i + 1,
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading address types:", error);
      toast.error("Failed to load address types: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddressTypes();
  }, [page, rowsPerPage, fromDate, toDate, searchTerm]);

  const handleCreate = () => {
    setSelectedAddressTypeId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedAddressTypeId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const addressType = rows.find((row) => row.id === id);
    setItemToDelete(addressType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAddressType(itemToDelete.id);
      showToast("Address type deleted successfully","success");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadAddressTypes();
    } catch (error) {
      toast.error("Failed to delete address type: " + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadAddressTypes();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAddressTypeId(null);
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
        <Typography variant="h5">Address Type Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Address Types..."
          />
          <Tooltip title="Add Address Type">
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
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddressTypeModal
        open={modalOpen}
        onClose={handleModalClose}
        addressTypeId={selectedAddressTypeId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete address type ${itemToDelete?.addressType}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default AddressTypeList;
