import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import SalesRFQForm from "./components/forms/SalesRFQ/SalesRFQForm";
import SalesRFQList from "./components/forms/SalesRFQ/SalesRFQList";
import SalesRFQPage from "./components/forms/SalesRFQ/SalesRFQPage";
import Dashboard from "./components/Dashboard/Dashboard"; // Import the Dashboard component
import { ToastContainer } from "react-toastify"; // Add this import for ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Also import the CSS for toast notifications
import RolesList from "./components/forms/Role/RolesList";
import { FormRoleApproverList } from "./components/forms/FormRoleApprover";
import FormList from "./components/forms/Form/FormList";
import { FormRoleList } from "./components/forms/FormRole";
import PurchaseRFQList from "./components/forms/PurchaseRFQ/PurchaseRFQList";
import PurchaseRFQPage from "./components/forms/PurchaseRFQ/PurchaseRFQPage";
import PurchaseRFQForm from "./components/forms/PurchaseRFQ/PurchaseRFQForm";
// Import Supplier Quotation components
import {
  SupplierQuotationList,
  SupplierQuotationForm,
} from "./components/forms/SupplierQuotation";
import CustomerList from "./components/forms/Customer/CustomerList";
import CompanyList from "./components/forms/Company/CompanyList";
import SupplierList from "./components/forms/Supplier/SupplierList";
import SubscriptionList from "./components/forms/Subscription/SubscriptionList";
import CountryList from "./components/forms/Country/CountryList";
import CityList from "./components/forms/City/CityList";
import CurrencyList from "./components/forms/Currency/CurrencyList";
import CertificationList from "./components/forms/Certification/CertificationList";
import BankList from "./components/forms/Bank/BankList";
import ProjectParameterList from "./components/forms/ProjectParameter/ProjectParameterList";
import PersonList from "./components/forms/Person/PersonList";
import VehicleList from "./components/forms/Vehicle/VehicleList";
import WarehouseList from "./components/forms/Warehouse/WarehouseList";
import AddressTypeList from "./components/forms/AddressType/AddressTypeList";
import UOMList from "./components/forms/UOM/uomlist";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import ToastNotification from "./components/toastNotification";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SalesQuotationList from "./components/forms/SalesQuotation/SalesQuotationList";
import SalesQuotationForm from "./components/forms/SalesQuotation/SalesQuotationForm";
import SalesOrderList from "./components/forms/SalesOrder/SalesOrderList";
import SalesOrderForm from "./components/forms/SalesOrder/SalesOrderForm";
import SalesOrderPage from "./components/forms/SalesOrder/SalesOrderPage";
import PurchaseOrderList from "./components/forms/PurchaseOrder/PurchaseOrderList";
import PurchaseOrderForm from "./components/forms/PurchaseOrder/PurchaseOrderForm";
import PurchaseOrderPage from "./components/forms/PurchaseOrder/PurchaseOrderPage";
import PurchaseInvoiceList from "./components/forms/PurchaseInvoice/PurchaseInvoiceList";
import PurchaseInvoiceForm from "./components/forms/PurchaseInvoice/PurchaseInvoiceForm";
import PurchaseInvoicePage from "./components/forms/PurchaseInvoice/PurchaseInvoicePage";
import SalesInvoiceList from "./components/forms/SalesInvoice/SalesInvoiceList";
import SalesInvoiceForm from "./components/forms/SalesInvoice/SalesInvoiceForm";
import SalesInvoicePage from "./components/forms/SalesInvoice/SalesInvoicePage";
import AddressList from "./components/forms/Address/AddressList";
import PendingApprovalsList from "./components/forms/PendingApprovals/PendingApprovalsList";
import ItemList from "./components/forms/Item/ItemList";
import { useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import NoAccess from "./pages/NoAccess";

// Wrapper for Create Sales RFQ
const CreateSalesRFQWrapper = () => {
  const navigate = useNavigate();
  return (
    <SalesRFQForm
      onClose={() => navigate("/sales-rfq")}
      onSave={() => navigate("/sales-rfq")}
    />
  );
};

// Wrapper for Edit Sales RFQ
const EditSalesRFQWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode =
    new URLSearchParams(location.search).get("view") === "true";

  return (
    <SalesRFQForm
      salesRFQId={id}
      onClose={() => navigate("/sales-rfq")}
      onSave={() => navigate("/sales-rfq")}
      readOnly={isViewMode}
    />
  );
};

// Wrapper for Create Sales Quotation
const CreateSalesQuotationWrapper = () => {
  const navigate = useNavigate();
  return (
    <SalesQuotationForm
      onClose={() => navigate("/sales-quotation")}
      onSave={() => navigate("/sales-quotation")}
      readOnly={false}
      isEdit={true}
    />
  );
};

// Wrapper for Edit Sales Quotation
const EditSalesQuotationWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <SalesQuotationForm
      salesQuotationId={id}
      onClose={() => navigate("/sales-quotation")}
      onSave={() => navigate("/sales-quotation")}
      readOnly={false}
      isEdit={true}
    />
  );
};

// Wrapper for View Sales Quotation
const ViewSalesQuotationWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <SalesQuotationForm
      salesQuotationId={id}
      onClose={() => navigate("/sales-quotation")}
      readOnly={true}
      isEdit={false}
    />
  );
};

// Wrapper for View Sales Order
const ViewSalesOrderWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <SalesOrderForm
      salesOrderId={id}
      onClose={() => navigate("/sales-order")}
      readOnly={true}
    />
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const isAuthPage = [
    "/",
    "/forgot-password",
    "/reset-password",
    "/signup",
  ].includes(location.pathname);
  const handleDrawerToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {!isAuthPage && (
        <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle} />
      )}
      {isAuthenticated && !isAuthPage && (
        <Sidebar
          variant={isMobile ? "temporary" : "persistent"}
          open={sidebarOpen}
          onClose={handleDrawerClose}
        />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isAuthPage ? 0 : 3,
          mt: isAuthPage ? 0 : 8,
          overflow: "auto",
          height: "100%",
          backgroundColor: "background.default",
          borderRadius: isAuthPage ? 0 : 2,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/no-access" element={<NoAccess />} />
          {/* Proctected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales-rfq" element={<SalesRFQList />} />
            <Route
              path="/sales-rfq/create"
              element={<CreateSalesRFQWrapper />}
            />
            <Route
              path="/sales-rfq/edit/:id"
              element={<EditSalesRFQWrapper />}
            />
            <Route
              path="/sales-rfq/view/:id"
              element={<EditSalesRFQWrapper />}
            />
            <Route path="/purchase-rfq" element={<PurchaseRFQList />} />
            <Route
              path="/purchase-rfq/create"
              element={<PurchaseRFQForm readOnly={false} />}
            />
            <Route
              path="/purchase-rfq/view/:id"
              element={<PurchaseRFQForm readOnly={true} />}
            />
            <Route
              path="/purchase-rfq/edit/:id"
              element={<PurchaseRFQForm readOnly={false} />}
            />
            <Route
              path="/supplier-quotation"
              element={<SupplierQuotationList />}
            />
            <Route
              path="/supplier-quotation/create"
              element={<SupplierQuotationForm />}
            />
            <Route
              path="/supplier-quotation/view/:id"
              element={<SupplierQuotationForm readOnly={true} />}
            />
            <Route
              path="/supplier-quotation/edit/:id"
              element={<SupplierQuotationForm />}
            />
            <Route path="/sales-quotation" element={<SalesQuotationList />} />
            <Route
              path="/sales-quotation/create"
              element={<CreateSalesQuotationWrapper />}
            />
            <Route
              path="/sales-quotation/view/:id"
              element={<ViewSalesQuotationWrapper />}
            />
            <Route
              path="/sales-quotation/edit/:id"
              element={<EditSalesQuotationWrapper />}
            />

            <Route
              path="/project-parameters"
              element={<ProjectParameterList />}
            />

            <Route path="/purchase-order" element={<PurchaseOrderList />} />
            <Route
              path="/purchase-order/add"
              element={<PurchaseOrderForm readOnly={false} />}
            />
            <Route
              path="/purchase-order/view/:id"
              element={<PurchaseOrderForm readOnly={true} />}
            />
            <Route
              path="/purchase-order/edit/:id"
              element={<PurchaseOrderForm readOnly={false} />}
            />
            <Route path="/sales-order" element={<SalesOrderList />} />
            <Route
              path="/sales-order/add"
              element={<SalesOrderForm readOnly={false} />}
            />
            <Route
              path="/sales-order/view/:id"
              element={<SalesOrderForm readOnly={true} />}
            />
            <Route
              path="/sales-order/edit/:id"
              element={<SalesOrderForm readOnly={false} />}
            />
            <Route
              path="/sales-order/detail/:id"
              element={<ViewSalesOrderWrapper />}
            />
            <Route path="/purchase-invoice" element={<PurchaseInvoiceList />} />
            <Route
              path="/purchase-invoice/add"
              element={<PurchaseInvoiceForm readOnly={false} />}
            />
            <Route
              path="/purchase-invoice/view/:id"
              element={<PurchaseInvoiceForm readOnly={true} />}
            />
            <Route
              path="/purchase-invoice/edit/:id"
              element={<PurchaseInvoiceForm readOnly={false} />}
            />
            <Route path="/sales-invoice" element={<SalesInvoiceList />} />
            <Route
              path="/pending-approvals"
              element={<PendingApprovalsList />}
            />
            <Route
              path="/sales-invoice/add"
              element={<SalesInvoiceForm readOnly={false} />}
            />
            <Route
              path="/sales-invoice/view/:id"
              element={<SalesInvoiceForm readOnly={true} />}
            />
            <Route
              path="/sales-invoice/edit/:id"
              element={<SalesInvoiceForm readOnly={false} />}
            />
          </Route>

          {/* Masters Menus lists */}
          <Route element={<ProtectedRoute />}>
            <Route path="/master/addresses" element={<AddressList />} />
            <Route path="/master/address-types" element={<AddressTypeList />} />
            <Route
              path="/master/certifications"
              element={<CertificationList />}
            />
            <Route path="/master/countries" element={<CountryList />} />
            <Route path="/master/cities" element={<CityList />} />
            <Route path="/master/currencies" element={<CurrencyList />} />
            <Route path="/master/companies" element={<CompanyList />} />
            <Route path="/master/customers" element={<CustomerList />} />
            <Route path="/master/forms" element={<FormList />} />
            <Route path="/master/form-roles" element={<FormRoleList />} />
            <Route
              path="/master/form-role-approvers"
              element={<FormRoleApproverList />}
            />
            <Route path="/master/items" element={<ItemList />} />
            <Route path="/master/roles" element={<RolesList />} />
            <Route
              path="/master/subscriptions"
              element={<SubscriptionList />}
            />
            <Route path="/master/suppliers" element={<SupplierList />} />
            <Route path="/master/uoms" element={<UOMList />} />
            <Route path="/master/vehicles" element={<VehicleList />} />
            <Route path="/master/warehouses" element={<WarehouseList />} />
            <Route path="/master/persons" element={<PersonList />} />
            <Route path="/master/banks" element={<BankList />} />
          </Route>
        </Routes>
      </Box>
      <ToastNotification />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          <AuthProvider>
            <ToastContainer position="top-right" autoClose={3000} />
            <AppContent />
          </AuthProvider>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
