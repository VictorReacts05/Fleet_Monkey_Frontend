import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Typography,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DataTable = ({
  columns,
  rows,
  page,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = "No data available",
  hideActions = false,
  actionColumn = {
    id: 'actions',
    label: 'Actions',
  }
}) => {
  const theme = useTheme();

  const getStatusColor = (status) => {
    if (!status) return {};
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('active') || statusLower.includes('completed') || statusLower.includes('approved')) {
      return {
        bgcolor: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.main,
      };
    } else if (statusLower.includes('pending') || statusLower.includes('in progress')) {
      return {
        bgcolor: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.main,
      };
    } else if (statusLower.includes('inactive') || statusLower.includes('cancelled') || statusLower.includes('rejected')) {
      return {
        bgcolor: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.main,
      };
    }
    
    return {
      bgcolor: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
    };
  };

  const renderCellContent = (row, column) => {
    // Support both field and id properties for backward compatibility
    const fieldName = column.field || column.id;
    if (!fieldName) return "—";
    
    const value = row[fieldName];
    
    // Handle status fields with special styling
    if (fieldName.toLowerCase().includes('status') && value) {
      return (
        <Chip 
          label={value} 
          size="small" 
          sx={{ 
            ...getStatusColor(value),
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 24
          }} 
        />
      );
    }
    
    // Handle date fields
    if (fieldName.toLowerCase().includes('date') && value) {
      return value;
    }
    
    return value || "—";
  };

  const renderLoadingSkeleton = () => {
    return Array(rowsPerPage).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column, colIndex) => (
          <TableCell key={`skeleton-cell-${colIndex}`}>
            <Skeleton animation="wave" height={24} />
          </TableCell>
        ))}
        {!hideActions && (
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton animation="wave" variant="circular" width={30} height={30} />
              <Skeleton animation="wave" variant="circular" width={30} height={30} />
            </Box>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      <TableContainer sx={{ maxHeight: "calc(100vh - 250px)" }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.field || column.id || `column-${index}`}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1f2529"
                        : alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.text.primary,
                    zIndex: 10,
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  {column.headerName || column.label}
                </TableCell>
              ))}
              {!hideActions && (
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1f2529"
                        : alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.text.primary,
                    zIndex: 10,
                    position: "sticky",
                    top: 0,
                    textAlign: "center",
                  }}
                >
                  {actionColumn.label}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeleton()
            ) : rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <TableRow
                  hover
                  key={row.id || `row-${rowIndex}`}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    textAlign: "center",
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`cell-${rowIndex}-${colIndex}`}
                      sx={{
                        textAlign: "center",
                      }}
                    >
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {!hideActions && (
                    <TableCell sx={{ textAlign: "center" }}>
                      <Box
                        sx={{ 
                          display: "flex", 
                          gap: 1, 
                          justifyContent: "center", // Center the action buttons horizontally
                          width: "100%" // Ensure the box takes full width of the cell
                        }}
                      >
                        {onView && (
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => onView(row.id)}
                              sx={{
                                color: theme.palette.info.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.info.main,
                                    0.1
                                  ),
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row.id)}
                              sx={{
                                color: theme.palette.primary.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                },
                                textAlign: "center",
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row.id)}
                              sx={{
                                color: theme.palette.error.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                                textAlign: "center",
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hideActions ? 0 : 1)}
                  align="center"
                  sx={{ py: 8, textAlign: "center" }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};

export default DataTable;
