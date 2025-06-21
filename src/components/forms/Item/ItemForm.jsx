import React, { useState, useEffect } from "react";
import FormPage from "../../common/FormPage";
import FormInput from "../../common/FormInput";
import { toast } from "react-toastify";
import { createItem, updateItem, getItemById } from "./ItemAPI";
import { Grid } from "@mui/material";

const ItemForm = ({ itemId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    ItemCode: "",
    ItemName: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (itemId) {
          setLoading(true);
          const itemData = await getItemById(itemId);
          if (itemData) {
            setFormData({
              ItemCode: itemData.ItemCode || "",
              ItemName: itemData.ItemName || "",
              RowVersionColumn: itemData.RowVersionColumn || null,
            });
          }
        }
      } catch (error) {
        console.error("Error loading item data:", error);
        toast.error("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "ItemCode":
        if (!value) {
          error = "Item Code is required";
        } else if (value.length < 3) {
          error = "Item Code must be at least 3 characters";
        } else if (value.length > 50) {
          error = "Item Code must be 50 characters or less";
        } else if (!/^[a-zA-Z0-9-]+$/.test(value)) {
          error = "Item Code can only contain letters, numbers, and hyphens";
        }
        break;

      case "ItemName":
        if (!value) {
          error = "Item Name is required";
        } else if (value.length < 3) {
          error = "Item Name must be at least 3 characters";
        } else if (value.length > 100) {
          error = "Item Name must be 100 characters or less";
        } else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
          error =
            "Item Name can only contain letters, numbers, spaces, and &.,'-";
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
    validationErrors.ItemCode = validateField("ItemCode", formData.ItemCode)
      ? ""
      : errors.ItemCode || "Item Code is required";
    validationErrors.ItemName = validateField("ItemName", formData.ItemName)
      ? ""
      : errors.ItemName || "Item Name is required";

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
      if (itemId) {
        await updateItem(itemId, formData);
        toast.success("Item updated successfully");
      } else {
        await createItem(formData);
        toast.success("Item created successfully");
      }
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(
        `Failed to ${itemId ? "update" : "create"} item: ${
          error.message || error
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      title={""}
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={onClose}
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
            label="Item Code"
            name="ItemCode"
            value={formData.ItemCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.ItemCode}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Item Name"
            name="ItemName"
            value={formData.ItemName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.ItemName}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default ItemForm;
