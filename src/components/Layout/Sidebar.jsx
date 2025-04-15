import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
/* import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings"; */
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public"; // Add this import for country icon
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import HomeIcon from '@mui/icons-material/Home';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const drawerWidth = 240;

const menuItems = [
  { text: "Sales RFQ", icon: <LocalShippingIcon />, path: "/sales-rfq" },
  /* { text: "Purchase RFQ", icon: <BusinessIcon />, path: "/purchase-rfq" },
  { text: "Sales Order", icon: <PeopleIcon />, path: "/sales-order" },
  { text: "Purchase Order", icon: <BusinessIcon />, path: "/purchase-order" },
  {
    text: "Supplier Quotation",
    icon: <BusinessIcon />,
    path: "/supplier-quotation",
  },
  { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Shipments", icon: <LocalShippingIcon />, path: "/shipments" },
  { text: "Reports", icon: <InventoryIcon />, path: "/reports" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" }, */
  { text: "Suppliers", icon: <GroupIcon />, path: "/suppliers" },
  {
    text: "Countries",
    icon: <PublicIcon />,
    path: "/countries",
  },
  {
    text: "Cities",
    icon: <LocationCityIcon />,
    path: "/cities",
  },
  {
    text: "Currencies",
    icon: <AttachMoneyIcon />,
    path: "/currencies",
  },
  {
    text: 'Companies',
    icon: <BusinessIcon />,
    path: '/companies'
  },
  {
    text: 'Certifications',
    icon: <VerifiedIcon />,
    path: '/certifications'
  },
  {
    text: 'Banks',
    icon: <AccountBalanceIcon />,
    path: '/banks'
  },
  {
    text: 'Project Parameters',
    icon: <SettingsApplicationsIcon />,
    path: '/project-parameters'
  },
  {
    text: 'Customers',
    icon: <PeopleIcon />,
    path: '/customers'
  },
  {
    text: 'Subscriptions',
    icon: <SubscriptionsIcon />,
    path: '/subscriptions'
  },
  {
    text: 'Persons',
    icon: <PersonIcon />,
    path: '/persons'
  },
  {
    text: 'Vehicles',
    icon: <DirectionsBusIcon />,
    path: '/vehicles'
  },
  {
    text: 'Warehouses',
    icon: <WarehouseIcon />,
    path: '/warehouses'
  },
  {
    text: 'Address Types',
    icon: <HomeIcon />,
    path: '/address-types'
  },
];

const Sidebar = ({ open, variant, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();

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
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper  // Changed from background.default
            : '#1976d2',
          color: theme.palette.mode === 'dark' 
            ? theme.palette.text.primary 
            : '#fff',
          top: variant === "temporary" ? 0 : 64,
          height: variant === "temporary" ? "100%" : "calc(100% - 64px)",
          borderRight: theme.palette.mode === 'dark' 
            ? `1px solid ${theme.palette.divider}` 
            : 'none',
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              component="div"
              onClick={() => navigate(item.path)}
              key={item.text}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.08)',
                },
                backgroundColor: location.pathname.startsWith(item.path)
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.2)'
                  : "transparent",
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.text.primary 
                  : '#fff' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
