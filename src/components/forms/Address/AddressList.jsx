import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton, Stack, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import DataTable from "../../common/DataTable";
import AddressModal from "./AddressModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import SearchBar from "../../common/SearchBar";
import { fetchAddresses, deleteAddress } from "./AddressAPI";

const AddressList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "addressName", headerName: "Address Name", flex: 1 },
    { field: "addressType", headerName: "Address Type", flex: 1 },
    { field: "addressLine1", headerName: "Address Line 1", flex: 1 },
    { field: "addressLine2", headerName: "Address Line 2", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "country", headerName: "Country", flex: 1 },
  ];

  const loadAddresses = async () => {
    try {
      setLoading(true);

      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchAddresses(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate,
        searchTerm
      );

      const addresses = response.data || [];
      const totalCount = response.totalRecords || 0;

      console.log("Fetched addresses:", addresses);

      const formattedRows = addresses.map((address, i) => ({
        id: address.AddressID,
        serialNumber: page * rowsPerPage + i + 1,
        addressName: address.AddressName || "-",
        addressType: address.AddressType || "-", // Use AddressType directly
        addressLine1: address.AddressLine1 || "-",
        addressLine2: address.AddressLine2 || "-",
        city: address.City || "-", // CityID, needs name resolution
        country: address.Country || "-", // CountryID, needs name resolution
      }));

      console.log("Formatted rows:", formattedRows);

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error(
        `Failed to load addresses: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [page, rowsPerPage, fromDate, toDate, searchTerm]);

  const handleCreate = () => {
    setSelectedAddressId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedAddressId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const address = rows.find((row) => row.id === id);
    setItemToDelete(address);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAddress(itemToDelete.id);
      toast.success("Address deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(
        `Failed to delete address: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadAddresses();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAddressId(null);
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
        <Typography variant="h5">Address Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Addresses..."
          />
          <Tooltip title="Add Address">
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

      <AddressModal
        open={modalOpen}
        onClose={handleModalClose}
        addressId={selectedAddressId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete address ${itemToDelete?.addressName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default AddressList;
