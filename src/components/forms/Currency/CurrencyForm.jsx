import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { getCurrencyById } from "./currencyStorage";

const CurrencyForm = ({ currencyId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    currencyName: "",
  });

  const [errors, setErrors] = useState({
    currencyName: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Currency Name validation
    if (!formData.currencyName.trim()) {
      newErrors.currencyName = "Currency name is required";
      isValid = false;
    } else if (formData.currencyName.length < 2) {
      newErrors.currencyName = "Currency name must be at least 2 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    if (currencyId) {
      const currency = getCurrencyById(currencyId);
      if (currency) {
        setFormData({
          currencyName: currency.currencyName || "", // Ensure compatibility with existing data
        });
      }
    }
  }, [currencyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    const currencies = JSON.parse(localStorage.getItem("currencies") || "[]");

    if (currencyId) {
      const updatedCurrencies = currencies.map((currency) =>
        currency.id === currencyId ? { ...formData, id: currencyId } : currency
      );
      localStorage.setItem("currencies", JSON.stringify(updatedCurrencies));
    } else {
      const newCurrency = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "currencies",
        JSON.stringify([...currencies, newCurrency])
      );
    }

    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (isSubmitted) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <FormPage
      title={currencyId ? "Edit Currency" : "Add Currency"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Currency Name *"
        name="currencyName"
        value={formData.currencyName}
        onChange={handleChange}
        error={isSubmitted && errors.currencyName}
        helperText={isSubmitted && errors.currencyName}
      />
    </FormPage>
  );
};

export default CurrencyForm;
