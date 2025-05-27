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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import RequestQuote from '@mui/icons-material/RequestQuote';
import FindInPageSharpIcon from '@mui/icons-material/FindInPageSharp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Sales RFQ", icon: <LocalShippingIcon />, path: "/sales-rfq" },
  { text: "Purchase RFQ", icon: <ShoppingCartIcon />, path: "/purchase-rfq" },
  { text: 'Supplier Quotation', icon: <RequestQuote />, path: '/supplier-quotation' },
  { text: "Sales Quotation", icon: <FindInPageSharpIcon />, path: "/sales-quotation" },
  { text: "Sales Order", icon: <ShoppingBagIcon />, path: "/sales-order" },
  { text: "Purchase Order", icon: <ShoppingCartCheckoutIcon />, path: "/purchase-order" },
  { text: "Purchase Invoice", icon: <ReceiptIcon />, path: "/purchase-invoice" },
  { text: "Sales Invoice", icon: <ReceiptLongIcon />, path: "/sales-invoice" },
  {text: "Address Type", icon: <HomeIcon />, path: "/address-types" },
  { text: "Banks", icon: <AccountBalanceIcon />, path: "/banks" },
  { text: "Certifications", icon: <VerifiedIcon />, path: "/certifications" },
  { text: "Cities", icon: <LocationCityIcon />, path: "/cities" },
  { text: "Companies", icon: <BusinessIcon />, path: "/companies" },
  { text: "Countries", icon: <PublicIcon />, path: "/countries" },
  { text: "Currencies", icon: <AttachMoneyIcon />, path: "/currencies" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { text: "Form Roles", icon: <AssignmentIndIcon />, path: "/form-roles" },
  {
    text: "Form Role Approvers",
    icon: <AdminPanelSettingsIcon />,
    path: "/form-role-approvers",
  },
  { text: "Forms", icon: <DescriptionIcon />, path: "/forms" },
  { text: "Persons", icon: <PersonIcon />, path: "/persons" },
  {
    text: "Project Parameters",
    icon: <SettingsApplicationsIcon />,
    path: "/project-parameters",
  },
  { text: "Roles", icon: <PersonIcon />, path: "/roles" },
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

  // Update the mainMenuItems filter
  // Remove the old mainMenuItems filter
  // const mainMenuItems = menuItems.filter(
  //   (item) =>
  //     item.text === "Dashboard" ||
  //     item.text === "Sales RFQ" ||
  //     item.text === "Purchase RFQ" ||
  //     item.text === "Supplier Quotation" ||
  //     item.text === "Sales Quotation" ||
  //     item.text === "Sales Order" ||
  //     item.text === "Purchase Order" ||
  //     item.text === "Purchase Invoice" ||
  //     item.text === "Sales Invoice"
  // );
  
  // Use this as the main menu items
  const mainMenuItems = [
    menuItems.find(item => item.text === "Dashboard"),
    { text: "Masters", icon: <SettingsApplicationsIcon />, isDropdown: true },
    ...menuItems.filter(
      item =>
        item.text === "Sales RFQ" ||
        item.text === "Purchase RFQ" ||
        item.text === "Supplier Quotation" ||
        item.text === "Sales Quotation" ||
        item.text === "Sales Order" ||
        item.text === "Purchase Order" ||
        item.text === "Purchase Invoice" ||
        item.text === "Sales Invoice"
    )
  ];

  // Remove mainMenuItemstemp as it's no longer needed
  const mastersItems = menuItems.filter(
    (item) =>
      item.text !== "Dashboard" &&
      item.text !== "Sales RFQ" &&
      item.text !== "Purchase RFQ" &&
      item.text !== "Supplier Quotation" &&
      item.text !== "Sales Quotation" &&
      item.text !== "Sales Order" &&
      item.text !== "Purchase Order" &&
      item.text !== "Purchase Invoice" &&
      item.text !== "Sales Invoice"
  );

  // Update the mainMenuItems to include Masters as second item
  // Update the mainMenuItems to keep Dashboard first
  const mainMenuItemstemp = [
    menuItems.find(item => item.text === "Dashboard"),
    ...menuItems.filter(
      item =>
        item.text === "Sales RFQ" ||
        item.text === "Purchase RFQ" ||
        item.text === "Supplier Quotation" ||
        item.text === "Sales Quotation" ||
        item.text === "Sales Order" ||
        item.text === "Purchase Order" ||
        item.text === "Purchase Invoice" ||
        item.text === "Sales Invoice"
    ),
    { text: "Masters", icon: <SettingsApplicationsIcon />, isDropdown: true }
  ];

  // Paginate masters items to show 5 at a time
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mastersItems.length / itemsPerPage);
  
  const getCurrentMastersItems = () => {
    const start = currentPage * itemsPerPage;
    return mastersItems.slice(start, start + itemsPerPage);
  };

  return (
    <Drawer  variant={variant}
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
      <List>
        {mainMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.isDropdown ? handleMastersClick : () => handleMenuItemClick(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {item.isDropdown && <ArrowDropDownIcon />}
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMastersClose}
        sx={{
          '& .MuiPaper-root': {
            width: 240,
            '& .MuiMenuItem-root': {
              height: 48,
              minHeight: 48,
            },
            maxHeight: 250, // Exactly 5 items (48px * 5)
            overflowY: 'auto',
          },
        }}
      >
        {mastersItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
        
       
      </Menu>
    </Drawer>
  );
};

export default Sidebar;