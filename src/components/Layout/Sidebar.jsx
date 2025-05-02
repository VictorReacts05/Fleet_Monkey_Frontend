import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import HomeIcon from "@mui/icons-material/Home";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import CategoryIcon from "@mui/icons-material/Category";

const drawerWidth = 240;

/* const menuItems = [
  { text: "Sales RFQ", icon: <LocalShippingIcon />, path: "/sales-rfq" },
  { text: "Suppliers", icon: <GroupIcon />, path: "/suppliers" },
  { text: "Countries", icon: <PublicIcon />, path: "/countries" },
  { text: "Cities", icon: <LocationCityIcon />, path: "/cities" },
  { text: "Currencies", icon: <AttachMoneyIcon />, path: "/currencies" },
  { text: "Companies", icon: <BusinessIcon />, path: "/companies" },
  { text: "Certifications", icon: <VerifiedIcon />, path: "/certifications" },
  { text: "Banks", icon: <AccountBalanceIcon />, path: "/banks" },
  {
    text: "Project Parameters",
    icon: <SettingsApplicationsIcon />,
    path: "/project-parameters",
  },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  {
    text: "Subscriptions",
    icon: <SubscriptionsIcon />,
    path: "/subscriptions",
  },
  { text: "Persons", icon: <PersonIcon />, path: "/persons" },
  { text: "Vehicles", icon: <DirectionsBusIcon />, path: "/vehicles" },
  { text: "Warehouses", icon: <WarehouseIcon />, path: "/warehouses" },
  { text: "Address Types", icon: <HomeIcon />, path: "/address-types" },
  {
    text: "Units of Measurement",
    icon: <CategoryIcon />,
    path: "/uoms",
  },
]; */

const menuItems = [
  { text: "Address Types", icon: <HomeIcon />, path: "/address-types" },
  { text: "Banks", icon: <AccountBalanceIcon />, path: "/banks" },
  { text: "Certifications", icon: <VerifiedIcon />, path: "/certifications" },
  { text: "Cities", icon: <LocationCityIcon />, path: "/cities" },
  { text: "Companies", icon: <BusinessIcon />, path: "/companies" },
  { text: "Countries", icon: <PublicIcon />, path: "/countries" },
  { text: "Currencies", icon: <AttachMoneyIcon />, path: "/currencies" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { text: "Persons", icon: <PersonIcon />, path: "/persons" },
  {
    text: "Project Parameters",
    icon: <SettingsApplicationsIcon />,
    path: "/project-parameters",
  },
  { text: "Sales RFQ", icon: <LocalShippingIcon />, path: "/sales-rfq" },
  {
    text: "Subscriptions",
    icon: <SubscriptionsIcon />,
    path: "/subscriptions",
  },
  { text: "Suppliers", icon: <GroupIcon />, path: "/suppliers" },
  { text: "Units of Measurement", icon: <CategoryIcon />, path: "/uoms" },
  { text: "Vehicles", icon: <DirectionsBusIcon />, path: "/vehicles" },
  { text: "Warehouses", icon: <WarehouseIcon />, path: "/warehouses" },
];


const Sidebar = ({ open, variant, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMastersClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMastersClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMastersClose();
  };

  const mastersItems = menuItems.filter((item) => item.text !== "Sales RFQ");

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#1976d2",
          color:
            theme.palette.mode === "dark" ? theme.palette.text.primary : "#fff",
          top: variant === "temporary" ? 0 : 64,
          height: variant === "temporary" ? "100%" : "calc(100% - 64px)",
          borderRight:
            theme.palette.mode === "dark"
              ? `1px solid ${theme.palette.divider}`
              : "none",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem
            component="div"
            onClick={() => navigate("/sales-rfq")}
            sx={{
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.08)",
              },
              backgroundColor: location.pathname.startsWith("/sales-rfq")
                ? theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.2)"
                : "transparent",
              cursor: "pointer",
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.primary
                    : "#fff",
              }}
            >
              <LocalShippingIcon />
            </ListItemIcon>
            <ListItemText primary="Sales RFQ" />
          </ListItem>
          <ListItem
            component="div"
            onClick={handleMastersClick}
            sx={{
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.08)",
              },
              cursor: "pointer",
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.primary
                    : "#fff",
              }}
            >
              <ArrowDropDownIcon />
            </ListItemIcon>
            <ListItemText primary="Masters" />
          </ListItem>
        </List>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMastersClose}
          PaperProps={{
            sx: {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : "#1976d2",
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.text.primary
                  : "#fff",
            },
          }}
        >
          {mastersItems.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => handleMenuItemClick(item.path)}
              sx={{
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.08)",
                },
                backgroundColor: location.pathname.startsWith(item.path)
                  ? theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.2)"
                  : "transparent",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.primary
                      : "#fff",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Drawer>
  );
};

export default Sidebar;