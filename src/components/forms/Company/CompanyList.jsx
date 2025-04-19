import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import DataTable from '../../Common/DataTable';
import CompanyModal from './CompanyModal';
import ConfirmDialog from '../../Common/ConfirmDialog';
import FormDatePicker from '../../Common/FormDatePicker';
import { fetchCompanies, deleteCompany } from "./CompanyAPI";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import axios from 'axios';

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
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: 'companyName', headerName: 'Company Name', flex: 1 },
    { field: 'currencyName', headerName: 'Currency', flex: 1 },
    { field: 'vatAccount', headerName: 'VAT Account', flex: 1 },
    { field: 'website', headerName: 'Website', flex: 1 },
    { field: 'companyNotes', headerName: 'Notes', flex: 1 },
    // Remove the custom actions column - DataTable will add its own
  ];

  useEffect(() => {
    loadCompanies();
  }, [page, rowsPerPage, fromDate, toDate]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate ? dayjs(fromDate).format('YYYY-MM-DD') : null;
      const formattedToDate = toDate ? dayjs(toDate).format('YYYY-MM-DD') : null;
      
      // Fetch currencies first to have them available for mapping
      let currencyMap = {};
      try {
        const currencyResponse = await axios.get('http://localhost:7000/api/currencies/all');
        if (currencyResponse.data && currencyResponse.data.data) {
          // Create a map of currency ID to currency name
          currencyResponse.data.data.forEach(currency => {
            currencyMap[currency.CurrencyID] = currency.CurrencyName;
          });
        }
        console.log('Currency map:', currencyMap);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
      
      const response = await fetchCompanies(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );
  
      console.log('Companies response:', response);
      const companies = response.data || [];
      
      const mappedRows = companies.map((company) => {
        console.log('Processing company:', company);
        // Look up currency name from the map
        const currencyName = company.BillingCurrencyID ? 
          currencyMap[company.BillingCurrencyID] || 'Unknown' : 
          'N/A';
        
        return {
          id: company.CompanyID,
          companyName: company.CompanyName,
          currencyName: currencyName,
          vatAccount: company.VAT_Account || company.VatAccount || 'N/A',
          website: company.Website || 'N/A',
          companyNotes: company.CompanyNotes || 'N/A',
        };
      });
      
      console.log('Mapped company rows:', mappedRows);
      setRows(mappedRows);
      
      // Set total rows for pagination
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

  const handleAdd = () => {
    setSelectedCompanyId(null);
    setModalOpen(true);
  };

  // Make sure these functions are defined correctly
  const handleEdit = (id) => {
    console.log(`Edit clicked for ID: ${id}`);
    setSelectedCompanyId(id);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    console.log(`Delete clicked for ID: ${id}`);
    const item = rows.find(row => row.id === id);
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
      await deleteCompany(itemToDelete.id);
      toast.success("Company deleted successfully");
      loadCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = () => {
    loadCompanies();
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    setPage(0);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    setPage(0);
  };

  const handleClearDates = () => {
    setFromDate(null);
    setToDate(null);
    setPage(0);
  };

  // Update the ConfirmDialog component where it's used in the return statement
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Companies
      </Typography>
  
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormDatePicker
          label="From Date"
          value={fromDate}
          onChange={handleFromDateChange}
        />
        <FormDatePicker
          label="To Date"
          value={toDate}
          onChange={handleToDateChange}
        />
        <Button
          variant="outlined"
          onClick={handleClearDates}
          sx={{ mt: 1 }}
        >
          Clear Dates
        </Button>
      </Stack>
  
      <Button
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        Add Company
      </Button>
  
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
          sx: {
            width: '400px',
            minHeight: '200px',
            padding: '16px'
          }
        }}
      />
    </Box>
  );
};

export default CompanyList;