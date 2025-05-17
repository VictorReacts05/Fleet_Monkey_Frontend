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

const ForgotPasswordContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  margin: 0,
  padding: 0,
  overflow: "hidden",
  position: "fixed",
  top: 0,
  left: 0,
}));

const ForgotPasswordPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: 450,
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
      // Add logging to see what's being sent
      console.log("Sending request with email:", email);
      
      const response = await axios.post("http://localhost:7000/api/auth/forgot-password", {
        EmailID: email,
      });

      console.log("Server response:", response.data);
      
      setMessage({
        text: "Password reset link has been sent to your email",
        type: "success",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        setMessage({
          text: error.response.data?.message || 
                `Server error (${error.response.status}): Please contact support.`,
          type: "error",
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setMessage({
          text: "No response from server. Please check your connection and try again.",
          type: "error",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
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
            &copy; {new Date().getFullYear()} Fleet Monkey. All rights reserved.
          </Typography>
        </Box>
      </ForgotPasswordPaper>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;