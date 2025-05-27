import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import FormTextArea from "../../Common/FormTextArea";
import {
  fetchBillingFrequencies,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "./SubscriptionAPI";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";

const SubscriptionForm = ({ subscriptionId, onSave, onClose }) => {
  const [billingFrequencies, setBillingFrequencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    SubscriptionPlanName: "",
    Description: "",
    Fees: "",
    BillingFrequencyID: "",
    DaysInFrequency: "",
  });

  const [errors, setErrors] = useState({
    SubscriptionPlanName: "",
    Description: "",
    Fees: "",
    BillingFrequencyID: "",
    DaysInFrequency: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const frequenciesResponse = await fetchBillingFrequencies();
        console.log("Billing frequencies raw response:", frequenciesResponse);

        let frequencyData = [];
        if (Array.isArray(frequenciesResponse)) {
          frequencyData = frequenciesResponse;
        } else if (frequenciesResponse.data) {
          frequencyData = frequenciesResponse.data;
        }

        console.log("Processed frequency data:", frequencyData);

        // If we still don't have data, use fallback options
        if (!frequencyData || frequencyData.length === 0) {
          frequencyData = [
            { BillingFrequencyID: 1, BillingFrequencyName: "Weekly" },
            { BillingFrequencyID: 2, BillingFrequencyName: "Biweekly" },
            { BillingFrequencyID: 3, BillingFrequencyName: "Monthly" },
            { BillingFrequencyID: 4, BillingFrequencyName: "Quarterly" },
            { BillingFrequencyID: 5, BillingFrequencyName: "Annually" }
          ];
        }

        const frequencyOptions = frequencyData.map((frequency) => ({
          value: frequency.BillingFrequencyID.toString(),
          label: frequency.BillingFrequencyName || "Unnamed Frequency",
        }));

        console.log("Final frequency options:", frequencyOptions);

        setBillingFrequencies([
          { value: "", label: "Select an option", disabled: true },
          ...frequencyOptions,
        ]);

        if (subscriptionId) {
          const subscriptionResponse = await getSubscriptionPlanById(subscriptionId);
          const subscription =
            subscriptionResponse.data?.data ||
            subscriptionResponse.data ||
            subscriptionResponse;

          setFormData({
            SubscriptionPlanName: subscription?.SubscriptionPlanName || "",
            Description: subscription?.Description || "",
            Fees: subscription?.Fees ? subscription.Fees.toString() : "",
            BillingFrequencyID: subscription?.BillingFrequencyID?.toString() || "",
            DaysInFrequency: subscription?.DaysInFrequency?.toString() || "",
            RowVersionColumn: subscription?.RowVersionColumn || null,
          });
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error(
          "Failed to load dropdown data: " + (error.message || "Unknown error")
        );

        // Set fallback options if we have no billing frequencies
        if (billingFrequencies.length === 0) {
          setBillingFrequencies([
            { value: "", label: "Select an option", disabled: true },
            { value: "1", label: "Weekly" },
            { value: "2", label: "Biweekly" },
            { value: "3", label: "Monthly" },
            { value: "4", label: "Quarterly" },
            { value: "5", label: "Annually" }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [subscriptionId]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "SubscriptionPlanName":
        if (!value.trim()) {
          error = "Plan Name is required";
        } else if (value.length > 50) {
          error = "Plan Name must be 50 characters or less";
        } else if (value.length < 3) {
          error = "Plan Name must be at least 3 characters";
        }
        break;

      case "Description":
        if (!value.trim()) {
          error = "Description is required";
        } else if (value.length > 200) {
          error = "Description must be 200 characters or less";
        } else if (value.length < 3) {
          error = "Description must be at least 3 characters";
        }
        break;

      case "Fees":
        if (!value.trim()) {
          error = "Fees is required";
        } else if (isNaN(value) || Number(value) < 0) {
          error = "Fees must be a positive number";
        }
        break;

      case "BillingFrequencyID":
        if (!value) {
          error = "Billing Frequency is required";
        } else if (
          !billingFrequencies.some(
            (frequency) => frequency.value === value && !frequency.disabled
          )
        ) {
          error = "Invalid billing frequency selected";
        }
        break;

      case "DaysInFrequency":
        if (!value.trim()) {
          error = "Days in Frequency is required";
        } else if (isNaN(value) || Number(value) <= 0 || !Number.isInteger(Number(value))) {
          error = "Days in Frequency must be a positive integer";
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

    validationErrors.SubscriptionPlanName = validateField(
      "SubscriptionPlanName",
      formData.SubscriptionPlanName
    )
      ? ""
      : errors.SubscriptionPlanName || "Plan Name is required";
    validationErrors.Description = validateField("Description", formData.Description)
      ? ""
      : errors.Description || "Description is required";
    validationErrors.Fees = validateField("Fees", formData.Fees)
      ? ""
      : errors.Fees || "Fees is required";
    validationErrors.BillingFrequencyID = validateField("BillingFrequencyID", formData.BillingFrequencyID)
      ? ""
      : errors.BillingFrequencyID || "Billing Frequency is required";
    validationErrors.DaysInFrequency = validateField("DaysInFrequency", formData.DaysInFrequency)
      ? ""
      : errors.DaysInFrequency || "Days in Frequency is required";

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

      // Get user data from localStorage to retrieve personId
      const user = JSON.parse(localStorage.getItem("user"));
      const personId = user?.personId || user?.id || user?.userId;
      
      if (!personId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const payload = {
        SubscriptionPlanName: formData.SubscriptionPlanName,
        Description: formData.Description,
        Fees: formData.Fees ? Number(formData.Fees) : 0,
        BillingFrequencyID: formData.BillingFrequencyID,
        DaysInFrequency: formData.DaysInFrequency ? Number(formData.DaysInFrequency) : 0,
      };

      if (formData.RowVersionColumn) {
        payload.RowVersionColumn = formData.RowVersionColumn;
      }

      if (subscriptionId) {
        await updateSubscriptionPlan(subscriptionId, payload);
        toast.success("Subscription plan updated successfully");
      } else {
        await createSubscriptionPlan(payload);
        toast.success("Subscription plan created successfully");
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      toast.error(
        `Failed to ${subscriptionId ? "update" : "create"} subscription plan: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      title={""}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
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
            required
            label="Plan Name"
            name="SubscriptionPlanName"
            value={formData.SubscriptionPlanName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.SubscriptionPlanName}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormTextArea
            required
            label="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.Description}
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Fees"
            name="Fees"
            value={formData.Fees}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.Fees}
            type="number"
            InputProps={{
              startAdornment: "$",
            }}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            required
            label="Billing Frequency"
            name="BillingFrequencyID"
            value={formData.BillingFrequencyID}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.BillingFrequencyID}
            helperText={errors.BillingFrequencyID}
            options={billingFrequencies}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Days in Frequency"
            name="DaysInFrequency"
            value={formData.DaysInFrequency}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.DaysInFrequency}
            type="number"
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default SubscriptionForm;