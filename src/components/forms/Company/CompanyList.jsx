import React, { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import CompanyModal from "./CompanyModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import { fetchCompanies, deleteCompany } from "./CompanyAPI";
import { toast } from "react-toastify";
import axios from "axios";
import SearchBar from "../../Common/SearchBar";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import APIBASEURL from "../../../utils/apiBaseUrl";

const CompanyList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { field: "companyName", headerName: "Company Name", flex: 1 },
    { field: "currencyName", headerName: "Currency", flex: 1 },
    { field: "vatAccount", headerName: "VAT Account", flex: 1 },
    { field: "website", headerName: "Website", flex: 1 },
    { field: "companyNotes", headerName: "Notes", flex: 1 },
  ];

  useEffect(() => {
    loadCompanies();
  }, [page, rowsPerPage, searchTerm]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      let currencyMap = {};
      try {
        const currencyResponse = await axios.get(`${APIBASEURL}/currencies`);
        if (currencyResponse.data && currencyResponse.data.data) {
          currencyResponse.data.data.forEach((currency) => {
            currencyMap[currency.CurrencyID] = currency.CurrencyName;
          });
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }

      const response = await fetchCompanies(
        page + 1,
        rowsPerPage,
        null,
        null,
        searchTerm
      );
      const companies = Array.isArray(response.data) ? response.data : [];

      const mappedRows = companies.map((company) => ({
        id: company.CompanyID || company.companyId,
        companyName: company.CompanyName || company.companyName || "N/A",
        currencyName: company.BillingCurrencyID
          ? currencyMap[company.BillingCurrencyID] ||
            `Unknown (ID: ${company.BillingCurrencyID})`
          : "N/A",
        vatAccount: company.VAT_Account || company.vatAccount || "N/A",
        website: company.Website || company.website || "N/A",
        companyNotes: company.CompanyNotes || company.companyNotes || "N/A",
      }));

      setRows(mappedRows);
      setTotalRows(response.totalRecords || companies.length);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreate = () => {
    setSelectedCompanyId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCompanyId(id);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const personId = user?.personId || user?.id || user?.userId;
  if (!personId) {
    toast.error("You must be logged in to delete a company.");
    return;
  }
  const item = rows.find((row) => row.id === id);
  if (item) {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  } else {
    toast.error("Company not found");
  }
};

const handleDeleteConfirm = async () => {
  try {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const personId = user?.personId || user?.id || user?.userId;
    if (!personId) {
      throw new Error("You must be logged in to delete a company.");
    }
    await deleteCompany(itemToDelete.id, personId);
    toast.success("Company deleted successfully");
    setPage(0);
    loadCompanies();
  } catch (error) {
    console.error("Error deleting company:", error);
    toast.error(error.message || "Failed to delete company");
  } finally {
    setLoading(false);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }
};
  const handleSave = () => {
    setPage(0);
    loadCompanies();
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
        <Typography variant="h5">Company Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Companies..."
            sx={{ width: "100%", marginLeft: "auto" }}
          />
          <Tooltip title="Add Company">
            <IconButton
              color="primary"
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
        rows={rows}
        columns={columns}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        companyId={selectedCompanyId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Company"
        message={`Are you sure you want to delete ${itemToDelete?.companyName}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { width: "400px", minHeight: "200px", padding: "16px" },
        }}
      />
    </Box>
  );
};

export default CompanyList;
