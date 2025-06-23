import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import DataTable from "../../Common/DataTable";
import BankModal from "./BankModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { fetchBanks, deleteBank } from "./BankAPI";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from "../../Common/SearchBar";
import { Stack } from "@mui/material"; // Import Stack from @mui/material
import { showToast } from "../../toastNotification";

const BankList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBanks = async () => {
    try {
      setLoading(true);

      const response = await fetchBanks(page + 1, rowsPerPage);

      const banks = response.data || [];

      const mappedRows = banks.map((bank) => ({
        id: bank.BankAccountID || "N/A",
        accountName: bank.AccountName,
        accountType: bank.AccountType,
        bankName: bank.BankName,
        branchCode: bank.BranchCode,
        iban: bank.IBAN,
        ifsc: bank.IFSC,
        micra: bank.MICRA,
      }));
      setRows(mappedRows);

      // The API is returning the count of records on the current page, not the total
      // We need to use a fixed total count or make a separate API call to get the total
      if (response.totalRecords) {
        // For now, we'll use a workaround - if we get fewer records than requested,
        // we're on the last page, so calculate total based on that
        const currentPageCount = response.data.length;
        if (currentPageCount < rowsPerPage) {
          // We're on the last page
          const calculatedTotal = page * rowsPerPage + currentPageCount;
          setTotalRows(calculatedTotal);
        } else {
          // We need to assume there are more pages
          // Set a higher number to ensure pagination works
          const minimumTotal = (page + 1) * rowsPerPage + 1;
          setTotalRows(Math.max(minimumTotal, response.totalRecords));
        }
      } else {
        // Fallback
        setTotalRows(mappedRows.length);
      }
    } catch (error) {
      console.error("Load banks error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      console.log("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, [page, rowsPerPage]);

  const columns = [
    { field: "accountName", headerName: "Account Name", flex: 1 },
    { field: "accountType", headerName: "Type", width: 120 },
    { field: "bankName", headerName: "Bank Name", flex: 1 },
    { field: "branchCode", headerName: "Branch Code", width: 120 },
    { field: "iban", headerName: "IBAN", width: 150 },
    { field: "ifsc", headerName: "IFSC", width: 120 },
    { field: "micra", headerName: "MICRA", width: 120 },
  ];

  const handleDeleteClick = (id) => {
    if (!id) {
      console.log("Invalid bank account ID");
      return;
    }
    const row = rows.find((r) => r.id === id);
    if (!row) {
      console.log("Bank account not found");
      return;
    }
    setItemToDelete({ id, accountName: row.accountName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) {
      console.log("Invalid bank account ID");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      return;
    }
    try {
      await deleteBank(itemToDelete.id);
      loadBanks();
      toast.success("Bank account deleted successfully"); 
    } catch (error) {
      console.error("Delete error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }); // Detailed debug log
      console.log(error.message || "Failed to delete bank account");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
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
          mb: 3,
        }}
      >
        <Typography variant="h5">Bank Account Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Bank">
            <IconButton
              onClick={() => setModalOpen(true)}
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
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={(id) => {
          setSelectedBankId(id);
          setModalOpen(true);
        }}
        onDelete={handleDeleteClick}
        totalRows={totalRows}
        loading={loading}
      />

      <BankModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBankId(null);
        }}
        bankId={selectedBankId}
        onSave={loadBanks}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Bank Account"
        message={`Are you sure you want to delete ${
          itemToDelete?.accountName || "this bank account"
        }?`}
      />
    </Box>
  );
};

export default BankList;
