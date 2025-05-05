import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const LoginContainer = styled(Box)(({ theme }) => ({
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

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    backgroundColor: "#595959", // Your custom background
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      color: theme.palette.common.white, // white text for contrast
    },
    "& fieldset": {
      borderColor: "#8a8a8a", // optional: adjust border color
    },
    "&:hover fieldset": {
      borderColor: "#a0a0a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    // Autofill override
    "& input:-webkit-autofill": {
      boxShadow: "0 0 0 1000px #595959 inset !important",
      WebkitTextFillColor: "white !important",
      transition: "background-color 9999s ease-out 0s",
    },
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    color: "#dcdcdc",
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
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

const LoginButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 8,
  fontWeight: 600,
  marginTop: theme.spacing(2),
}));

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginIdError, setLoginIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    setLoginIdError("");
    setPasswordError("");
    setFormError("");

    if (!loginId.trim()) {
      setLoginIdError("Login ID is required.");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters.");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      const result = await login(loginId, password);
      if (!result.success) {
        setFormError(result.error || "Invalid credentials.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      <LoginPaper elevation={6}>
        <LogoBox>
          <LocalShippingIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="primary">
            Fleet Monkey
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fleet Management System
          </Typography>
        </LogoBox>

        <Typography variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        <Divider sx={{ my: 2 }} />

        {formError && (
          <Typography
            color="error"
            variant="body2"
            align="center"
            sx={{ mb: 2, p: 1, bgcolor: "white", borderRadius: 1 }}
          >
            {formError}
          </Typography>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Login ID"
            variant="outlined"
            margin="normal"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            error={!!loginIdError}
            helperText={loginIdError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Forgot password?
              </Typography>
            </Link>
          </Grid>

          <LoginButton
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
              "Sign In"
            )}
          </LoginButton>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()} Fleet Monkey. All rights reserved.
          </Typography>
        </Box>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login;
