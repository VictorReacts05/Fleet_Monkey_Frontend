import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import CountryModal from "./CountryModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchCountries, deleteCountry } from "./CountryAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import StyledButton from "../../Common/StyledButton";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from "../../Common/SearchBar";
import { showToast } from "../../toastNotification";


const CountryList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "countryName", headerName: "Country Name", flex: 1 },
  ];

  const loadCountries = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      // Get current page data
      const response = await fetchCountries(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const countries = response.data || [];

      // Get total count from backend if available
      let totalCount = response.pagination?.totalRecords;

      // If backend doesn't provide total count
      if (totalCount === undefined) {
        try {
          // Use the maximum of current rowsPerPage * 5 as a dynamic limit
          const dynamicLimit = Math.max(rowsPerPage * 5, 20);
          const countResponse = await fetchCountries(
            1,
            dynamicLimit,
            formattedFromDate,
            formattedToDate
          );

          totalCount = countResponse.data?.length || 0;

          // If we got exactly the dynamic limit of records, there might be more
          if (countResponse.data?.length === dynamicLimit) {
            // Add a small buffer to indicate there might be more
            totalCount += rowsPerPage;
          }
        } catch (err) {
          // Fallback: estimate based on current page
          const hasFullPage = countries.length === rowsPerPage;
          totalCount = page * rowsPerPage + countries.length;

          // If we have a full page, there might be more
          if (hasFullPage) {
            totalCount += rowsPerPage; // Add one more page worth to enable next page
          }
        }
      }

      const formattedRows = countries.map((country) => ({
        id: country.CountryOfOriginID,
        countryName: country.CountryOfOrigin || "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading countries:", error);
      console.log("Failed to load countries: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedCountryId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCountryId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const country = rows.find((row) => row.id === id);
    setItemToDelete(country);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCountry(itemToDelete.id);
      toast.success("Country deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadCountries();
    } catch (error) {
      console.log("Failed to delete country: " + error.message);
    }
  };

  const handleSave = () => {
    loadCountries();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCountryId(null);
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
        <Typography variant="h5">Country Management</Typography>
        <Stack direction="row" spacing={1}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search Text..."
          sx={{
            width: "100%",
            marginLeft: "auto",
          }}
        />
          <Tooltip title="Add Country">
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

      <CountryModal
        open={modalOpen}
        onClose={handleModalClose}
        countryId={selectedCountryId}
        onSave={handleSave}
        initialData={rows.find((row) => row.id === selectedCountryId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={<>Are you sure you want to delete country <strong>{itemToDelete?.countryName}</strong> ?</>}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default CountryList;
