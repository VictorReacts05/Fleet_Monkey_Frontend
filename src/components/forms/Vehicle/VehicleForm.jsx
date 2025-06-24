// Remove vehicle type related imports
import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import FormInput from "../../common/FormInput";
import FormSelect from "../../common/FormSelect";
import FormPage from "../../common/FormPage";
import {
  fetchCompanies,
  getVehicleById,
  createVehicle,
  updateVehicle,
} from "./VehicleAPI";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification"; // Add this import

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
        console.log("vehicleId prop:", vehicleId); // Debug vehicleId
        if (vehicleId) {
          console.log("Fetching vehicle by ID...");
          const vehicleResponse = await getVehicleById(vehicleId);
          console.log("Raw vehicleResponse:", vehicleResponse);

          const vehicle =
            vehicleResponse.data?.data ||
            vehicleResponse.data ||
            vehicleResponse;

          console.log("Parsed vehicle object:", vehicle); // <-- Debug log

          setFormData({
            truckNumberPlate: vehicle?.TruckNumberPlate || "",
            vin: vehicle?.VIN || "",
            companyId: vehicle?.CompanyID?.toString() || "",
            maxWeight: vehicle?.MaxWeight !== null && vehicle?.MaxWeight !== undefined ? vehicle.MaxWeight.toString() : "",
            length: vehicle?.Length !== null && vehicle?.Length !== undefined ? vehicle.Length.toString() : "",
            width: vehicle?.Width !== null && vehicle?.Width !== undefined ? vehicle.Width.toString() : "",
            height: vehicle?.Height !== null && vehicle?.Height !== undefined ? vehicle.Height.toString() : "",
          });
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        console.log(
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
    if (e?.preventDefault) e.preventDefault();
    
    setIsSubmitted(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const personId = user?.personId || user?.id || user?.userId;
      
      if (!personId) {
        throw new Error("You must be logged in to save a vehicle");
      }

      const payload = {
        ...formData,
        companyId: Number(formData.companyId),
        maxWeight: Number(formData.maxWeight),
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
        createdById: Number(personId)
      };

      if (vehicleId) {
        await updateVehicle(vehicleId, payload);
        
      toast.success("Vehicle Updated successfully");
      } else {
        await createVehicle(payload);
        
      toast.success("Vehicle Created successfully");
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      console.log(error.message || 'Failed to save vehicle');
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
        <Grid item xs={12} sx={{ width: "48.3%" }}>
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
