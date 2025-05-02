import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CssBaseline } from '@mui/material';
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import SalesRFQForm from './components/forms/SalesRFQ/SalesRFQForm';
import SalesRFQList from './components/forms/SalesRFQ/SalesRFQList';
import SalesRFQPage from './components/forms/SalesRFQ/SalesRFQPage';
import { PurchaseRFQList } from './components/forms/PurchaseRFQ';
import PurchaseRFQPage from './components/forms/PurchaseRFQ/PurchaseRFQPage';
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isLoginPage && <Header />}
      {isAuthenticated && !isLoginPage && <Sidebar variant="permanent" open={true} />}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: isLoginPage ? 0 : 3, 
          mt: isLoginPage ? 0 : 8,
          overflow: 'auto',
          height: '100%',
          backgroundColor: 'background.default',
          borderRadius: isLoginPage ? 0 : 2,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sales-rfq" element={<ProtectedRoute><SalesRFQList /></ProtectedRoute>} />
          
          {/* Use the wrapper components instead of inline functions */}
          <Route path="/sales-rfq/create" element={
            <ProtectedRoute>
              <CreateSalesRFQWrapper />
            </ProtectedRoute>
          } />
          
          <Route path="/sales-rfq/edit/:id" element={
            <ProtectedRoute>
              <EditSalesRFQWrapper />
            </ProtectedRoute>
          } />
          
          {/* Purchase RFQ Routes */}
          <Route path="/purchase-rfq" element={<ProtectedRoute><PurchaseRFQList /></ProtectedRoute>} />
          <Route path="/purchase-rfq/create" element={<ProtectedRoute><PurchaseRFQPage /></ProtectedRoute>} />
          <Route path="/purchase-rfq/edit/:id" element={<ProtectedRoute><PurchaseRFQPage /></ProtectedRoute>} />
          
          <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><SupplierList /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionList /></ProtectedRoute>} />
          <Route path="/countries" element={<ProtectedRoute><CountryList /></ProtectedRoute>} />
          <Route path="/cities" element={<ProtectedRoute><CityList /></ProtectedRoute>} />
          <Route path="/currencies" element={<ProtectedRoute><CurrencyList /></ProtectedRoute>} />
          <Route path="/certifications" element={<ProtectedRoute><CertificationList /></ProtectedRoute>} />
          <Route path="/banks" element={<ProtectedRoute><BankList /></ProtectedRoute>} />
          <Route path="/project-parameters" element={<ProtectedRoute><ProjectParameterList /></ProtectedRoute>} />
          <Route path="/persons" element={<ProtectedRoute><PersonList /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
          <Route path="/warehouses" element={<ProtectedRoute><WarehouseList /></ProtectedRoute>} />
          <Route path="/address-types" element={<ProtectedRoute><AddressTypeList /></ProtectedRoute>} />
          <Route path="/uoms" element={<ProtectedRoute><UOMList /></ProtectedRoute>} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppContent />
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
