import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import DataTable from "../../common/DataTable";
import CustomerModal from "./CustomerModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import FormDatePicker from "../../common/FormDatePicker";
import { fetchCustomers, deleteCustomer } from "./CustomerAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import SearchBar from "../../common/SearchBar";
import { showToast } from "../../toastNotification";

const CustomerList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "customerName", headerName: "Customer Name", flex: 1 },
    { field: "customerEmail", headerName: "Email", flex: 1 },
    { field: "companyName", headerName: "Company", flex: 1 },
    { field: "importCode", headerName: "Import Code", flex: 1 },
    { field: "currencyName", headerName: "Currency", flex: 1 },
    { field: "website", headerName: "Website", flex: 1 },
    // { field: "createdDateTime", headerName: "Created Date", flex: 1 },
  ];

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Format dates to start of day and end of day
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:MM:ss")
        : null;

      const response = await fetchCustomers(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const customers = response.data || [];
      const totalCount = response.pagination?.totalRecords || customers.length;

      const formattedRows = customers.map((customer) => ({
        id: customer.CustomerID,
        customerName: customer.CustomerName || "-",
        customerEmail: customer.CustomerEmail || "-",
        companyName: customer.CompanyName || "-",
        importCode: customer.ImportCode || "-",
        currencyName: customer.CurrencyName || "-",
        website: customer.Website || "-",
        createdDateTime:
          dayjs(customer.CreatedDateTime).format("YYYY-MM-DD HH:mm:ss") ||
          "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading customers:", error);
      console.log("Failed to load customers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedCustomerId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCustomerId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const customer = rows.find((row) => row.id === id);
    setItemToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(itemToDelete.id);
      toast.success("Customer deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadCustomers();
    } catch (error) {
      console.log("Failed to delete customer: " + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadCustomers();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCustomerId(null);
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
        <Typography variant="h5">Customer Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Text..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Customer">
            <IconButton
              color="primary"
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
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <CustomerModal
        open={modalOpen}
        onClose={handleModalClose}
        customerId={selectedCustomerId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete customer ${itemToDelete?.customerName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default CustomerList;
