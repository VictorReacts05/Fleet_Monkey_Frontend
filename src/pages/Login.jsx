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

// Styled Components
const LoginContainer = styled(Box)(({ theme }) => ({
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
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
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

const LoginButton = styled(Button)(({ theme }) => ({
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

// Custom TextField with autofill background fix
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.mode === "dark" ? "#2c2c2c" : "#fff", // Default background
    "& input:-webkit-autofill": {
      boxShadow: "none !important", // Remove any autofill background
      backgroundColor: "transparent !important", // Ensure no background color
      WebkitTextFillColor: `${
        theme.palette.mode === "dark"
          ? theme.palette.common.white
          : theme.palette.text.primary
      } !important`, // Maintain text color
      transition: "background-color 9999s ease-out 0s", // Prevent autofill animation
    },
  },
}));

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password.trim()) {
      setError("Please enter both login ID and password");
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginId, password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
          <TruckIcon color="primary" />
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

        {error && (
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "#fff",
              bgcolor: "error.main",
              borderRadius: 1,
              p: 1,
              mb: 2,
            }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <CustomTextField
            fullWidth
            label="Login ID"
            variant="outlined"
            margin="normal"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <CustomTextField
            fullWidth
            label="Password"
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </LoginButton>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Link to="./SignUp" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary" component="span">
                Sign Up
              </Typography>
            </Link>
          </Typography>
        </form>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login;
