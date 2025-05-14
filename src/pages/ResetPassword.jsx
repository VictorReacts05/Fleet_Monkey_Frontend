import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ResetPasswordContainer = styled(Box)(({ theme }) => ({
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

const ResetPasswordPaper = styled(Paper)(({ theme }) => ({
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Extract token and email from URL parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const emailParam = params.get("email");

    if (!token || !emailParam) {
      setTokenValid(false);
      setMessage({
        text: "Invalid reset link. Please request a new password reset.",
        type: "error",
      });
    } else {
      setResetToken(token);
      setEmail(emailParam);
    }
  }, [location]);

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");
    setMessage({ text: "", type: "" });

    // Validate password
    if (!newPassword) {
      setPasswordError("Password is required");
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:7000/api/auth/reset-password", {
        EmailID: email,
        resetToken: resetToken,
        newPassword: newPassword,
      });
      setMessage({
        text: "Password has been reset successfully!",
        type: "success",
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to reset password. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <ResetPasswordContainer>
      <ResetPasswordPaper elevation={6}>
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
          Reset Password
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

        {tokenValid ? (
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
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
                "Reset Password"
              )}
              
            </SubmitButton>
          </form>
        ) : (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Request New Reset Link
              </Button>
            </Link>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Back to Login
            </Button>
          </Link>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()} Fleet Monkey. All rights reserved.
          </Typography>
        </Box>
      </ResetPasswordPaper>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;