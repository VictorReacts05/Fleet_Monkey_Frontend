import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import { getSupplierQuotationById } from "./SupplierQuotationAPI";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ReadOnlyField = ({ label, value }) => {
  let displayValue = value;

  if (value instanceof Date && !isNaN(value)) {
    displayValue = value.toLocaleDateString();
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {displayValue || "-"}
      </Typography>
    </Box>
  );
};

const SupplierQuotationForm = ({
  supplierQuotationId: propSupplierQuotationId,
  onClose,
  onSave,
  readOnly: propReadOnly = true,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");
  const supplierQuotationId = propSupplierQuotationId || id;
  const theme = useTheme();

  const [isEditing, setIsEditing] = useState(isEditMode);
  const readOnly = propReadOnly && !isEditMode;

  const [formData, setFormData] = useState({
    Series: "-",
    SupplierID: "",
    SupplierName: "-",
    CustomerID: "",
    CustomerName: "-",
    CompanyID: "",
    CompanyName: "-",
    PurchaseRFQID: "",
    PurchaseRFQSeries: "-",
    SalesRFQID: "",
    SalesRFQSeries: "-",
    PostingDate: null,
    DeliveryDate: null,
    RequiredByDate: null,
    SalesAmount: 0,
    TaxesAndOtherCharges: 0,
    Total: 0,
    CurrencyID: "",
    CurrencyName: "-",
    Terms: "-",
    FormCompletedYN: false,
    CollectFromSupplierYN: false,
    DateReceived: null,
    ServiceTypeID: "",
    ServiceType: "-",
    ShippingPriorityID: "",
    ShippingPriorityName: "-",
    CollectionAddressID: "",
    CollectionAddress: "-",
    DestinationAddressID: "",
    DestinationAddress: "-",
    PackagingRequiredYN: false,
  });
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastDisplayed, setToastDisplayed] = useState(false);

  const calculateTotals = useCallback(
    (updatedParcels) => {
      const salesAmount = updatedParcels.reduce(
        (sum, parcel) => sum + (parseFloat(parcel.Amount) || 0),
        0
      );
      const total =
        salesAmount + (parseFloat(formData.TaxesAndOtherCharges) || 0);
      setFormData((prev) => ({
        ...prev,
        SalesAmount: salesAmount,
        Total: total,
      }));
    },
    [formData.TaxesAndOtherCharges]
  );

  const loadSupplierQuotationData = useCallback(async () => {
    if (!supplierQuotationId) return;

    try {
      setLoading(true);
      setParcelLoading(true);
      setError(null);

      const response = await getSupplierQuotationById(supplierQuotationId);
      console.log("API Response:", response.data);

      if (response && response.data) {
        // Get the actual quotation data from the data property
        const quotationData = response.data.data || {};
        console.log("Quotation Data:", quotationData);

        let formattedData = {
          ...quotationData,
          Series: quotationData.Series || "-",
          SupplierName: quotationData.SupplierName || "-",
          CustomerName: quotationData.CustomerName || "-",
          CompanyName: quotationData.CompanyName || "-",
          // Fix Purchase RFQ and Sales RFQ fields
          PurchaseRFQID: quotationData.PurchaseRFQID || "",
          PurchaseRFQSeries: quotationData.PurchaseRFQSeries || "-",
          SalesRFQID: quotationData.SalesRFQID || "",
          SalesRFQSeries: quotationData.SalesRFQSeries || "-",
          CurrencyName: quotationData.CurrencyName || "-",
          Terms: quotationData.Terms || "-",
          PostingDate: quotationData.PostingDate
            ? new Date(quotationData.PostingDate)
            : null,
          DeliveryDate: quotationData.DeliveryDate
            ? new Date(quotationData.DeliveryDate)
            : null,
          RequiredByDate: quotationData.RequiredByDate
            ? new Date(quotationData.RequiredByDate)
            : null,
          DateReceived: quotationData.DateReceived
            ? new Date(quotationData.DateReceived)
            : null,
          ServiceType: quotationData.ServiceType || "-",
          ShippingPriority: quotationData.ShippingPriority || "-",
          CollectionAddress: quotationData.CollectionAddress || "-",
          DestinationAddress: quotationData.DestinationAddress || "-",
          PackagingRequiredYN: quotationData.PackagingRequiredYN || false,
        };

        console.log("Formatted Data:", formattedData);
        setFormData(formattedData);

        // Fetch Purchase RFQ and Sales RFQ details if needed
        if (quotationData.PurchaseRFQID && !quotationData.PurchaseRFQSeries) {
          try {
            const purchaseRFQResponse = await axios.get(
              `http://localhost:7000/api/purchase-rfq/${quotationData.PurchaseRFQID}`
            );
            if (purchaseRFQResponse.data && purchaseRFQResponse.data.data) {
              const purchaseRFQ = purchaseRFQResponse.data.data;
              setFormData(prev => ({
                ...prev,
                PurchaseRFQSeries: purchaseRFQ.Series || `RFQ #${quotationData.PurchaseRFQID}`
              }));
            }
          } catch (error) {
            console.error("Error fetching Purchase RFQ details:", error);
          }
        }

        if (quotationData.SalesRFQID && !quotationData.SalesRFQSeries) {
          try {
            const salesRFQResponse = await axios.get(
              `http://localhost:7000/api/sales-rfq/${quotationData.SalesRFQID}`
            );
            if (salesRFQResponse.data && salesRFQResponse.data.data) {
              const salesRFQ = salesRFQResponse.data.data;
              setFormData(prev => ({
                ...prev,
                SalesRFQSeries: salesRFQ.Series || `RFQ #${quotationData.SalesRFQID}`
              }));
            }
          } catch (error) {
            console.error("Error fetching Sales RFQ details:", error);
          }
        }

        // Get parcels from response.data.parcels instead of response.parcels
        if (response.data.parcels && Array.isArray(response.data.parcels)) {
          try {
            const uomResponse = await axios.get(
              `http://localhost:7000/api/uoms`
            );
            let uomMap = {};

            if (uomResponse.data && Array.isArray(uomResponse.data.data)) {
              uomMap = uomResponse.data.data.reduce((map, uom) => {
                map[uom.UOMID] = uom.UOM;
                return map;
              }, {});
            }

            const formattedParcels = response.data.parcels.map((parcel, index) => {
              let parcelData = {
                ...parcel,
                srNo: index + 1,
                Rate: parcel.Rate || "",
                Amount: parcel.Amount || 0,
              };

              // Use UOM directly from the parcel if available
              parcelData.uomName = parcel.UOM || 
                (parcel.UOMID && uomMap[parcel.UOMID]
                  ? uomMap[parcel.UOMID]
                  : `UOM #${parcel.UOMID}`);
              
              parcelData.itemName = parcel.ItemName || `Item #${parcel.ItemID}`;
              parcelData.countryName =
                parcel.CountryName ||
                (parcel.CountryOfOriginID
                  ? `Country #${parcel.CountryOfOriginID}`
                  : "-");

              return parcelData;
            });

            console.log("Formatted parcels:", formattedParcels);
            setParcels(formattedParcels);
            calculateTotals(formattedParcels); // Calculate totals after loading parcels
          } catch (error) {
            console.error("Error processing parcels:", error);
            const basicParcels = response.parcels.map((parcel, index) => ({
              ...parcel,
              srNo: index + 1,
              Rate: parcel.Rate || "",
              Amount: parcel.Amount || 0,
              itemName: parcel.ItemName || `Item #${parcel.ItemID}`,
              uomName: `UOM #${parcel.UOMID}`,
              /* countryName:
                parcel.CountryName ||
                (parcel.CountryOfOriginID
                  ? `Country #${parcel.CountryOfOriginID}`
                  : "-"), */
            }));
            setParcels(basicParcels);
            calculateTotals(basicParcels); // Calculate totals after loading parcels
          }
        }
      } else {
        throw new Error("No data returned from API");
      }
    } catch (error) {
      console.error("Error loading supplier quotation data:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        setError({
          message:
            error.response.data?.message ||
            "Failed to load supplier quotation data",
          details: error.response.data?.message.includes(
            "parameter '@SupplierID'"
          )
            ? "The server cannot find the supplier data for this quotation. Please try again or contact support."
            : "An unexpected error occurred. Please try again.",
        });
        if (!toastDisplayed) {
          toast.error(
            error.response?.data?.message.includes("parameter '@SupplierID'")
              ? "Failed to load supplier quotation due to missing supplier data"
              : "Error loading supplier quotation",
            { toastId: "supplier-quotation-error" }
          );
          setToastDisplayed(true);
        }
      } else {
        setError({
          message: "Failed to load supplier quotation data",
          details:
            "Unable to connect to the server. Please check your network and try again.",
        });
        if (!toastDisplayed) {
          toast.error("Unable to connect to the server", {
            toastId: "supplier-quotation-error",
          });
          setToastDisplayed(true);
        }
      }
    } finally {
      setLoading(false);
      setParcelLoading(false);
    }
  }, [supplierQuotationId]);

  useEffect(() => {
    if (supplierQuotationId) {
      setToastDisplayed(false);
      loadSupplierQuotationData();
    }
  }, [supplierQuotationId, loadSupplierQuotationData]);

  const handleRateChange = (parcelId, value) => {
    const updatedParcels = parcels.map((parcel) => {
      if (parcel.SupplierQuotationParcelID === parcelId) {
        const rate = parseFloat(value) || 0;
        const amount = parcel.ItemQuantity * rate;
        return { ...parcel, Rate: value, Amount: amount };
      }
      return parcel;
    });
    setParcels(updatedParcels);
    calculateTotals(updatedParcels);
  };

  // Modify your handleEditToggle function to add more debugging
  const handleEditToggle = () => {
    console.log("Edit toggle clicked, current state:", isEditing);
    setIsEditing(prevState => {
      console.log("Setting isEditing to:", !prevState);
      return !prevState;
    });
  };
  
  // Add this debugging to track state changes
  useEffect(() => {
    console.log("isEditing state changed to:", isEditing);
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log("handleSave triggered");
      
      // Get the auth header from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
      
      // Calculate total sales amount from parcels
      const salesAmount = parcels.reduce(
        (sum, parcel) => sum + (parseFloat(parcel.Amount) || 0),
        0
      );
      
      // Calculate total with taxes
      const total = salesAmount + (parseFloat(formData.TaxesAndOtherCharges) || 0);
      
      console.log("Calculated totals:", { salesAmount, total });
      
      // Prepare supplier quotation update data - include all required fields
      const quotationUpdateData = {
        SupplierQuotationID: parseInt(supplierQuotationId),
        SupplierID: formData.SupplierID,
        CustomerID: formData.CustomerID,
        CompanyID: formData.CompanyID,
        PurchaseRFQID: formData.PurchaseRFQID,
        SalesRFQID: formData.SalesRFQID,
        SalesAmount: salesAmount,
        TaxesAndOtherCharges: formData.TaxesAndOtherCharges || 0,
        Total: total,
        CurrencyID: formData.CurrencyID,
        Terms: formData.Terms,
        FormCompletedYN: formData.FormCompletedYN,
        CollectFromSupplierYN: formData.CollectFromSupplierYN
      };
      
      console.log("Updating supplier quotation with data:", quotationUpdateData);
      
      // Update the supplier quotation
      const quotationResponse = await axios.put(
        `http://localhost:7000/api/supplier-quotation/${supplierQuotationId}`,
        quotationUpdateData,
        { headers }
      );
      
      console.log("Supplier quotation update response:", quotationResponse.data);
      
      // Update each parcel
      for (const parcel of parcels) {
        const parcelData = {
          SupplierQuotationParcelID: parcel.SupplierQuotationParcelID,
          SupplierQuotationID: parseInt(supplierQuotationId),
          ItemID: parcel.ItemID,
          LineItemNumber: parcel.LineItemNumber || null,
          ItemQuantity: parcel.ItemQuantity,
          UOMID: parcel.UOMID,
          Rate: parcel.Rate ? parseFloat(parcel.Rate) : null,
          Amount: parcel.Amount ? parseFloat(parcel.Amount) : null,
          // CountryOfOriginID: parcel.CountryOfOriginID || null,
          CreatedByID: user.personId || 1
        };
        
        console.log(`Updating parcel ${parcel.SupplierQuotationParcelID} with data:`, parcelData);
        
        const parcelResponse = await axios.put(
          `http://localhost:7000/api/supplier-quotation-parcel/${parcel.SupplierQuotationParcelID}`,
          parcelData,
          { headers }
        );
        
        console.log(`Parcel ${parcel.SupplierQuotationParcelID} update response:`, parcelResponse.data);
      }
      
      toast.success("Supplier quotation and parcels updated successfully");
      
      // Reload data to show updated values
      await loadSupplierQuotationData();
      setIsEditing(false);
      
      if (onSave) {
        onSave({ ...formData, parcels });
      }
    } catch (error) {
      console.error("Error saving supplier quotation:", error);
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("handleCancel triggered");
    if (isEditMode) {
      navigate("/supplier-quotation");
    } else if (isEditing) {
      loadSupplierQuotationData();
      setIsEditing(false);
    } else if (onClose) {
      onClose();
    } else {
      navigate("/supplier-quotation");
    }
  };

  const handleRetry = () => {
    console.log("handleRetry triggered");
    setToastDisplayed(false);
    loadSupplierQuotationData();
  };

  // Add a console log at the beginning of the component to verify it's being rendered
  useEffect(() => {
    console.log("SupplierQuotationForm rendered, isEditing:", isEditing);
  }, [isEditing]);

  return (
    <>
      {/* REMOVE: Emergency save button outside FormPage for testing */}
      {/* {isEditing && (
        <Box sx={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              console.log("Emergency save button clicked");
              handleSave();
            }}
          >
            Emergency Save
          </Button>
        </Box>
      )} */}

      <FormPage
        title={
          isEditMode ? "Edit Supplier Quotation" : "View Supplier Quotation"
        }
        onCancel={handleCancel}
        onSubmit={isEditing ? handleSave : undefined} // MODIFIED: Changed onSave to onSubmit
        loading={loading}
        readOnly={readOnly && !isEditing}
      >
        {error && (
          <Alert
            severity="error"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
                <Button color="inherit" size="small" onClick={handleCancel}>
                  Back to List
                </Button>
              </Box>
            }
            sx={{ mb: 3 }}
          >
            <Typography variant="body1">{error.message}</Typography>
            <Typography variant="body2">{error.details}</Typography>
          </Alert>
        )}

        {!isEditMode && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color={isEditing ? "secondary" : "primary"}
              onClick={handleEditToggle}
              disabled={loading || parcelLoading}
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </Box>
        )}

        {/* REMOVE: Direct save button for testing */}
        {/* {isEditing && (
          <Box sx={{ mb: 2, ml: 2, display: 'inline-block' }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                console.log("Direct save button clicked");
                handleSave();
              }}
              disabled={loading || parcelLoading}
            >
              Save Changes
            </Button>
          </Box>
        )} */}

        <Grid
          container
          spacing={1}
          sx={{
            width: "100%",
            margin: 0,
            overflow: "hidden",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Series" value={formData.Series} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Supplier" value={formData.SupplierName} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Customer" value={formData.CustomerName} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Company" value={formData.CompanyName} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Purchase RFQ"
              value={formData.PurchaseRFQSeries}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Sales RFQ" value={formData.SalesRFQSeries} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Posting Date"
              value={
                formData.PostingDate
                  ? formData.PostingDate.toLocaleDateString()
                  : "-"
              }
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Delivery Date"
              value={
                formData.DeliveryDate
                  ? formData.DeliveryDate.toLocaleDateString()
                  : "-"
              }
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Required By Date"
              value={
                formData.RequiredByDate
                  ? formData.RequiredByDate.toLocaleDateString()
                  : "-"
              }
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Sales Amount"
              value={
                formData.SalesAmount ? formData.SalesAmount.toFixed(2) : "-"
              }
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Taxes and Other Charges"
              value={
                formData.TaxesAndOtherCharges
                  ? formData.TaxesAndOtherCharges.toFixed(2)
                  : "-"
              }
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Total"
              value={formData.Total ? formData.Total.toFixed(2) : "-"}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Currency" value={formData.CurrencyName} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Terms" value={formData.Terms} />
          </Grid>

          {/* Add new fields here */}
          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Date Received"
              value={
                formData.DateReceived
                  ? formData.DateReceived.toLocaleDateString()
                  : "-"
              }
            />
          </Grid>

          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField label="Service Type" value={formData.ServiceType} />
          </Grid>

          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Shipping Priority"
              value={formData.ShippingPriority}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ width: "48%", maxWidth: "280px" }}>
            <ReadOnlyField
              label="Collection Address"
              value={formData.CollectionAddress}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ width: "48%", maxWidth: "280px" }}>
            <ReadOnlyField
              label="Destination Address"
              value={formData.DestinationAddress}
            />
          </Grid>

          <Grid item xs={12} md={3} sx={{ width: "24%" }}>
            <ReadOnlyField
              label="Packaging Required"
              value={formData.PackagingRequiredYN ? "Yes" : "No"}
            />
          </Grid>

          {/* Continue with existing grid items */}
        </Grid>

        {parcels.length > 0 ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Parcels
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: "#1976d2",
                    height: "56px",
                  }}
                >
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Sr. No.
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Item
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      UOM
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Rate
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Amount
                    </TableCell>
                    {/* <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "white", py: 2 }}
                    >
                      Country of Origin
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parcelLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} sx={{ my: 2 }} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    parcels.map((parcel) => (
                      <TableRow
                        key={parcel.SupplierQuotationParcelID}
                        sx={{
                          height: "52px",
                          "&:nth-of-type(odd)": {
                            backgroundColor: alpha("#1976d2", 0.05),
                          },
                          "&:hover": {
                            backgroundColor: alpha("#1976d2", 0.1),
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          },
                        }}
                      >
                        <TableCell align="center">{parcel.srNo}</TableCell>
                        <TableCell align="center">{parcel.itemName}</TableCell>
                        <TableCell align="center">{parcel.uomName}</TableCell>
                        <TableCell align="center">
                          {parcel.ItemQuantity}
                        </TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField
                              type="number"
                              value={parcel.Rate}
                              onChange={(e) =>
                                handleRateChange(
                                  parcel.SupplierQuotationParcelID,
                                  e.target.value
                                )
                              }
                              size="small"
                              sx={{ 
                                width: "100px", 
                                textAlign: "center",
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                  "-webkit-appearance": "none",
                                  margin: 0
                                },
                                "& input[type=number]": {
                                  "-moz-appearance": "textfield"
                                }
                              }}
                              inputProps={{ min: 0, step: "0.01" }}
                              placeholder="Enter rate"
                            />
                          ) : parcel.Rate ? (
                            parseFloat(parcel.Rate).toFixed(2)
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {typeof parcel.Amount === "number" &&
                          !isNaN(parcel.Amount)
                            ? parcel.Amount.toFixed(2)
                            : "-"}
                        </TableCell>
                        {/* <TableCell align="center">
                          {parcel.countryName || "-"}
                        </TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Parcels
            </Typography>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                borderRadius: "8px",
                backgroundColor: alpha("#f5f5f5", 0.7),
              }}
            >
              No parcels found for this Supplier Quotation.
            </Paper>
          </Box>
        )}
      </FormPage>
    </>
  );
};

export default SupplierQuotationForm;