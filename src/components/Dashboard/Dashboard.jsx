import React, {useState} from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { 
  LocalShipping, 
  People, 
  AttachMoney, 
  Timeline, 
  CheckCircle, 
  Warning,
  DirectionsCar,
  Speed,
  LocationOn,
  Business,
  AccountBalance,
  Public,
  Warehouse
} from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Mock data for the dashboard
  const stats = {
    activeVehicles: 42,
    totalDrivers: 38,
    pendingOrders: 7,
    completedOrders: 124,
    revenue: '$128,450',
    expenses: '$87,320',
    fuelConsumption: '4,280 gallons',
    maintenanceAlerts: 3,
    totalSuppliers: 27,
    totalCustomers: 53,
    totalBanks: 12,
    totalCities: 48,
    totalCurrencies: 8,
    totalWarehouses: 15
  };

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, action: 'Vehicle #FL-238 completed delivery', time: '10 minutes ago', icon: <CheckCircle color="success" /> },
    { id: 2, action: 'Driver John Smith started route #R-567', time: '45 minutes ago', icon: <DirectionsCar color="primary" /> },
    { id: 3, action: 'Maintenance alert for Vehicle #FL-112', time: '2 hours ago', icon: <Warning color="warning" /> },
    { id: 4, action: 'New order #ORD-890 received', time: '3 hours ago', icon: <AttachMoney color="info" /> },
    { id: 5, action: 'Vehicle #FL-305 reported low fuel', time: '5 hours ago', icon: <Speed color="error" /> }
  ];

  // Chart data
  const statusData = [
    { name: 'Active', value: 65 },
    { name: 'Maintenance', value: 15 },
    { name: 'Inactive', value: 20 },
  ];

  const entityCountData = [
    { name: 'Suppliers', count: stats.totalSuppliers },
    { name: 'Customers', count: stats.totalCustomers },
    { name: 'Banks', count: stats.totalBanks },
    { name: 'Cities', count: stats.totalCities },
    { name: 'Currencies', count: stats.totalCurrencies },
    { name: 'Warehouses', count: stats.totalWarehouses },
  ];

  const warehouseCapacityData = [
    { name: 'Central Distribution', capacity: 85 },
    { name: 'East Coast', capacity: 72 },
    { name: 'West Coast', capacity: 63 },
    { name: 'Southern Regional', capacity: 91 },
    { name: 'Midwest Storage', capacity: 58 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Mock data for suppliers
  const suppliers = [
    { id: 1, name: 'ABC Supplies Inc.', contact: 'John Doe', email: 'john@abcsupplies.com', phone: '(555) 123-4567', status: 'Active' },
    { id: 2, name: 'XYZ Manufacturing', contact: 'Jane Smith', email: 'jane@xyzmanufacturing.com', phone: '(555) 987-6543', status: 'Active' },
    { id: 3, name: 'Global Parts Ltd.', contact: 'Robert Johnson', email: 'robert@globalparts.com', phone: '(555) 456-7890', status: 'Inactive' },
    { id: 4, name: 'Precision Components', contact: 'Sarah Williams', email: 'sarah@precisioncomp.com', phone: '(555) 234-5678', status: 'Active' },
    { id: 5, name: 'Elite Industrial Supply', contact: 'Michael Brown', email: 'michael@eliteindustrial.com', phone: '(555) 876-5432', status: 'Active' }
  ];

  // Mock data for customers
  const customers = [
    { id: 1, name: 'Acme Corporation', contact: 'Tom Wilson', email: 'tom@acmecorp.com', phone: '(555) 111-2222', status: 'Active' },
    { id: 2, name: 'Globex Industries', contact: 'Lisa Anderson', email: 'lisa@globex.com', phone: '(555) 333-4444', status: 'Active' },
    { id: 3, name: 'Soylent Corp', contact: 'David Miller', email: 'david@soylent.com', phone: '(555) 555-6666', status: 'Inactive' },
    { id: 4, name: 'Initech LLC', contact: 'Jennifer Taylor', email: 'jennifer@initech.com', phone: '(555) 777-8888', status: 'Active' },
    { id: 5, name: 'Umbrella Corporation', contact: 'Chris Davis', email: 'chris@umbrella.com', phone: '(555) 999-0000', status: 'Active' }
  ];

  // Mock data for banks
  const banks = [
    { id: 1, name: 'First National Bank', branch: 'Main Street', accountType: 'Business', accountNumber: 'XXXX-XXXX-1234' },
    { id: 2, name: 'City Trust Bank', branch: 'Downtown', accountType: 'Savings', accountNumber: 'XXXX-XXXX-5678' },
    { id: 3, name: 'Global Financial', branch: 'West End', accountType: 'Business', accountNumber: 'XXXX-XXXX-9012' },
    { id: 4, name: 'Commerce Bank', branch: 'East Side', accountType: 'Checking', accountNumber: 'XXXX-XXXX-3456' },
    { id: 5, name: 'Metro Credit Union', branch: 'North Branch', accountType: 'Business', accountNumber: 'XXXX-XXXX-7890' }
  ];

  // Mock data for cities
  const cities = [
    { id: 1, name: 'New York', country: 'United States', postalCode: '10001', active: true },
    { id: 2, name: 'Los Angeles', country: 'United States', postalCode: '90001', active: true },
    { id: 3, name: 'Chicago', country: 'United States', postalCode: '60601', active: true },
    { id: 4, name: 'Houston', country: 'United States', postalCode: '77000', active: true },
    { id: 5, name: 'Toronto', country: 'Canada', postalCode: 'M5V 2A8', active: true }
  ];

  // Mock data for currencies
  const currencies = [
    { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: '1.00' },
    { id: 2, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: '0.92' },
    { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: '0.79' },
    { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: '149.23' },
    { id: 5, code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: '1.37' }
  ];

  // Mock data for vehicles
  const vehicles = [
    { id: 1, model: 'Freightliner Cascadia', type: 'Semi-Truck', year: '2022', status: 'Active', location: 'Chicago, IL' },
    { id: 2, model: 'Ford Transit', type: 'Delivery Van', year: '2021', status: 'Maintenance', location: 'Detroit, MI' },
    { id: 3, model: 'Kenworth T680', type: 'Semi-Truck', year: '2023', status: 'Active', location: 'Indianapolis, IN' },
    { id: 4, model: 'Mercedes Sprinter', type: 'Delivery Van', year: '2022', status: 'Active', location: 'Columbus, OH' },
    { id: 5, model: 'Peterbilt 579', type: 'Semi-Truck', year: '2021', status: 'Inactive', location: 'Cincinnati, OH' }
  ];

  // Mock data for warehouses
  const warehouses = [
    { id: 1, name: 'Central Distribution Center', location: 'Chicago, IL', size: '125,000 sq ft', capacity: '85% full' },
    { id: 2, name: 'East Coast Fulfillment', location: 'Newark, NJ', size: '95,000 sq ft', capacity: '72% full' },
    { id: 3, name: 'West Coast Hub', location: 'Oakland, CA', size: '110,000 sq ft', capacity: '63% full' },
    { id: 4, name: 'Southern Regional Warehouse', location: 'Atlanta, GA', size: '85,000 sq ft', capacity: '91% full' },
    { id: 5, name: 'Midwest Storage Facility', location: 'St. Louis, MO', size: '75,000 sq ft', capacity: '58% full' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4, display: "flex", justifyContent: "space-between"}}>
        <Grid item xs={12} sm={6} md={3} sx={{width: "23%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              borderRadius: 2,
              height: '100%',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white'
            }}
          >
            <Business sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalSuppliers}
            </Typography>
            <Typography variant="body1">
              Suppliers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{width: "23%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              borderRadius: 2,
              height: '100%',
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              color: 'white'
            }}
          >
            <People sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalCustomers}
            </Typography>
            <Typography variant="body1">
              Customers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{width: "23%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              borderRadius: 2,
              height: '100%',
              background: 'linear-gradient(45deg, #FF9800 30%, #FFEB3B 90%)',
              color: 'white'
            }}
          >
            <DirectionsCar sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.activeVehicles}
            </Typography>
            <Typography variant="body1">
              Vehicles
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{width: "23%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              borderRadius: 2,
              height: '100%',
              background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
              color: 'white'
            }}
          >
            <Warehouse sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalWarehouses}
            </Typography>
            <Typography variant="body1">
              Warehouses
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{}}>
        <Grid item xs={12} md={6} sx={{width: "36%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              minHeight: 350
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Vehicle Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} sx={{width: "60%"}}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              minHeight: 350
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Entity Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={entityCountData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;