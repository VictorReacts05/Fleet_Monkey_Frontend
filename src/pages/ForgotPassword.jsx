import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Divider,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import APIBASEURL from "../utils/apiBaseUrl";

// Styled Components
const ForgotPasswordContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh", // Allow growth for vertical scrolling
  width: "100%", // Use 100% to respect parent container (body) width
  maxWidth: "100vw", // Prevent exceeding viewport width
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  flexDirection: "column", // Stack content vertically
  overflowY: "auto", // Enable vertical scrolling
  overflowX: "hidden", // Explicitly disable horizontal scrolling
  boxSizing: "border-box", // Ensure padding/margins are included in width
  margin: 0,
  padding: 0,
}));

const ForgotPasswordPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: 450,
  margin: theme.spacing(2), // Add margin for spacing
  boxSizing: "border-box", // Ensure width includes padding
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(4),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 8,
  fontWeight: 600,
  marginTop: theme.spacing(2),
}));

const TruckIcon = styled(LocalShippingIcon)(({ theme }) => ({
  fontSize: 60,
  marginBottom: theme.spacing(2),
  animation: "moveTruck 1s ease-in-out",
  "@keyframes moveTruck": {
    "0%": { transform: "translateX(-190px)" },
    "100%": { transform: "translateX(0)" },
  },
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setMessage({ text: "", type: "" });

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${APIBASEURL}/auth/forgot-password`, {
        EmailID: email,
      });

      setMessage({
        text: "Password reset link has been sent to your email",
        type: "success",
      });
    } catch (error) {
      if (error.response) {
        setMessage({
          text:
            error.response.data?.message ||
            `Server error (${error.response.status}): Please contact support.`,
          type: "error",
        });
      } else if (error.request) {
        setMessage({
          text: "No response from server. Please check your connection and try again.",
          type: "error",
        });
      } else {
        setMessage({
          text: "Failed to send request. Please try again later.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordPaper elevation={6}>
        <LogoBox>
          <TruckIcon color="primary" />
          <Typography variant="h4" fontWeight="bold" color="primary">
            Fleet Monkey
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fleet Management System
          </Typography>
        </LogoBox>

        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password
        </Typography>

        <Divider sx={{ my: 2 }} />

        {message.text && (
          <Typography
            color={message.type === "success" ? "success.main" : "error"}
            variant="body2"
            align="center"
            sx={{ mb: 2, p: 1, bgcolor: "white", borderRadius: 1 }}
          >
            {message.text}
          </Typography>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reset Link"
            )}
          </SubmitButton>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button
                startIcon={<ArrowBackIcon />}
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Link>
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} Fleet Monkey. All rights reserved.
          </Typography>
        </Box>
      </ForgotPasswordPaper>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
