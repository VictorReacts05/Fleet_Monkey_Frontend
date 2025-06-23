import React, { useState, useEffect } from "react";
import { Typography, Box, Tooltip, IconButton } from "@mui/material";
import DataTable from "../../common/DataTable";
import ItemModal from "./ItemModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import { fetchItems, deleteItem } from "./ItemAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";
import SearchBar from "../../common/SearchBar";

const ItemList = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const columns = [
    { field: "itemCode", headerName: "Item Code", flex: 1 },
    { field: "itemName", headerName: "Item Name", flex: 1 },
  ];

  const loadItems = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate
        ? dayjs(fromDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;
      const formattedToDate = toDate
        ? dayjs(toDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : null;

      const response = await fetchItems(
        page + 1,
        rowsPerPage,
        formattedFromDate,
        formattedToDate
      );

      const items = response.data || [];
      const totalCount = response.pagination?.totalRecords || items.length;

      const formattedRows = items.map((item) => ({
        id: item.ItemID,
        itemCode: item.ItemCode || "-",
        itemName: item.ItemName || "-",
        createdDateTime:
          dayjs(item.CreatedDateTime).format("YYYY-MM-DD HH:mm:ss") || "N/A",
      }));

      setRows(formattedRows);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error loading items:", error);
      console.log("Failed to load items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page, rowsPerPage, fromDate, toDate]);

  const handleCreate = () => {
    setSelectedItemId(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedItemId(id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const item = rows.find((row) => row.id === id);
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem(itemToDelete.id);
      toast.success("Item deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadItems();
    } catch (error) {
      console.log("Failed to delete item: " + error.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    loadItems();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedItemId(null);
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
        <Typography variant="h5">Item Management</Typography>
        <Tooltip title="Add Item">
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

      <ItemModal
        open={modalOpen}
        onClose={handleModalClose}
        itemId={selectedItemId}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete item ${itemToDelete?.itemName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ItemList;
