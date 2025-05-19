import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { 
  createFormRoleApprover, 
  updateFormRoleApprover, 
  getFormRoleApproverById,
  fetchFormRoles,
  fetchPersons
} from "./FormRoleApproverAPI";
import { toast } from "react-toastify";
import FormSelect from "../../Common/FormSelect";
import FormCheckbox from "../../Common/FormCheckbox";
import FormPage from "../../Common/FormPage";

const FormRoleApproverForm = ({ approverID, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    FormRoleID: "",
    UserID: "",
    ActiveYN: true,
  });

  const [formRoles, setFormRoles] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        
        const rolesData = await fetchFormRoles();
        const formattedRoles = rolesData.map(role => ({
          value: role.FormRoleID,
          label: role.RoleName || `Role ${role.FormRoleID}`
        }));
        setFormRoles(formattedRoles);
        
        const personsData = await fetchPersons();
        const formattedPersons = personsData.map(person => ({
          value: person.PersonID,
          label: `${person.FirstName || ''} ${person.LastName || ''}`.trim() || `Person ${person.PersonID}`
        }));
        setPersons(formattedPersons);
        
        if (approverID) {
          await loadApprover();
        }
      } catch (error) {
        toast.error("Failed to load dropdown data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, [approverID]);

  const loadApprover = async () => {
    try {
      setLoading(true);
      const data = await getFormRoleApproverById(approverID);
      
      setFormData({
        FormRoleID: data.FormRoleID || "",
        UserID: data.UserID || "",
        ActiveYN: data.ActiveYN === true || data.ActiveYN === 1,
        RowVersionColumn: data.RowVersionColumn
      });
    } catch (error) {
      toast.error("Failed to load approver details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FormRoleID) {
      newErrors.FormRoleID = "Form Role is required";
    }

    if (!formData.UserID) {
      newErrors.UserID = "User is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      
      if (approverID) {
        await updateFormRoleApprover(approverID, formData);
        toast.success("Form Role Approver updated successfully");
      } else {
        await createFormRoleApprover(formData);
        toast.success("Form Role Approver created successfully");
      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${approverID ? "update" : "create"} form role approver: ` + 
        (error.error || error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === "ActiveYN" ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return (
    <FormPage
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap", // Allows wrapping on smaller screens
          gap: 3, // Space between input fields (24px)
          justifyContent: "flex-start", // Align items to the start
        }}
      >
        <Box
          sx={{
            flex: "1 1 300px", // Grow and shrink, minimum 300px
            maxWidth: "400px", // Optional: limit max width
          }}
        >
          <FormSelect
            name="FormRoleID"
            label="Form Role"
            value={formData.FormRoleID || ""}
            onChange={handleChange}
            options={formRoles}
            error={!!errors.FormRoleID}
            helperText={errors.FormRoleID}
            fullWidth
            sx={{ minWidth: "300px" }}
          />
        </Box>

        <Box
          sx={{
            flex: "1 1 300px", // Grow and shrink, minimum 300px
            maxWidth: "400px", // Optional: limit max width
          }}
        >
          <FormSelect
            name="UserID"
            label="Person"
            value={formData.UserID}
            onChange={handleChange}
            options = {persons}
            error={!!errors.UserID}
            helperText={errors.UserID}
            fullWidth
            sx={{ minWidth: "300px" }}
          />
        </Box>
      </Box>
    </FormPage>
  );
};

export default FormRoleApproverForm;