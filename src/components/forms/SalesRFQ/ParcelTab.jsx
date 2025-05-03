import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
import { submitSalesRFQApproval } from "./SalesRFQAPI";

const API_URL = "http://localhost:7000/api";

const fetchItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

const fetchUOMs = async () => {
  try {
    const response = await axios.get(`${API_URL}/uoms`);
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

const ParcelTab = ({ salesRFQId, onParcelsChange, readOnly = false }) => {
  const [parcels, setParcels] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parcelForms, setParcelForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState(null);
  const [loadingExistingParcels, setLoadingExistingParcels] = useState(false);
  const [activeTab, setActiveTab] = useState("parcels");
  const [approvalDecision, setApprovalDecision] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [currentApproval, setCurrentApproval] = useState(null);
  const [loadingApproval, setLoadingApproval] = useState(false);

  const theme = useTheme();

    useEffect(() => {
      const fetchCurrentApproval = async () => {
        if (!salesRFQId || activeTab !== "approvals") return;

        try {
          setLoadingApproval(true);
          setApprovalDecision("");

          const response = await axios.get(
            `http://localhost:7000/api/sales-rfq-approvals?salesRFQID=${salesRFQId}`
          );

          console.log("Approval data received:", response.data);

          if (
            response.data &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            const approvals = response.data.data;
            console.log("All approvals for this SalesRFQ:", approvals);

            setCurrentApproval(approvals[0]);

            const personId = 2; 
            const userApproval = approvals.find(
              (approval) =>
                Number(approval.ApproverID) === Number(personId) ||
                Number(approval.UserID) === Number(personId)
            );

            console.log("User's approval record:", userApproval);

            if (userApproval) {
              const approvedValue =
                userApproval.ApprovedYN === 1 ||
                userApproval.ApprovedYN === true ||
                userApproval.ApprovedYN === "1" ||
                userApproval.ApprovedYN === "true";

              console.log(
                "Setting approval decision to:",
                approvedValue ? "yes" : "no"
              );
              setApprovalDecision(approvedValue ? "yes" : "no");

              setApprovalSubmitted(true);
            } else {
              setApprovalSubmitted(false);
              setApprovalDecision("");
            }
          }
        } catch (error) {
          console.error("Error fetching current approval:", error);
          setApprovalDecision("");
        } finally {
          setLoadingApproval(false);
        }
      };

      fetchCurrentApproval();
    }, [salesRFQId, activeTab]);

  const columns = [
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "uomName", headerName: "UOM", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [itemsData, uomsData] = await Promise.all([
          fetchItems().catch((err) => {
            console.error("Failed to fetch items:", err);
            toast.error("Failed to load items");
            return [];
          }),
          fetchUOMs().catch((err) => {
            console.error("Failed to fetch UOMs:", err);
            toast.error("Failed to load UOMs");
            return [];
          }),
        ]);

        const itemOptions = [
          { value: "", label: "Select an item" },
          ...itemsData.map((item) => ({
            value: String(item.ItemID),
            label: item.ItemName,
          })),
        ];

        const uomOptions = [
          { value: "", label: "Select a UOM" },
          ...uomsData.map((uom) => ({
            value: String(
              uom.UOMID ||
                uom.UOMId ||
                uom.uomID ||
                uom.uomId ||
                uom.id ||
                uom.ID
            ),
            label:
              uom.UOM ||
              uom.uom ||
              uom.UOMName ||
              uom.uomName ||
              uom.name ||
              String(uom.UOMDescription || uom.Description || "Unknown UOM"),
          })),
        ];

        setItems(itemOptions);
        setUOMs(uomOptions);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load form data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  useEffect(() => {
    const loadExistingParcels = async () => {
      if (!salesRFQId) {
        console.log("No SalesRFQ ID provided, skipping parcel fetch");
        return;
      }

      try {
        setLoadingExistingParcels(true);

        let response;
        try {
          response = await axios.get(
            `${API_URL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`
          );
        } catch (err) {
          console.log(
            "First endpoint attempt failed, trying alternative...",
            err.message
          );
          try {
            response = await axios.get(
              `${API_URL}/sales-rfq/${salesRFQId}/parcels`
            );
          } catch (err2) {
            console.log(
              "Second endpoint attempt failed, trying final alternative...",
              err2.message
            );
            response = await axios.get(
              `${API_URL}/sales-rfq-parcels/salesrfq/${salesRFQId}`
            );
          }
        }

        if (response && response.data) {
          let parcelData = [];
          if (response.data.data && Array.isArray(response.data.data)) {
            parcelData = response.data.data;
          } else if (Array.isArray(response.data)) {
            parcelData = response.data;
          } else if (
            response.data.parcels &&
            Array.isArray(response.data.parcels)
          ) {
            parcelData = response.data.parcels;
          } else {
            console.warn("Unexpected response format:", response.data);
          }

          const filteredParcels = parcelData.filter((parcel) => {
            const parcelSalesRFQId =
              parcel.SalesRFQID ||
              parcel.salesRFQID ||
              parcel.salesRfqId ||
              parcel.salesrfqid ||
              parcel.SalesRfqId;

            return String(parcelSalesRFQId) === String(salesRFQId);
          });

          if (filteredParcels.length === 0) {
            setParcels([]);
            return;
          }

          let itemsToUse = items;
          let uomsToUse = uoms;

          if (items.length <= 1) {
            try {
              const itemsResponse = await fetchItems();
              const itemsData = itemsResponse || [];
              itemsToUse = [
                { value: "", label: "Select an item" },
                ...itemsData.map((item) => ({
                  value: String(item.ItemID),
                  label: item.ItemName,
                })),
              ];
            } catch (err) {
              console.error("Failed to fetch items directly:", err);
            }
          }

          if (uoms.length <= 1) {
            try {
              const uomsResponse = await fetchUOMs();
              const uomsData = uomsResponse || [];
              uomsToUse = [
                { value: "", label: "Select a UOM" },
                ...uomsData.map((uom) => ({
                  value: String(
                    uom.UOMID ||
                      uom.UOMId ||
                      uom.uomID ||
                      uom.uomId ||
                      uom.id ||
                      uom.ID
                  ),
                  label:
                    uom.UOM ||
                    uom.uom ||
                    uom.UOMName ||
                    uom.uomName ||
                    uom.name ||
                    String(
                      uom.UOMDescription || uom.Description || "Unknown UOM"
                    ),
                })),
              ];
            } catch (err) {
              console.error("Failed to fetch UOMs directly:", err);
            }
          }

          const formattedParcels = filteredParcels.map((parcel, index) => {
            let itemName = "Unknown Item";
            let uomName = "Unknown UOM";

            try {
              const itemId = String(parcel.ItemID || "");
              const uomId = String(parcel.UOMID || "");

              const item = itemsToUse.find((i) => i.value === itemId);
              if (item) {
                itemName = item.label;
              } else {
                itemName = `Item #${itemId}`;
              }

              const uom = uomsToUse.find((u) => u.value === uomId);
              if (uom) {
                uomName = uom.label;
              } else {
                uomName = `UOM #${uomId}`;
              }
            } catch (err) {
              console.error("Error formatting parcel data:", err);
            }

            return {
              id: parcel.SalesRFQParcelID || parcel.id || Date.now() + index,
              itemId: String(parcel.ItemID || ""),
              uomId: String(parcel.UOMID || ""),
              quantity: String(parcel.ItemQuantity || parcel.Quantity || "0"),
              itemName,
              uomName,
              srNo: index + 1,
            };
          });

          setParcels(formattedParcels);
        } else {
          console.warn("No parcel data found in response");
          setParcels([]);
        }
      } catch (error) {
        console.error("Error loading existing parcels:", error);
        setParcels([]);
      } finally {
        setLoadingExistingParcels(false);
      }
    };

    setParcels([]);

    loadExistingParcels();
  }, [salesRFQId, items, uoms]);

  const handleAddParcel = () => {
    const newFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: newFormId,
        itemId: "",
        uomId: "",
        quantity: "",
      },
    ]);
  };

  const handleEditParcel = (id) => {
    const parcelToEdit = parcels.find((p) => p.id === id);
    if (!parcelToEdit) {
      console.error("Parcel not found for editing:", id);
      return;
    }

    const editFormId = Date.now();
    setParcelForms((prev) => [
      ...prev,
      {
        id: editFormId,
        itemId: parcelToEdit.itemId,
        uomId: parcelToEdit.uomId,
        quantity: parcelToEdit.quantity,
        editIndex: parcels.findIndex((p) => p.id === id),
        originalId: id,
      },
    ]);
  };

  const handleChange = (e, formId) => {
    const { name, value } = e.target;
    setParcelForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, [name]: value } : form
      )
    );

    if (errors[formId]?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          [name]: undefined,
        },
      }));
    }
  };

  const validateParcelForm = (form) => {
    const formErrors = {};
    if (!form.itemId) formErrors.itemId = "Item is required";
    if (!form.uomId) formErrors.uomId = "UOM is required";
    if (!form.quantity) {
      formErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      formErrors.quantity = "Quantity must be a positive number";
    }

    return formErrors;
  };

  const handleSave = (formId) => {
    const form = parcelForms.find((f) => f.id === formId);
    if (!form) return;

    const formErrors = validateParcelForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [formId]: formErrors,
      }));
      return;
    }

    const selectedItem = items.find((i) => i.value === form.itemId);
    const selectedUOM = uoms.find((u) => u.value === form.uomId);

    const originalParcel =
      form.editIndex !== undefined ? parcels[form.editIndex] : null;

    const newParcel = {
      id: form.originalId || form.id,
      SalesRFQParcelID: originalParcel?.SalesRFQParcelID || originalParcel?.id,
      SalesRFQID: salesRFQId,
      ItemID: parseInt(form.itemId, 10),
      itemId: form.itemId,
      UOMID: parseInt(form.uomId, 10),
      uomId: form.uomId,
      ItemQuantity: parseInt(form.quantity, 10),
      Quantity: parseInt(form.quantity, 10),
      quantity: form.quantity,
      itemName: selectedItem ? selectedItem.label : "Unknown Item",
      uomName: selectedUOM ? selectedUOM.label : "Unknown UOM",
      srNo: originalParcel?.srNo || parcels.length + 1,
      isModified: true,
      SalesRFQParcel: {
        SalesRFQParcelID:
          originalParcel?.SalesRFQParcelID || originalParcel?.id,
        SalesRFQID: salesRFQId,
        ItemID: parseInt(form.itemId, 10),
        UOMID: parseInt(form.uomId, 10),
        ItemQuantity: parseInt(form.quantity, 10),
      },
    };

    if (form.editIndex !== undefined) {
      const updatedParcels = [...parcels];
      updatedParcels[form.editIndex] = newParcel;
      setParcels(updatedParcels);

      if (onParcelsChange) {
        setTimeout(() => onParcelsChange(updatedParcels), 0);
        try {
          updateParcelInDatabase(newParcel);
        } catch (error) {
          console.error("Error directly updating parcel:", error);
        }
      }
    } else {
      const newParcelsArray = [...parcels, newParcel];
      setParcels(newParcelsArray);
      if (onParcelsChange) {
        setTimeout(() => onParcelsChange(newParcelsArray), 0);
      }
    }
    setParcelForms((prev) => prev.filter((f) => f.id !== formId));
  };

  const updateParcelInDatabase = async (parcel) => {
    if (!salesRFQId || !parcel.SalesRFQParcelID) {
      console.error("Missing required IDs for direct parcel update");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/sales-rfq-parcels/${parcel.SalesRFQParcelID}`,
        {
          SalesRFQID: salesRFQId,
          ItemID: parseInt(parcel.ItemID, 10),
          UOMID: parseInt(parcel.UOMID, 10),
          ItemQuantity: parseInt(parcel.ItemQuantity, 10),
        }
      );

      if (response.data.success) {
        toast.success("Parcel updated successfully");
      }
    } catch (error) {
      console.error("Failed to directly update parcel:", error);
      try {
        const altResponse = await axios.put(
          `${API_URL}/sales-rfq/${salesRFQId}/parcels/${parcel.SalesRFQParcelID}`,
          {
            ItemID: parseInt(parcel.ItemID, 10),
            UOMID: parseInt(parcel.UOMID, 10),
            ItemQuantity: parseInt(parcel.ItemQuantity, 10),
          }
        );
      } catch (altError) {
        console.error("Failed alternative direct update:", altError);
      }
    }
  };

  const handleDeleteParcel = (id) => {
    setDeleteParcelId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setParcels((prev) => prev.filter((p) => p.id !== deleteParcelId));
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteParcelId(null);
  };

  const handleApprovalSubmit = async () => {
    if (!salesRFQId || !approvalDecision) {
      setApprovalError("Please select an approval decision");
      return;
    }

    try {
      setSubmittingApproval(true);
      setApprovalError("");

      // Get the logged in user's ID from localStorage
      /* const user = JSON.parse(localStorage.getItem("user") || "{}");
      const personId = user.personId || user.PersonID || user.id; */
      const personId = 2;

      if (!personId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const approvalData = {
        SalesRFQID: Number(salesRFQId),
        ApproverID: Number(personId),
        ApprovedYN: approvalDecision === "yes" ? 1 : 0,
        FormName: "SalesRFQ",
        RoleName: "Approver",
        UserID: Number(personId),
      };

      console.log("Submitting approval with data:", {
        SalesRFQID: approvalData.SalesRFQID,
        ApproverID: approvalData.ApproverID,
        ApprovedYN: approvalData.ApprovedYN,
        Decision: approvalDecision,
      });

      const response = await submitSalesRFQApproval(
        salesRFQId,
        approvalDecision,
        personId
      );

      if (response && (response.status === 200 || response.status === 201)) {
        toast.success(
          `SalesRFQ ${
            approvalDecision === "yes" ? "approved" : "rejected"
          } successfully`
        );
        setApprovalSubmitted(true);
      } else {
        throw new Error(
          response.data?.message ||
            response.message ||
            "Failed to submit approval"
        );
      }
    } catch (error) {
      console.error("Error submitting approval:", error);
      console.error("Error details:", error.response?.data || error.message);
      setApprovalError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit approval"
      );
      toast.error(
        `Error: ${
          error.response?.data?.message ||
          error.message ||
          "Failed to submit approval"
        }`
      );
    } finally {
      setSubmittingApproval(false);
    }
  };

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
              activeTab === "parcels" ? "#252525" : "transparent",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#252525",
            },
          }}
          onClick={() => setActiveTab("parcels")}
        >
          <Typography variant="h6" component="div">
            Parcels
          </Typography>
        </Box>
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
              activeTab === "approvals" ? "#252525" : "transparent",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#252525",
            },
          }}
          onClick={() => setActiveTab("approvals")}
        >
          <Typography variant="h6" component="div">
            SalesRFQ Approvals
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
        {activeTab === "parcels" ? (
          <>
            {loading || loadingExistingParcels ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!readOnly && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddParcel}
                    sx={{ mb: 2 }}
                  >
                    Add Parcel
                  </Button>
                )}

                {parcels.length === 0 && parcelForms.length === 0 && (
                  <Box
                    sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                  >
                    <Typography variant="body1">
                      No parcels added yet.{" "}
                      {!readOnly && "Click 'Add Parcel' to add a new parcel."}
                    </Typography>
                  </Box>
                )}

                {/* Parcel forms */}
                {parcelForms.map((form) => (
                  <Box
                    key={form.id}
                    sx={{
                      mt: 2,
                      mb: 2,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {form.editIndex !== undefined
                        ? "Edit Parcel"
                        : "New Parcel"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                        <FormSelect
                          name="itemId"
                          label="Item"
                          value={form.itemId}
                          onChange={(e) => handleChange(e, form.id)}
                          options={items}
                          error={!!errors[form.id]?.itemId}
                          helperText={errors[form.id]?.itemId}
                        />
                      </Box>

                      <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                        <FormSelect
                          name="uomId"
                          label="UOM"
                          value={form.uomId}
                          onChange={(e) => handleChange(e, form.id)}
                          options={uoms}
                          error={!!errors[form.id]?.uomId}
                          helperText={errors[form.id]?.uomId}
                        />
                      </Box>

                      <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
                        <FormInput
                          name="quantity"
                          label="Quantity"
                          value={form.quantity}
                          onChange={(e) => handleChange(e, form.id)}
                          error={!!errors[form.id]?.quantity}
                          helperText={errors[form.id]?.quantity}
                          type="number"
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setParcelForms((prev) =>
                            prev.filter((f) => f.id !== form.id)
                          )
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSave(form.id)}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ))}

                {parcels.length > 0 && (
                  <DataTable
                    rows={parcels}
                    columns={columns}
                    pageSize={rowsPerPage}
                    page={page}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newPageSize) =>
                      setRowsPerPage(newPageSize)
                    }
                    rowsPerPageOptions={[5, 10, 25]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    autoHeight
                    hideActions={readOnly}
                    onEdit={!readOnly ? handleEditParcel : undefined}
                    onDelete={!readOnly ? handleDeleteParcel : undefined}
                    totalRows={parcels.length}
                    pagination={true}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <Box sx={{ p: 3 }}>
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
                <Table stickyHeader aria-label="approval table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1f2529"
                              : "#f3f8fd",
                          color: theme.palette.text.primary,
                          zIndex: 10,
                          position: "sticky",
                          top: 0,
                          textAlign: "center",
                        }}
                        align="center"
                      >
                        SalesRFQ ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1f2529"
                              : "#f3f8fd",
                          color: theme.palette.text.primary,
                          zIndex: 10,
                          position: "sticky",
                          top: 0,
                          textAlign: "center",
                        }}
                        align="center"
                      >
                        Approval Decision
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                        textAlign: "center",
                      }}
                    >
                      <TableCell sx={{ textAlign: "center" }} align="center">
                        {salesRFQId}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }} align="center">
                        {loadingApproval ? (
                          <CircularProgress size={24} />
                        ) : approvalSubmitted ? (
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "medium",
                              color:
                                approvalDecision === "yes"
                                  ? "success.main"
                                  : "error.main",
                              padding: "8px 0",
                            }}
                          >
                            {approvalDecision === "yes"
                              ? "Approved"
                              : "Rejected"}
                          </Typography>
                        ) : (
                          <>
                            <Select
                              value={approvalDecision}
                              onChange={(e) =>
                                setApprovalDecision(e.target.value)
                              }
                              displayEmpty
                              fullWidth
                              error={!!approvalError}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                            </Select>
                            {approvalError && (
                              <Typography variant="caption" color="error">
                                {approvalError}
                              </Typography>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              {!approvalSubmitted && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!approvalDecision || submittingApproval}
                  onClick={handleApprovalSubmit}
                  sx={{ minWidth: 200 }}
                >
                  {submittingApproval ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit Approval Decision"
                  )}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this parcel? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParcelTab;
