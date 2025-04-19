import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import DataTable from "../../Common/DataTable";
import BankModal from "./BankModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { fetchBanks, deleteBank } from "./BankAPI";
import { toast } from "react-toastify";

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
      console.log(`Loading banks: page=${page + 1}, size=${rowsPerPage}`); // Debug log
      setLoading(true);

      const response = await fetchBanks(page + 1, rowsPerPage);
      console.log("API response:", JSON.stringify(response, null, 2)); // Detailed debug log

      const banks = response.data || [];
      console.log("Received banks:", banks);

      const mappedRows = banks.map((bank) => ({
        id: bank.BankAccountID,
        accountName: bank.AccountName,
        accountType: bank.AccountType,
        bankName: bank.BankName,
        branchCode: bank.BranchCode,
        iban: bank.IBAN,
        ifsc: bank.IFSC,
        micra: bank.MICRA,
      }));
      setRows(mappedRows);
      console.log("Mapped rows:", JSON.stringify(mappedRows, null, 2)); // Detailed debug log

      setTotalRows(response.pagination?.totalRecords || 0);
      console.log("Total rows:", response.pagination?.totalRecords); // Debug log
    } catch (error) {
      console.error("Load banks error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }); // Debug log
      toast.error("Failed to load bank accounts");
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
    console.log("Delete clicked for ID:", id); // Debug log
    console.log("Current rows:", JSON.stringify(rows, null, 2)); // Detailed debug log
    if (!id) {
      toast.error("Invalid bank account ID");
      return;
    }
    const row = rows.find((r) => r.id === id);
    if (!row) {
      toast.error("Bank account not found");
      return;
    }
    setItemToDelete({ id, accountName: row.accountName });
    setDeleteDialogOpen(true);
    console.log("deleteDialogOpen set to true, itemToDelete:", {
      id,
      accountName: row.accountName,
    }); // Debug log
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) {
      toast.error("Invalid bank account ID");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      return;
    }
    try {
      console.log("Deleting bank with ID:", itemToDelete.id); // Debug log
      await deleteBank(itemToDelete.id);
      console.log("Deletion successful, reloading banks"); // Debug log
      loadBanks();
      toast.success("Bank account deleted successfully");
    } catch (error) {
      console.error("Delete error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }); // Detailed debug log
      toast.error(error.message || "Failed to delete bank account");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      console.log("Dialog closed, itemToDelete cleared"); // Debug log
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Bank Account Management</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
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
        onEdit={(id) => {
          console.log("Edit clicked for ID:", id); // Debug log
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
