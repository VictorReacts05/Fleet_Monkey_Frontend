import React, { useState, useEffect } from "react";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";
import dayjs from "dayjs";
import { format } from 'date-fns';

const VehicleForm = ({ vehicleId, onSave, onClose }) => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    numberPlate: "",
    vin: "",
    companyId: "",
    lastName: "",
    salutation: "",
    designation: "",
    gender: "",
    dob: null,
    joiningDate: null,
    companyId2: "",
  });

  const [errors, setErrors] = useState({
    numberPlate: "",
    vin: "",
    companyId: "",
    lastName: "",
    salutation: "",
    designation: "",
    gender: "",
    dob: "",
    joiningDate: "",
    companyId2: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Predefined salutation options
  const salutationOptions = [
    { value: "Ms.", label: "Ms." },
    { value: "Mr.", label: "Mr." },
  ];

  useEffect(() => {
    // Load companies
    const storedCompanies = JSON.parse(
      localStorage.getItem("companies") || "[]"
    );
    const formattedCompanies = storedCompanies.map((company) => ({
      value: company.id,
      label: company.companyName,
    }));
    setCompanies(formattedCompanies);

    // Load vehicle data for editing
    if (vehicleId) {
      const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]");
      const vehicle = vehicles.find((v) => v.id === Number(vehicleId));
      if (vehicle) {
        setFormData({
          ...vehicle,
          numberPlate: vehicle.numberPlate || "",
          vin: vehicle.vin || "",
          companyId: vehicle.companyId || "",
          lastName: vehicle.lastName || "",
          salutation: vehicle.salutation || "",
          designation: vehicle.designation || "",
          gender: vehicle.gender || "",
          dob: vehicle.dob ? dayjs(vehicle.dob) : null,
          joiningDate: vehicle.joiningDate ? dayjs(vehicle.joiningDate) : null,
          companyId2: vehicle.companyId2 || "",
        });
      } else {
        console.warn(`Vehicle with ID ${vehicleId} not found`);
      }
    }
  }, [vehicleId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    const currentDate = dayjs();

    // Truck Number Plate validation
    if (!formData.numberPlate.trim()) {
      newErrors.numberPlate = "Truck number plate is required";
      isValid = false;
    } else if (!/^[A-Z0-9\s-]{5,}$/i.test(formData.numberPlate)) {
      newErrors.numberPlate =
        "Please enter a valid truck number plate (min 5 characters)";
      isValid = false;
    }

    // VIN validation
    if (!formData.vin.trim()) {
      newErrors.vin = "VIN is required";
      isValid = false;
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(formData.vin)) {
      newErrors.vin = "Please enter a valid 17-character VIN";
      isValid = false;
    }

    // Company 1 validation
    if (!formData.companyId) {
      newErrors.companyId = "Company is required";
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.lastName)) {
      newErrors.lastName =
        "Last name must be at least 2 characters (letters only)";
      isValid = false;
    }

    // Salutation validation
    if (!formData.salutation) {
      newErrors.salutation = "Salutation is required";
      isValid = false;
    }

    // Designation validation
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      isValid = false;
    } else if (formData.designation.length < 2) {
      newErrors.designation = "Designation must be at least 2 characters";
      isValid = false;
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    // DOB validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
      isValid = false;
    } else if (dayjs(formData.dob).isAfter(currentDate, "day")) {
      newErrors.dob = "Date of birth cannot be in the future";
      isValid = false;
    } else if (dayjs().diff(formData.dob, "year") < 18) {
      newErrors.dob = "Must be at least 18 years old";
      isValid = false;
    }

    // Joining Date validation
    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
      isValid = false;
    } else if (dayjs(formData.joiningDate).isBefore(formData.dob, "day")) {
      newErrors.joiningDate = "Joining date cannot be before date of birth";
      isValid = false;
    } else if (dayjs(formData.joiningDate).isAfter(currentDate, "day")) {
      newErrors.joiningDate = "Joining date cannot be in the future";
      isValid = false;
    }

    // Company 2 validation
    if (!formData.companyId2) {
      newErrors.companyId2 = "Second company is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitted(true);
      
      if (!validateForm()) {
        return;
      }
  
      const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      const formattedData = {
        ...formData,
        dob: formData.dob ? format(formData.dob, 'yyyy-MM-dd') : null
      };
      
      if (vehicleId) {
        const updatedVehicles = vehicles.map(vehicle =>
          vehicle.id === vehicleId ? { ...formattedData, id: vehicleId } : vehicle
        );
        localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      } else {
        const newVehicle = {
          ...formattedData,
          id: Date.now()
        };
        localStorage.setItem('vehicles', JSON.stringify([...vehicles, newVehicle]));
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  return (
    <FormPage
      title={vehicleId ? "Edit Vehicle/Driver Info" : "Add Vehicle/Driver Info"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Truck Number Plate"
        name="numberPlate"
        value={formData.numberPlate}
        onChange={handleChange}
        error={isSubmitted && errors.numberPlate}
        helperText={isSubmitted && errors.numberPlate}
      />
      <FormInput
        label="Vehicle Identification Number (VIN)"
        name="vin"
        value={formData.vin}
        onChange={handleChange}
        error={isSubmitted && errors.vin}
        helperText={isSubmitted && errors.vin}
      />
      <FormSelect
        label="Select Company"
        name="companyId"
        value={formData.companyId}
        onChange={handleChange}
        options={companies}
        error={isSubmitted && errors.companyId}
        helperText={isSubmitted && errors.companyId}
      />
      <FormInput
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={isSubmitted && errors.lastName}
        helperText={isSubmitted && errors.lastName}
      />
      <FormSelect
        label="Salutation"
        name="salutation"
        value={formData.salutation}
        onChange={handleChange}
        options={salutationOptions}
        error={isSubmitted && errors.salutation}
        helperText={isSubmitted && errors.salutation}
      />
      <FormInput
        label="Designation"
        name="designation"
        value={formData.designation}
        onChange={handleChange}
        error={isSubmitted && errors.designation}
        helperText={isSubmitted && errors.designation}
      />
      <RadioGroup
        row
        name="gender"
        value={formData.gender}
        onChange={handleChange}
      >
        <FormControlLabel value="male" control={<Radio />} label="Male" />
        <FormControlLabel value="female" control={<Radio />} label="Female" />
      </RadioGroup>
      {isSubmitted && errors.gender && (
        <p style={{ color: "red", fontSize: "12px" }}>{errors.gender}</p>
      )}
      <FormDatePicker
        label="Date of Birth"
        name="dob"
        value={formData.dob}
        onChange={(date) => handleDateChange("dob", date)}
        error={isSubmitted && errors.dob}
        helperText={isSubmitted && errors.dob}
      />
      <FormDatePicker
        label="Joining Date"
        name="joiningDate"
        value={formData.joiningDate}
        onChange={(date) => handleDateChange("joiningDate", date)}
        error={isSubmitted && errors.joiningDate}
        helperText={isSubmitted && errors.joiningDate}
      />
      <FormSelect
        label="Select Second Company"
        name="companyId2"
        value={formData.companyId2}
        onChange={handleChange}
        options={companies}
        error={isSubmitted && errors.companyId2}
        helperText={isSubmitted && errors.companyId2}
      />
    </FormPage>
  );
};

export default VehicleForm;
