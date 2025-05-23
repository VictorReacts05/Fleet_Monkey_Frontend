import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CssBaseline } from '@mui/material';
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import SalesRFQForm from './components/forms/SalesRFQ/SalesRFQForm';
import SalesRFQList from './components/forms/SalesRFQ/SalesRFQList';
import SalesRFQPage from './components/forms/SalesRFQ/SalesRFQPage';
import Dashboard from './components/Dashboard/Dashboard'; // Import the Dashboard component
import { ToastContainer } from 'react-toastify'; // Add this import for ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Also import the CSS for toast notifications
import RolesList from './components/forms/Role/RolesList';
import { FormRoleApproverList } from './components/forms/FormRoleApprover';
import FormList from './components/forms/Form/FormList';
import { FormRoleList } from './components/forms/FormRole'; // Add this import
import PurchaseRFQList from './components/forms/PurchaseRFQ/PurchaseRFQList';
import PurchaseRFQPage from './components/forms/PurchaseRFQ/PurchaseRFQPage';
import PurchaseRFQForm from './components/forms/PurchaseRFQ/PurchaseRFQForm';
// Import Supplier Quotation components
import { SupplierQuotationList, SupplierQuotationForm } from './components/forms/SupplierQuotation';
import CustomerList from './components/forms/Customer/CustomerList';
import CompanyList from './components/forms/Company/CompanyList';
import SupplierList from './components/forms/Supplier/SupplierList';
import SubscriptionList from './components/forms/Subscription/SubscriptionList';
import CountryList from './components/forms/Country/CountryList';
import CityList from './components/forms/City/CityList';
import CurrencyList from './components/forms/Currency/CurrencyList';
import CertificationList from './components/forms/Certification/CertificationList';
import BankList from './components/forms/Bank/BankList';
import ProjectParameterList from './components/forms/ProjectParameter/ProjectParameterList';
import PersonList from './components/forms/Person/PersonList';
import VehicleList from './components/forms/Vehicle/VehicleList';
import WarehouseList from './components/forms/Warehouse/WarehouseList';
import AddressTypeList from './components/forms/AddressType/AddressTypeList';
import UOMList from './components/forms/UOM/UOMList';
import Login from './pages/Login';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import ToastNotification from './components/toastNotification';
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SalesQuotationList from './components/forms/SalesQuotation/SalesQuotationList';
import SalesQuotationForm from './components/forms/SalesQuotation/SalesQuotationForm';
// Import Sales Order components
import SalesOrderList from './components/forms/SalesOrder/SalesOrderList';
import SalesOrderForm from './components/forms/SalesOrder/SalesOrderForm';
import SalesOrderPage from './components/forms/SalesOrder/SalesOrderPage';
import PurchaseOrderList from './components/forms/PurchaseOrder/PurchaseOrderList';
import PurchaseOrderForm from './components/forms/PurchaseOrder/PurchaseOrderForm';
import PurchaseOrderPage from './components/forms/PurchaseOrder/PurchaseOrderPage';
import PurchaseInvoiceList from './components/forms/PurchaseInvoice/PurchaseInvoiceList';
import PurchaseInvoiceForm from './components/forms/PurchaseInvoice/PurchaseInvoiceForm';
import PurchaseInvoicePage from './components/forms/PurchaseInvoice/PurchaseInvoicePage';
import SalesInvoiceList from './components/forms/SalesInvoice/SalesInvoiceList';
import SalesInvoiceForm from './components/forms/SalesInvoice/SalesInvoiceForm';
import SalesInvoicePage from './components/forms/SalesInvoice/SalesInvoicePage';


// Create wrapper components that use the hooks properly
const CreateSalesRFQWrapper = () => {
  const navigate = useNavigate();
  return (
    <SalesRFQForm 
      onClose={() => navigate('/sales-rfq')} 
      onSave={() => navigate('/sales-rfq')} 
    />
  );
};

const EditSalesRFQWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = new URLSearchParams(location.search).get('view') === 'true';
  
  return (
    <SalesRFQForm 
      salesRFQId={id}
      onClose={() => navigate('/sales-rfq')} 
      onSave={() => navigate('/sales-rfq')}
      readOnly={isViewMode}
    />
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {!isAuthPage && <Header />}
      {isAuthenticated && !isAuthPage && (
        <Sidebar variant="permanent" open={true} />
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
          // Remove this line - it's causing an error // import ForgotPassword
          from "./pages/ForgotPassword";
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-rfq"
            element={
              <ProtectedRoute>
                <SalesRFQList />
              </ProtectedRoute>
            }
          />
          {/* Use the wrapper components instead of inline functions */}
          <Route
            path="/sales-rfq/create"
            element={
              <ProtectedRoute>
                <CreateSalesRFQWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-rfq/edit/:id"
            element={
              <ProtectedRoute>
                <EditSalesRFQWrapper />
              </ProtectedRoute>
            }
          />
          // Change these lines
          {/* Purchase RFQ Routes */}
          // Add these routes to your existing routes
          <Route path="/purchase-rfq" element={<PurchaseRFQList />} />
          <Route path="/purchase-rfq/create" element={<PurchaseRFQForm />} />
          <Route path="/purchase-rfq/:id" element={<PurchaseRFQForm />} />
          {/* Purchase RFQ Routes - Fixed */}
          <Route
            path="/purchase-rfq"
            element={
              <ProtectedRoute>
                <PurchaseRFQList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-rfq/create"
            element={
              <ProtectedRoute>
                <PurchaseRFQForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-rfq/view/:id"
            element={
              <ProtectedRoute>
                <PurchaseRFQForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-rfq/edit/:id"
            element={
              <ProtectedRoute>
                <PurchaseRFQForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-rfq/edit/:id"
            element={
              <ProtectedRoute>
                <PurchaseRFQPage />
              </ProtectedRoute>
            }
          />
          // Supplier Quotation routes
          <Route
            path="/supplier-quotation"
            element={
              <ProtectedRoute>
                <SupplierQuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-quotation/create"
            element={
              <ProtectedRoute>
                <SupplierQuotationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-quotation/view/:id"
            element={
              <ProtectedRoute>
                <SupplierQuotationForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-quotation/edit/:id"
            element={
              <ProtectedRoute>
                <SupplierQuotationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-Quotation"
            element={
              <ProtectedRoute>
                <SalesQuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-quotation/view/:id"
            element={<SalesQuotationForm readOnly={true} />}
          />
          <Route
            path="/sales-Quotation/create"
            element={
              <ProtectedRoute>
                <SalesQuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-Quotation/view/:id"
            element={
              <ProtectedRoute>
                <SalesQuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-Quotation/edit/:id"
            element={
              <ProtectedRoute>
                <SalesQuotationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompanyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SupplierList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries"
            element={
              <ProtectedRoute>
                <CountryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cities"
            element={
              <ProtectedRoute>
                <CityList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/currencies"
            element={
              <ProtectedRoute>
                <CurrencyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certifications"
            element={
              <ProtectedRoute>
                <CertificationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/banks"
            element={
              <ProtectedRoute>
                <BankList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-parameters"
            element={
              <ProtectedRoute>
                <ProjectParameterList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/persons"
            element={
              <ProtectedRoute>
                <PersonList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehicleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute>
                <WarehouseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/address-types"
            element={
              <ProtectedRoute>
                <AddressTypeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uoms"
            element={
              <ProtectedRoute>
                <UOMList />
              </ProtectedRoute>
            }
          />
          {/* Add the Form Role Approvers route */}
          <Route
            path="/form-role-approvers"
            element={
              <ProtectedRoute>
                <FormRoleApproverList />
              </ProtectedRoute>
            }
          />
          {/* Add the Forms route */}
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <FormList />
              </ProtectedRoute>
            }
          />
          {/* Add the Form Roles route */}
          <Route
            path="/form-roles"
            element={
              <ProtectedRoute>
                <FormRoleList />
              </ProtectedRoute>
            }
          />
          {/* Add the Roles route */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <RolesList />
              </ProtectedRoute>
            }
          />
          {/* Add Supplier Quotation routes */}
          {/* Existing routes continue */}
          
          {/* Purchase Order routes */}
          <Route
            path="/purchase-order"
            element={
              <ProtectedRoute>
                <PurchaseOrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order/add"
            element={
              <ProtectedRoute>
                <PurchaseOrderForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order/view/:id"
            element={
              <ProtectedRoute>
                <PurchaseOrderForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order/edit/:id"
            element={
              <ProtectedRoute>
                <PurchaseOrderForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          
          {/* Sales Order routes */}
          <Route
            path="/sales-order"
            element={
              <ProtectedRoute>
                <SalesOrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-order/add"
            element={
              <ProtectedRoute>
                <SalesOrderForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-order/view/:id"
            element={
              <ProtectedRoute>
                <SalesOrderForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-order/edit/:id"
            element={
              <ProtectedRoute>
                <SalesOrderForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          
          {/* Purchase Invoice routes */}
          <Route
            path="/purchase-invoice"
            element={
              <ProtectedRoute>
                <PurchaseInvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-invoice/add"
            element={
              <ProtectedRoute>
                <PurchaseInvoiceForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-invoice/view/:id"
            element={
              <ProtectedRoute>
                <PurchaseInvoiceForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-invoice/edit/:id"
            element={
              <ProtectedRoute>
                <PurchaseInvoiceForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          
          {/* Sales Invoice routes */}
          <Route
            path="/sales-invoice"
            element={
              <ProtectedRoute>
                <SalesInvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-invoice/add"
            element={
              <ProtectedRoute>
                <SalesInvoiceForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-invoice/view/:id"
            element={
              <ProtectedRoute>
                <SalesInvoiceForm readOnly={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-invoice/edit/:id"
            element={
              <ProtectedRoute>
                <SalesInvoiceForm readOnly={false} />
              </ProtectedRoute>
            }
          />
          
          {/* ... existing routes continue ... */}
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