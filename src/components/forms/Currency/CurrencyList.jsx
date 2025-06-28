import React, { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import CurrencyModal from "./CurrencyModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { fetchCurrencies, deleteCurrency } from "./CurrencyAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { connect } from "react-redux";
import SearchBar from "../../Common/SearchBar";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { showToast } from "../../toastNotification";

const CurrencyList = ({ userId }) => {
  console.log("Current userId from Redux:", userId);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "currencyName", headerName: "Currency Name", flex: 1 },
  ];

  const loadCurrencies = async () => {
    try {
      setLoading(true);

      const response = await fetchCurrencies(page + 1, rowsPerPage);

      const currencies = response.data || [];

      let totalCount = response.totalRecords;

      if (totalCount === undefined) {
        try {
          const dynamicLimit = Math.max(rowsPerPage * 5, 20);
          const countResponse = await fetchCurrencies(1, dynamicLimit);

          totalCount = countResponse.data?.length || 0;

          if (countResponse.data?.length === dynamicLimit) {
            totalCount += rowsPerPage;
          }
        } catch (err) {
          const hasFullPage = currencies.length === rowsPerPage;
          totalCount = page * rowsPerPage + currencies.length;

          if (hasFullPage) {
            totalCount += rowsPerPage;
          }
        }
      }

      const formattedRows = currencies.map((currency) => ({
        id: currency.CurrencyID,
        currencyName: currency.CurrencyName || "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading currencies:", error);
      console.log("Failed to load currencies: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, [page, rowsPerPage]);

  const handleCreate = () => {
    setSelectedCurrencyId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCurrencyId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const currency = rows.find((row) => row.id === id);
    setItemToDelete(currency);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);

      const deletedItemId = itemToDelete.id;
      setRows((prevRows) => prevRows.filter((row) => row.id !== deletedItemId));

      setDeleteDialogOpen(false);

      await deleteCurrency(deletedItemId, userId);
      toast.success("Currency deleted successfully");
    

      setItemToDelete(null);

      setTimeout(() => {
        loadCurrencies();
      }, 500);
    } catch (error) {
      console.error("Error deleting currency:", error);
      console.log(
        "Failed to delete currency: " + (error.message || "Unknown error")
      );

      loadCurrencies();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    loadCurrencies();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCurrencyId(null);
  };

  const handleSearch = (term) => {
    // Placeholder for search functionality
    console.log("Search term:", term);
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
        <Typography variant="h5">Currency Management</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Tooltip title="Add Currency">
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
          </Box>
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

      <CurrencyModal
        open={modalOpen}
        onClose={handleModalClose}
        currencyId={selectedCurrencyId}
        onSave={handleSave}
        initialData={rows.find((row) => row.id === selectedCurrencyId)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={<>Are you sure you want to delete currency <strong>{itemToDelete?.currencyName}</strong> ? </>}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

const mapStateToProps = (state) => {
  const loginState = state.loginReducer;
  console.log("Full login state:", loginState);

  let userId = null;

  if (loginState && typeof loginState === "object") {
    if (loginState.personId) userId = loginState.personId;
    else if (loginState.id) userId = loginState.id;
    else if (loginState.userId) userId = loginState.userId;
    else if (loginState.user) {
      if (loginState.user.personId) userId = loginState.user.personId;
      else if (loginState.user.id) userId = loginState.user.id;
      else if (loginState.user.userId) userId = loginState.user.userId;
    } else if (loginState.userData) {
      if (loginState.userData.personId) userId = loginState.userData.personId;
      else if (loginState.userData.id) userId = loginState.userData.id;
      else if (loginState.userData.userId) userId = loginState.userData.userId;
    } else {
      for (const key in loginState) {
        if (
          key.toLowerCase().includes("id") &&
          typeof loginState[key] === "number"
        ) {
          userId = loginState[key];
          break;
        }
      }
    }
  }

  console.log("Found userId:", userId);

  return {
    userId: userId,
  };
};

export default connect(mapStateToProps)(CurrencyList);
