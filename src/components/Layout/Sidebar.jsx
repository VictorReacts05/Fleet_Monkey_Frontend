import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import RequestQuote from "@mui/icons-material/RequestQuote";
import FindInPageSharpIcon from "@mui/icons-material/FindInPageSharp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Inquiry", icon: <LocalShippingIcon />, path: "/sales-rfq" },
  {
    text: "Quotation Request",
    icon: <ShoppingCartIcon />,
    path: "/purchase-rfq",
  },
  {
    text: "Supplier Quotation",
    icon: <RequestQuote />,
    path: "/supplier-quotation",
  },
  { text: "Estimate", icon: <FindInPageSharpIcon />, path: "/sales-quotation" },
  {
    text: "Approved Estimate",
    icon: <ShoppingBagIcon />,
    path: "/sales-order",
  },
  {
    text: "Purchase Order",
    icon: <ShoppingCartCheckoutIcon />,
    path: "/purchase-order",
  },
  {
    text: "Bill",
    icon: <ReceiptIcon />,
    path: "/purchase-invoice",
  },
  { text: "Invoice", icon: <ReceiptLongIcon />, path: "/sales-invoice" },
  {
    text: "Pending Approvals",
    icon: <HourglassTopIcon />,
    path: "/pending-approvals",
  },
  { text: "Addresses", icon: <HomeIcon />, path: "/addresses" },
  { text: "Address Type", icon: <HomeIcon />, path: "/address-types" },
  { text: "Certifications", icon: <VerifiedIcon />, path: "/certifications" },
  { text: "Cities", icon: <LocationCityIcon />, path: "/cities" },
  { text: "Companies", icon: <BusinessIcon />, path: "/companies" },
  { text: "Countries", icon: <PublicIcon />, path: "/countries" },
  { text: "Currencies", icon: <AttachMoneyIcon />, path: "/currencies" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { text: "Forms", icon: <DescriptionIcon />, path: "/forms" },
  { text: "Form Roles", icon: <AssignmentIndIcon />, path: "/form-roles" },
  {
    text: "Form Role Approvers",
    icon: <AdminPanelSettingsIcon />,
    path: "/form-role-approvers",
  },
  { text: "Items", icon: <CategoryIcon />, path: "/items" },
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
  const [anchorElMasters, setAnchorElMasters] = useState(null);
  const [anchorElSales, setAnchorElSales] = useState(null);
  const [anchorElPurchase, setAnchorElPurchase] = useState(null);

  const handleMastersClick = (event) => {
    setAnchorElMasters(event.currentTarget);
  };

  const handleSalesClick = (event) => {
    setAnchorElSales(event.currentTarget);
  };

  const handlePurchaseClick = (event) => {
    setAnchorElPurchase(event.currentTarget);
  };

  const handleMastersClose = () => {
    setAnchorElMasters(null);
  };

  const handleSalesClose = () => {
    setAnchorElSales(null);
  };

  const handlePurchaseClose = () => {
    setAnchorElPurchase(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMastersClose();
    handleSalesClose();
    handlePurchaseClose();
  };

  const mainMenuItems = [
    menuItems.find((item) => item.text === "Dashboard"),
    { text: "Masters", icon: <SettingsApplicationsIcon />, isDropdown: true, onClick: handleMastersClick, anchorEl: anchorElMasters },
    { text: "Sales", icon: <ShoppingBagIcon />, isDropdown: true, onClick: handleSalesClick, anchorEl: anchorElSales },
    { text: "Purchase", icon: <ShoppingCartIcon />, isDropdown: true, onClick: handlePurchaseClick, anchorEl: anchorElPurchase },
    menuItems.find((item) => item.text === "Pending Approvals"),
  ];

  const mastersItems = menuItems.filter(
    (item) =>
      item.text !== "Dashboard" &&
      item.text !== "Inquiry" &&
      item.text !== "Quotation Request" &&
      item.text !== "Supplier Quotation" &&
      item.text !== "Estimate" &&
      item.text !== "Approved Estimate" &&
      item.text !== "Purchase Order" &&
      item.text !== "Bill" &&
      item.text !== "Invoice" &&
      item.text !== "Pending Approvals"
  );

  const salesItems = menuItems.filter(
    (item) =>
      item.text === "Inquiry" ||
      item.text === "Estimate" ||
      item.text === "Approved Estimate" ||
      item.text === "Invoice"
  );

  const purchaseItems = menuItems.filter(
    (item) =>
      item.text === "Quotation Request" ||
      item.text === "Supplier Quotation" ||
      item.text === "Purchase Order" ||
      item.text === "Bill"
  );

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
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={item.isDropdown ? item.onClick : () => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.isDropdown && <ArrowDropDownIcon />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorElMasters}
        open={Boolean(anchorElMasters)}
        onClose={handleMastersClose}
        sx={{
          "& .MuiPaper-root": {
            width: 240,
            "& .MuiMenuItem-root": {
              height: 48,
              minHeight: 48,
            },
            maxHeight: 250,
            overflowY: "auto",
          },
        }}
      >
        {mastersItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={anchorElSales}
        open={Boolean(anchorElSales)}
        onClose={handleSalesClose}
        sx={{
          "& .MuiPaper-root": {
            width: 240,
            "& .MuiMenuItem-root": {
              height: 48,
              minHeight: 48,
            },
            maxHeight: 250,
            overflowY: "auto",
          },
        }}
      >
        {salesItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={anchorElPurchase}
        open={Boolean(anchorElPurchase)}
        onClose={handlePurchaseClose}
        sx={{
          "& .MuiPaper-root": {
            width: 240,
            "& .MuiMenuItem-root": {
              height: 48,
              minHeight: 48,
            },
            maxHeight: 250,
            overflowY: "auto",
          },
        }}
      >
        {purchaseItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
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