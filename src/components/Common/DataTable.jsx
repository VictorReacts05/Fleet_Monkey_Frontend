import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  styled,
  CircularProgress,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Define a styled TableCell for headers with bold text
const StyledTableHeaderCell = styled(TableCell)({
  textAlign: "center",
  fontWeight: "bold", // Make headers bold
});

// Define a styled TableCell for body cells
const StyledTableBodyCell = styled(TableCell)({
  textAlign: "center",
});

const DataTable = ({
  columns,
  rows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  totalRows,
  loading,
}) => {
  const renderCellContent = (row, column) => {
    // Support both field and id properties for column identification
    const columnId = column.field || column.id;
    const value = row[columnId];
    return column.format ? column.format(value) : value;
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableHeaderCell key={column.field || column.id}>
                  {column.headerName || column.label}
                </StyledTableHeaderCell>
              ))}
              <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <StyledTableBodyCell
                  colSpan={columns.length + 1}
                  align="center"
                >
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                </StyledTableBodyCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <StyledTableBodyCell
                  colSpan={columns.length + 1}
                  align="center"
                >
                  No data available
                </StyledTableBodyCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow hover key={row.id || row.SalesRFQID}>
                  {columns.map((column) => (
                    <StyledTableBodyCell key={`${row.id || row.SalesRFQID}-${column.field || column.id}`}>
                      {renderCellContent(row, column)}
                    </StyledTableBodyCell>
                  ))}
                  <StyledTableBodyCell>
                    <IconButton size="small" onClick={() => onEdit(row.id || row.SalesRFQID)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(row.id || row.SalesRFQID)}>
                      <DeleteIcon />
                    </IconButton>
                  </StyledTableBodyCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};

export default DataTable;
