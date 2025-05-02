import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import DataTable from "../../Common/DataTable";
import CertificationModal from "./CertificationModal";
import ConfirmDialog from "../../Common/ConfirmDialog";
import FormDatePicker from "../../Common/FormDatePicker";
import { fetchCertifications, deleteCertification } from "./CertificationAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import SearchBar from "../../Common/SearchBar";


const CertificationList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCertificationId, setSelectedCertificationId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "certificationName", headerName: "Certification Name", flex: 1 },
  ];

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchCertifications(
        page + 1, // Backend expects 1-based page numbers
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const certifications = Array.isArray(response.data) ? response.data : [];
      const totalRecords = Number(response.pagination?.totalRecords) || 0;

      const formattedRows = certifications.map((cert) => ({
        id: cert.CertificationID,
        certificationName: cert.CertificationName,
      }));

      setRows(formattedRows);
      setTotalRows(totalRecords);

      // Reset page if the current page is out of bounds
      if (totalRecords > 0 && page * rowsPerPage >= totalRecords) {
        const newPage = Math.max(
          0,
          Math.floor((totalRecords - 1) / rowsPerPage)
        );
        setPage(newPage);
      }
    } catch (error) {
      console.error("Error loading certifications:", error);
      toast.error("Failed to load certifications");
      setRows([]);
      setTotalRows(
        Number(localStorage.getItem("certificationTotalRecords")) || 0
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedCertificationId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedCertificationId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const certification = rows.find((row) => row.id === id);
    setItemToDelete(certification);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCertification(itemToDelete.id);
      toast.success("Certification deleted successfully");
      loadCertifications();
    } catch (error) {
      toast.error("Failed to delete certification");
    }
    setDeleteDialogOpen(false);
  };

  const handleSave = () => {
    setModalOpen(false);
    loadCertifications();
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
        <Typography variant="h5">Certification Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search Sales RFQs..."
            sx={{
              width: "100%",
              marginLeft: "auto",
            }}
          />
          <Tooltip title="Add Certification">
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
        onPageChange={(event, newPage) => {
          setPage(newPage);
        }}
        onRowsPerPageChange={(event) => {
          const newRowsPerPage = parseInt(event.target.value, 10);
          setRowsPerPage(newRowsPerPage);
          setPage(0); // Reset to first page when changing page size
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalRows={totalRows}
        loading={loading}
      />

      <CertificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        certificationId={selectedCertificationId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete certification ${itemToDelete?.certificationName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default CertificationList;
