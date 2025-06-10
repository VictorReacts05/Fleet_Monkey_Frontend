import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import axios from "axios";
import {
  createAddressType,
  updateAddressType,
  getAddressTypeById,
} from "./AddressTypeAPI";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";
import APIBASEURL from "../../../utils/apiBaseUrl";

const AddressTypeForm = ({ addressTypeId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    addressType: "",
  });

  const [errors, setErrors] = useState({
    addressType: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (addressTypeId) {
      loadAddressType();
    }
  }, [addressTypeId]);

  const loadAddressType = async () => {
    try {
      setLoading(true);
      const response = await getAddressTypeById(addressTypeId);
      console.log("Loaded address type response:", response);

      const addressTypeData = response.AddressTypeID
        ? response
        : response.data
        ? Array.isArray(response.data)
          ? response.data[0]
          : response.data
        : response;

      setFormData({
        addressType:
          addressTypeData.AddressType || addressTypeData.addressType || "",
      });
    } catch (error) {
      console.error("Error loading address type:", error);
      toast.error(
        error.message ||
          "Failed to load address type details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getValidationError = (field, value) => {
    switch (field) {
      case "addressType":
        if (!value.trim()) {
          return "Address type name is required";
        } else if (value.length < 2) {
          return "Address type name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s-]+$/.test(value)) {
          return "Address type name can only contain letters, spaces, and hyphens";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      addressType: getValidationError("addressType", formData.addressType),
    };

    setErrors(newErrors);
    return !newErrors.addressType;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem("user")) || {};
        const personId = user?.personId || user?.id || user?.userId;
        const token = user?.token || localStorage.getItem("token");

        if (!personId) {
          throw new Error("User ID not found. Please log in again.");
        }

        // Prepare payload with both possible field names to handle backend variations
        const payload = {
          AddressType: formData.addressType.trim(),
          addressType: formData.addressType.trim(), // Include for case sensitivity
          CreatedByID: Number(personId),
          createdById: Number(personId), // Include for case sensitivity
        };

        console.log("Submitting payload:", payload);
        console.log("Token exists:", !!token);
        if (token) {
          console.log("Token preview:", token.substring(0, 10) + "...");
        } else {
          console.log("Token not found, using API functions instead");
        }

        if (!token) {
          if (addressTypeId) {
            await updateAddressType(addressTypeId, payload);
          } else {
            await createAddressType(payload);
          }
        } else {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          console.log("Sending request to:", `${APIBASEURL}/address-types`);
          if (addressTypeId) {
            const response = await axios.put(
              `${APIBASEURL}/address-types/${addressTypeId}`,
              payload,
              { headers }
            );
            console.log("Update response:", response.data);
          } else {
            const response = await axios.post(
              `${APIBASEURL}/address-types`,
              payload,
              { headers }
            );
            console.log("Create response:", response.data);
          }
        }

        toast.success(
          `Address type ${addressTypeId ? "updated" : "created"} successfully`
        );
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error("Error saving address type:", error);
        // Enhanced error logging
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });
        toast.error(
          `Failed to ${
            addressTypeId ? "update" : "create"
          } address type: ${errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: getValidationError(name, value),
      }));
    }
  };

  return (
    <FormPage onSubmit={handleSubmit} onCancel={onClose} loading={loading}>
      <FormInput
        label="Address Type Name"
        name="addressType"
        value={formData.addressType}
        onChange={handleChange}
        error={errors.addressType}
        required
      />
    </FormPage>
  );
};

export default AddressTypeForm;
