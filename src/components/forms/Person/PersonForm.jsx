import React, { useState, useEffect } from "react";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
// import { getPersonById } from "./personStorage";
// import { getCompanies } from "../Company/companyStorage";
import FormDatePicker from "../../Common/FormDatePicker";
import dayjs from "dayjs";

const PersonForm = ({ personId, onSave, onClose }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    middleName: "",
    lastName: "",
    salutation: "",
    designation: "",
    gender: "",
    dob: null, // Store as dayjs object or null
    joiningDate: null, // Store as dayjs object or null
    companyId: "",
  });

  // Initialize error state
  const [errors, setErrors] = useState({
    role: "",
    firstName: "",
    lastName: "",
    salutation: "",
    designation: "",
    gender: "",
    dob: "",
    joiningDate: "",
    companyId: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Define static options
  const roles = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "employee", label: "Employee" },
  ];

  const salutations = [
    { value: "Mr.", label: "Mr." },
    { value: "Ms.", label: "Ms." },
  ];

  // Load initial data
  useEffect(() => {
    // Fetch companies
    setCompanies(
      getCompanies().map((company) => ({
        value: company.id,
        label: company.companyName,
      }))
    );

    // Load person data if editing
    if (personId) {
      const person = getPersonById(personId);
      if (person) {
        setFormData({
          role: person.role || "",
          firstName: person.firstName || "",
          middleName: person.middleName || "",
          lastName: person.lastName || "",
          salutation: person.salutation || "",
          designation: person.designation || "",
          gender: person.gender || "",
          dob: person.dob ? dayjs(person.dob) : null, // Parse stored date
          joiningDate: person.joiningDate ? dayjs(person.joiningDate) : null, // Parse stored date
          companyId: person.companyId || "",
        });
      }
    }
  }, [personId]);

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Role
    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    } else {
      newErrors.role = "";
    }

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.firstName = "";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.lastName = "";
    }

    // Salutation
    if (!formData.salutation) {
      newErrors.salutation = "Salutation is required";
      isValid = false;
    } else {
      newErrors.salutation = "";
    }

    // Designation
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      isValid = false;
    } else if (formData.designation.length < 2) {
      newErrors.designation = "Designation must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.designation = "";
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    } else {
      newErrors.gender = "";
    }

    // Date of Birth
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
      isValid = false;
    } else if (dayjs(formData.dob).isAfter(dayjs(), "day")) {
      newErrors.dob = "Date of birth cannot be in the future";
      isValid = false;
    } else {
      newErrors.dob = "";
    }

    // Joining Date
    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
      isValid = false;
    } else if (
      formData.dob &&
      dayjs(formData.joiningDate).isBefore(formData.dob, "day")
    ) {
      newErrors.joiningDate = "Joining date cannot be before date of birth";
      isValid = false;
    } else {
      newErrors.joiningDate = "";
    }

    // Company
    if (!formData.companyId) {
      newErrors.companyId = "Company is required";
      isValid = false;
    } else {
      newErrors.companyId = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      const persons = JSON.parse(localStorage.getItem("persons") || "[]");
      const formattedData = {
        ...formData,
        dob: formData.dob ? formData.dob.format("YYYY-MM-DD") : null,
        joiningDate: formData.joiningDate
          ? formData.joiningDate.format("YYYY-MM-DD")
          : null,
      };

      if (personId) {
        // Update existing person
        const updatedPersons = persons.map((person) =>
          person.id === personId ? { ...formattedData, id: personId } : person
        );
        localStorage.setItem("persons", JSON.stringify(updatedPersons));
      } else {
        // Add new person
        const newPerson = {
          ...formattedData,
          id: Date.now(),
        };
        localStorage.setItem(
          "persons",
          JSON.stringify([...persons, newPerson])
        );
      }

      onSave();
    } catch (error) {
      console.error("Error saving person:", error);
    }
  };

  // Handle text/select input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date, // Store dayjs object or null
    }));
  };

  return (
    <FormPage
      title={personId ? "Edit Person" : "Add Person"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormSelect
        label="Person Role *"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roles}
        error={isSubmitted && errors.role}
        helperText={isSubmitted && errors.role}
      />
      <FormInput
        label="First Name *"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={isSubmitted && errors.firstName}
        helperText={isSubmitted && errors.firstName}
      />
      <FormInput
        label="Middle Name"
        name="middleName"
        value={formData.middleName}
        onChange={handleChange}
      />
      <FormInput
        label="Last Name *"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={isSubmitted && errors.lastName}
        helperText={isSubmitted && errors.lastName}
      />
      <FormSelect
        label="Salutation *"
        name="salutation"
        value={formData.salutation}
        onChange={handleChange}
        options={salutations}
        error={isSubmitted && errors.salutation}
        helperText={isSubmitted && errors.salutation}
      />
      <FormInput
        label="Designation *"
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
        label="Date of Birth *"
        name="dob"
        value={formData.dob} // Pass dayjs object or null
        onChange={(date) => handleDateChange("dob", date)}
        error={isSubmitted && errors.dob}
        helperText={isSubmitted && errors.dob}
      />
      <FormDatePicker
        label="Joining Date *"
        name="joiningDate"
        value={formData.joiningDate} // Pass dayjs object or null
        onChange={(date) => handleDateChange("joiningDate", date)}
        error={isSubmitted && errors.joiningDate}
        helperText={isSubmitted && errors.joiningDate}
      />
      <FormSelect
        label="Select Company *"
        name="companyId"
        value={formData.companyId}
        onChange={handleChange}
        options={companies}
        error={isSubmitted && errors.companyId}
        helperText={isSubmitted && errors.companyId}
      />
    </FormPage>
  );
};

export default PersonForm;
