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
import { useSelector } from "react-redux";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { MasterMenuItemList } from "../Common/MasterPagesList";
import { FormMenuListData } from "../Common/FormMenuListData";

const drawerWidth = 240;

const Sidebar = ({ open, variant, onClose }) => {
  const menuData = useSelector((state) => state.accessMenu.accessMenuData);

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

const tableNameToMenuTextMap = {
  "Sales RFQ": "Inquiry",
  "Purchase RFQ": "Quotation Request",
  "Sales Quotation": "Estimate",
  "Sales Order": "Approved Estimate",
  "Purchase Invoice": "Bill",
  "Sales Invoice": "Invoice",
  "Supplier Quotation": "Supplier Quotation",
  "Purchase Order": "Purchase Order",
};

  const mainMenuItems = [
    FormMenuListData.find((item) => item.text === "Dashboard"),
    {
      text: "Masters",
      icon: <SettingsApplicationsIcon />,
      isDropdown: true,
      onClick: handleMastersClick,
      anchorEl: anchorElMasters,
    },
    {
      text: "Sales",
      icon: <ShoppingBagIcon />,
      isDropdown: true,
      onClick: handleSalesClick,
      anchorEl: anchorElSales,
    },
    {
      text: "Purchase",
      icon: <ShoppingCartIcon />,
      isDropdown: true,
      onClick: handlePurchaseClick,
      anchorEl: anchorElPurchase,
    },
    FormMenuListData.find((item) => item.text === "Pending Approvals"),
  ];

  const allowedMasterTables = new Set(
    menuData?.masterTables
      .filter((item) => item.permissions?.read)
      .map((item) => item.tableName.toLowerCase())
  );

  const visibleMastersItems = MasterMenuItemList.filter((item) =>
    allowedMasterTables.has(item.tableKey.toLowerCase())
  );

  const getNormalizedKey = (text) =>
  text.trim().toLowerCase().replace(/\s+/g, "");

const allowedFormNames = new Set(
  (menuData?.tables || [])
    .filter((item) => item.permissions?.read)
    .map((item) => getNormalizedKey(tableNameToMenuTextMap[item.tableName] || item.tableName))
);

 const salesItemList = FormMenuListData.filter((item) => {
  const normalized = getNormalizedKey(item.text);
  return (
    ["inquiry", "estimate", "approvedestimate", "invoice"].includes(normalized) &&
    allowedFormNames.has(normalized)
  );
});

const purchaseItemList = FormMenuListData.filter((item) => {
  const normalized = getNormalizedKey(item.text);
  return (
    ["quotationrequest", "supplierquotation", "purchaseorder", "bill"].includes(normalized) &&
    allowedFormNames.has(normalized)
  );
});

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
              onClick={
                item.isDropdown
                  ? item.onClick
                  : () => handleMenuItemClick(item.path)
              }
              selected={location.pathname === item.path}
              sx={{
                backgroundColor:
                  location.pathname === item.path
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
                color: location.pathname === item.path ? "white" : "white",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#ffffff" : "#e0e0e0",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.isDropdown && <ArrowDropDownIcon />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {visibleMastersItems?.length > 0 && (
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
          {visibleMastersItems.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor:
                  location.pathname === item.path
                    ? theme.palette.action.selected
                    : "transparent",
                color:
                  location.pathname === item.path
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </Menu>
      )}

      {salesItemList.length > 0 && (
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
          {salesItemList.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor:
                  location.pathname === item.path
                    ? theme.palette.action.selected
                    : "transparent",
                color:
                  location.pathname === item.path
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </Menu>
      )}
      {purchaseItemList.length > 0 && (
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
          {purchaseItemList.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor:
                  location.pathname === item.path
                    ? theme.palette.action.selected
                    : "transparent",
                color:
                  location.pathname === item.path
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </Menu>
      )}
    </Drawer>
  );
};

export default Sidebar;
