// Remove vehicle type related imports
import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import {
  fetchCompanies,
  getVehicleById,
  createVehicle,
  updateVehicle,
} from "./VehicleAPI";
import { toast } from "react-toastify";

const VehicleForm = ({ vehicleId, onSave, onClose }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Add this line
  const [formData, setFormData] = useState({
    truckNumberPlate: "",
    vin: "",
    companyId: "",
    maxWeight: "",
    length: "",
    width: "",
    height: "",
    // Removed vehicleTypeId
  });

  const [errors, setErrors] = useState({
    truckNumberPlate: "",
    vin: "",
    companyId: "",
    maxWeight: "",
    length: "",
    width: "",
    height: "",
    // Removed vehicleTypeId
  });

  // In the useEffect hook:
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Remove debug logs for fetching data
        const companiesResponse = await fetchCompanies();

        let companyData = [];
        if (Array.isArray(companiesResponse)) {
          companyData = companiesResponse;
        } else if (companiesResponse.data) {
          companyData = companiesResponse.data;
        }

        const companyOptions = companyData.map((company) => ({
          value: company.CompanyID.toString(), // Convert to string
          label: company.CompanyName || "Unnamed Company",
        }));

        setCompanies([
          { value: "", label: "Select an option", disabled: true },
          ...companyOptions,
        ]);

        // In the useEffect hook's vehicle data loading section:
        if (vehicleId) {
          const vehicleResponse = await getVehicleById(vehicleId);
          const vehicle =
            vehicleResponse.data?.data ||
            vehicleResponse.data ||
            vehicleResponse;

          setFormData({
            truckNumberPlate: vehicle?.TruckNumberPlate || "",
            vin: vehicle?.VIN || "",
            companyId: vehicle?.CompanyID?.toString() || "", // Convert to string
            maxWeight: vehicle?.MaxWeight ? vehicle.MaxWeight.toString() : "",
            length: vehicle?.Length ? vehicle.Length.toString() : "",
            width: vehicle?.Width ? vehicle.Width.toString() : "",
            height: vehicle?.Height ? vehicle.Height.toString() : "",
          });
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error(
          "Failed to load dropdown data: " + (error.message || "Unknown error")
        );

        if (companies.length === 0) {
          setCompanies([
            { value: "", label: "Select an option", disabled: true },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vehicleId]);

  /* const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "truckNumberPlate":
        if (!value.trim()) {
          error = "Truck Number Plate is required";
        } else if (!/^[A-Z0-9\s-]{5,}$/i.test(value)) {
          error =
            "Truck Number Plate must be at least 5 characters (letters, numbers, spaces, hyphens)";
        } else if (value.length > 20) {
          error = "Truck Number Plate must be 20 characters or less";
        }
        break;

      case "vin":
        if (!value.trim()) {
          error = "VIN is required";
        } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
          error = "VIN must be exactly 17 characters (A-H, J-N, P, R-Z, 0-9)";
        }
        break;

      case "companyId":
        if (!value) {
          error = "Company is required";
        } else if (
          !companies.some(
            (company) => company.value === value && !company.disabled
          )
        ) {
          error = "Invalid company selected";
        }
        break;

      case "vehicleTypeId":
        if (!value) {
          error = "Vehicle Type is required";
        } else if (
          !vehicleTypes.some((type) => type.value === value && !type.disabled)
        ) {
          error = "Invalid vehicle type selected";
        }
        break;

      case "maxWeight":
        if (!value.trim()) {
          error = "Max Weight is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Max Weight must be a positive number";
        }
        break;

      case "length":
        if (!value.trim()) {
          error = "Length is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Length must be a positive number";
        }
        break;

      case "width":
        if (!value.trim()) {
          error = "Width is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Width must be a positive number";
        }
        break;

      case "height":
        if (!value.trim()) {
          error = "Height is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Height must be a positive number";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  }; */

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "truckNumberPlate":
        if (!value.trim()) {
          error = "Truck Number Plate is required";
        } else if (!/^[A-Z0-9\s-]{5,}$/i.test(value)) {
          error =
            "Truck Number Plate must be at least 5 characters (letters, numbers, spaces, hyphens)";
        } else if (value.length > 20) {
          error = "Truck Number Plate must be 20 characters or less";
        }
        break;

      case "vin":
        if (!value.trim()) {
          error = "VIN is required";
        } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
          error = "VIN must be exactly 17 characters (A-H, J-N, P, R-Z, 0-9)";
        }
        break;

      case "companyId":
        if (!value) {
          error = "Company is required";
        } else if (
          !companies.some(
            (company) => company.value === value && !company.disabled
          )
        ) {
          error = "Invalid company selected";
        }
        break;

      case "maxWeight":
        if (!value.trim()) {
          error = "Max Weight is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Max Weight must be a positive number";
        }
        break;

      case "length":
        if (!value.trim()) {
          error = "Length is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Length must be a positive number";
        }
        break;

      case "width":
        if (!value.trim()) {
          error = "Width is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Width must be a positive number";
        }
        break;

      case "height":
        if (!value.trim()) {
          error = "Height is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error = "Height must be a positive number";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isSubmitted) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    const validationErrors = {};

    validationErrors.truckNumberPlate = validateField(
      "truckNumberPlate",
      formData.truckNumberPlate
    )
      ? ""
      : errors.truckNumberPlate || "Truck Number Plate is required";
    validationErrors.vin = validateField("vin", formData.vin)
      ? ""
      : errors.vin || "VIN is required";
    validationErrors.companyId = validateField("companyId", formData.companyId)
      ? ""
      : errors.companyId || "Company is required";
    validationErrors.vehicleTypeId = validateField(
      "vehicleTypeId",
      formData.vehicleTypeId
    )
      ? ""
      : errors.vehicleTypeId || "Vehicle Type is required";
    validationErrors.maxWeight = validateField("maxWeight", formData.maxWeight)
      ? ""
      : errors.maxWeight || "Max Weight is required";
    validationErrors.length = validateField("length", formData.length)
      ? ""
      : errors.length || "Length is required";
    validationErrors.width = validateField("width", formData.width)
      ? ""
      : errors.width || "Width is required";
    validationErrors.height = validateField("height", formData.height)
      ? ""
      : errors.height || "Height is required";

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);

      // In the handleSubmit function, update the payload creation:
      const payload = {
        truckNumberPlate: formData.truckNumberPlate,
        vin: formData.vin.toUpperCase(),
        companyID: formData.companyId, // Make sure this matches the field name in the API
        maxWeight: formData.maxWeight ? Number(formData.maxWeight) : null,
        length: formData.length ? Number(formData.length) : null,
        width: formData.width ? Number(formData.width) : null,
        height: formData.height ? Number(formData.height) : null,
      };

      if (vehicleId) {
        await updateVehicle(vehicleId, payload);
        // toast.success("Vehicle updated successfully");
        showToast("Vehicle updated successfully", "success");
      } else {
        await createVehicle(payload);
        // toast.success("Vehicle created successfully");
        showToast("Vehicle created successfully", "success");
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(
        `Failed to ${vehicleId ? "update" : "create"} vehicle: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      title={vehicleId ? "Edit Vehicle" : "Create Vehicle"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Typography variant="h6" gutterBottom>
        Vehicle Details
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          maxHeight: "calc(100vh - 200px)",
          width: "100%",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Truck Number Plate *"
            name="truckNumberPlate"
            value={formData.truckNumberPlate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.truckNumberPlate}
            helperText={errors.truckNumberPlate}
            placeholder="Enter truck number plate"
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="VIN *"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.vin}
            helperText={errors.vin}
            placeholder="Enter 17-character VIN"
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "100%" }}>
          <FormSelect
            label="Company *"
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            onBlur={handleBlur}
            options={companies}
            error={!!errors.companyId}
            helperText={errors.companyId}
            placeholder="Select an option"
          />
        </Grid>
      </Grid>
      {/* <FormSelect
        label="Vehicle Type *"
        name="vehicleTypeId"
        value={formData.vehicleTypeId}
        onChange={handleChange}
        onBlur={handleBlur}
        options={vehicleTypes}
        error={!!errors.vehicleTypeId}
        helperText={errors.vehicleTypeId}
        placeholder="Select an option"
      /> */}

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Dimensions
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          maxHeight: "calc(100vh - 200px)",
          width: "100%",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Max Weight (kg) *"
            name="maxWeight"
            value={formData.maxWeight}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.maxWeight}
            helperText={errors.maxWeight}
            placeholder="Enter max weight"
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Length (m) *"
            name="length"
            value={formData.length}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.length}
            helperText={errors.length}
            placeholder="Enter length"
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Width (m) *"
            name="width"
            value={formData.width}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.width}
            helperText={errors.width}
            placeholder="Enter width"
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Height (m) *"
            name="height"
            value={formData.height}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.height}
            helperText={errors.height}
            placeholder="Enter height"
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default VehicleForm;
