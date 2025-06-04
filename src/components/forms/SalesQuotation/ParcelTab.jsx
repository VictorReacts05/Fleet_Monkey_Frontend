import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import DataTable from "../../Common/DataTable";

const ParcelTab = ({ salesQuotationId, parcels, readOnly = true, error }) => {
  const theme = useTheme();

  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  const formattedParcels = parcels.map((parcel, index) => ({
    id: parcel.ParcelID || `parcel-${index}`,
    itemName: parcel.itemName || "Unknown Item",
    uomName: parcel.uomName || "-",
    quantity: parcel.quantity || 0,
    srNo: index + 1,
  }));

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Box
          sx={{
            py: 1.5,
            px: 3,
            fontWeight: "bold",
            borderTop: "1px solid #e0e0e0",
            borderRight: "1px solid #e0e0e0",
            borderLeft: "1px solid #e0e0e0",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            backgroundColor:
              theme.palette.mode === "dark" ? "#1f2529" : "#f3f8fd",
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="h6" component="div">
            Items
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          border: "1px solid #e0e0e0",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        {error ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="error" variant="body1">
              Error loading parcels: {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : formattedParcels.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <Typography variant="body1">No parcels available.</Typography>
          </Box>
        ) : (
          <DataTable
            rows={formattedParcels}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection={false}
            disableSelectionOnClick
            autoHeight
            hideActions={true}
            totalRows={formattedParcels.length}
            pagination={true}
          />
        )}
      </Box>
    </Box>
  );
};

export default ParcelTab;
