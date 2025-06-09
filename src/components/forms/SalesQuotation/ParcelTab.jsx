import React from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DataTable from "../../Common/DataTable";
import FormSelect from "../../Common/FormSelect";
import FormInput from "../../Common/FormInput";
import { toast } from "react-toastify";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Function to fetch items from API
const fetchItems = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/items`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// Function to fetch UOMs from API
const fetchUOMs = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/uoms`);
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected UOM API response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

// (Removed duplicate and incorrect ParcelTab definition)

// ErrorBoundary to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="error" variant="body1">
            Error rendering parcels:{" "}
            {this.state.error?.message || "Unknown error"}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

/**
 * ParcelTab Component
 * Displays a table of parcels for a sales quotation with Item Name, UOM, Quantity,
 * Supplier Rate, Supplier Amount, Sales Rate, and Sales Amount.
 * @param {Object} props
 * @param {string} props.salesQuotationId - ID of the sales quotation
 * @param {Array<Object>} props.parcels - Array of parcel objects
 * @param {boolean} props.readOnly - Whether the form is read-only
 * @param {boolean} props.isEdit - Whether the form is in edit mode
 * @param {string|null} props.error - Error message for parcel loading
 * @param {Function} props.onSalesRateChange - Callback for sales rate changes
 */
const ParcelTab = ({
  salesQuotationId,
  parcels,
  readOnly,
  isEdit,
  error,
  onSalesRateChange,
}) => {
  const theme = useTheme();

  console.log("ParcelTab Rendered with Props:", {
    salesQuotationId,
    parcelCount: parcels?.length,
    readOnly,
    isEdit,
    hasError: !!error,
  });

  // Validate parcels prop
  if (!Array.isArray(parcels)) {
    console.error("Invalid parcels prop, expected an array:", parcels);
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography color="error" variant="body1">
          Invalid parcel data
        </Typography>
      </Box>
    );
  }

  // Define table columns
  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(2),
    },
    {
      field: "rate",
      headerName: "Supplier Rate",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
    {
      field: "amount",
      headerName: "Supplier Amount",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
    {
      field: "salesRate",
      headerName: "Sales Rate",
      flex: 1,
      renderCell: (params) =>
        isEdit ? (
          <TextField
            type="number"
            value={params.row.salesRate || ""}
            onChange={(e) => onSalesRateChange(params.row.id, e.target.value)}
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ width: "100px" }}
          />
        ) : (
          Number(params.row.salesRate).toFixed(6)
        ),
    },
    {
      field: "salesAmount",
      headerName: "Sales Amount",
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(6),
    },
  ];

  // Format parcels for DataTable
  const formattedParcels = parcels.map((item, index) => {
    const formatted = {
      id: item.ParcelID || `parcel-${index}`,
      itemName:
        typeof item.itemName === "string" ? item.itemName : "Unknown Item",
      uomName: item.uomName || "-",
      quantity: Number(item.quantity) || 0,
      rate: Number(item.rate) || 0,
      amount: Number(item.amount) || 0,
      salesRate: Number(item.salesRate) || 0,
      salesAmount: Number(item.salesAmount) || 0,
      SupplierQuotationParcelID: item.SupplierQuotationParcelID || null,
      SalesQuotationParcelID: item.SalesQuotationParcelID || null,
      srNo: index + 1,
    };
    console.log(`Formatted Parcel ${index + 1}:`, formatted);
    return formatted;
  });

  console.log("All Formatted Parcels:", formattedParcels);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default ParcelTab;
