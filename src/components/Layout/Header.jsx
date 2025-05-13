import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";

// Import common form components
import FormInput from "../../components/Common/FormInput";
import FormSelect from "../../components/Common/FormSelect";

const Header = ({ isMobile, onDrawerToggle, userInfo }) => {
  const { logout, isAuthenticated } = useAuth();
  const theme = useTheme();
  const mode = theme?.mode || "light";
  const toggleTheme =
    theme?.toggleTheme || (() => console.log("Theme toggle not available"));
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const isMobileView = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    emailId: "",
    loginId: "",
    password: "",
    role: "",
    companyName: "Dung Beetle Logistics",
    companyId: 48,
  });

  useEffect(() => {
    if (openUserModal) {
      fetchRoles();
    }
  }, [openUserModal]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:7000/api/roles/all");
      // Check if response has the expected structure and set roles accordingly
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setRoles(response.data.data);
      } else {
        console.error("Unexpected roles data format:", response.data);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  const handleOpenUserModal = () => {
    setOpenUserModal(true);
  };

  const handleCloseUserModal = () => {
    setOpenUserModal(false);
    setNewUser({
      firstName: "",
      lastName: "",
      middleName: "",
      emailId: "",
      loginId: "",
      password: "",
      role: "",
      companyName: "Dung Beetle Logistics",
      companyId: 48,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async () => {
    try {
      await axios.post("/api/users", newUser);
      handleCloseUserModal();
      // TODO: Show success notification
    } catch (error) {
      console.error("Error creating user:", error);
      // TODO: Show error notification
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate("/settings");
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
        }}
        elevation={0}
      >
        <Toolbar>
          {(isMobile || isMobileView) && (
            <IconButton
              color="inherit"
              onClick={onDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold", display: { xs: "none", sm: "block" } }}
            >
              Fleet Monkey
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {isAuthenticated && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 1, textTransform: "none" }}
                onClick={handleOpenUserModal}
              >
                Create New User
              </Button>
              <Tooltip
                title={
                  mode === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
              >
                <IconButton onClick={toggleTheme} sx={{ ml: 1 }}>
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton onClick={handleNotificationMenuOpen} sx={{ ml: 1 }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account">
                <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 200,
                mt: 1.5,
                borderRadius: 2,
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {userInfo?.firstName && userInfo?.lastName
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : userInfo?.loginId || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userInfo?.role || "Administrator"}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 300,
                maxWidth: 350,
                mt: 1.5,
                borderRadius: 2,
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Notifications
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationMenuClose}>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" fontWeight="medium">
                  New order received
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 minutes ago
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" fontWeight="medium">
                  Vehicle maintenance due
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 hour ago
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationMenuClose}>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" fontWeight="medium">
                  Inventory alert: Low stock
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5 hours ago
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer" }}
              >
                View all notifications
              </Typography>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* User Creation Modal */}
      <Dialog
        open={openUserModal}
        onClose={handleCloseUserModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              mt: 2,
            }}
          >
            <FormInput
              name="firstName"
              label="First Name"
              value={newUser.firstName}
              onChange={handleInputChange}
              required
              // sx={{ marginY: 0.5 }}
            />
            
            <FormInput
              name="lastName"
              label="Last Name"
              value={newUser.lastName}
              onChange={handleInputChange}
              required
              // sx={{ marginY: 0.5 }}
            />
            
            <FormInput
              name="middleName"
              label="Middle Name"
              value={newUser.middleName}
              onChange={handleInputChange}
              // sx={{ marginY: 0.5 }}
            />
            
            <FormInput
              name="emailId"
              label="Email ID"
              type="email"
              value={newUser.emailId}
              onChange={handleInputChange}
              required
              // sx={{ marginY: 0.5 }}
            />
            
            <FormInput
              name="loginId"
              label="Login ID"
              value={newUser.loginId}
              onChange={handleInputChange}
              required
              sx={{ marginY: 0.5 }}
            />
            
            <FormInput
              name="password"
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
              sx={{ marginY: 0.5 }}
            />
            
            <FormSelect
              name="role"
              label="Role"
              value={newUser.role}
              onChange={handleInputChange}
              options={Array.isArray(roles) ? roles.map(role => ({
                value: role.RoleID,
                label: role.RoleName
              })) : []}
              required
              // sx={{ marginY: 0.5 }}
            />
            
            <FormSelect
              name="companyName"
              label="Company"
              value={48}
              options={[{ value: 48, label: "Dung Beetle Logistics" }]}
              disabled={true}
              readOnly={true}
              // sx={{ marginY: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserModal}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            color="primary"
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state) => ({
  userInfo: {
    firstName: state.loginReducer?.loginDetails?.firstName,
    lastName: state.loginReducer?.loginDetails?.lastName,
    loginId:
      state.loginReducer?.loginDetails?.loginId ||
      (state.loginReducer?.loginDetails?.personId
        ? `User-${state.loginReducer.loginDetails.personId}`
        : null),
    role: state.loginReducer?.loginDetails?.role || "Administrator",
  },
});

export default connect(mapStateToProps)(Header);
