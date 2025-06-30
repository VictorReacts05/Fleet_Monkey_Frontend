import {
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  RequestQuote,
  FindInPageSharp as FindInPageSharpIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  Receipt as ReceiptIcon,
  ReceiptLong as ReceiptLongIcon,
  HourglassTop as HourglassTopIcon,
} from "@mui/icons-material";

export const FormMenuListData = [
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
];
