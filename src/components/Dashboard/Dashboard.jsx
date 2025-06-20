import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Warehouse, People, DirectionsCar, Business } from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    activeVehicles: 0,
    totalDrivers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: '$0',
    expenses: '$0',
    fuelConsumption: '0 gallons',
    maintenanceAlerts: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalBanks: 0,
    totalCities: 0,
    totalCurrencies: 0,
    totalWarehouses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define COLORS array
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Mock data for charts
  const statusData = [
    { name: 'Active', value: 65 },
    { name: 'Maintenance', value: 15 },
    { name: 'Inactive', value: 20 },
  ];

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, suppliersRes, vehiclesRes, warehousesRes] = await Promise.all([
          axios.get('http://localhost:7000/api/customers'),
          axios.get('http://localhost:7000/api/suppliers'),
          axios.get('http://localhost:7000/api/vehicles'),
          axios.get('http://localhost:7000/api/warehouses'),
          
        ]);

        // Log API responses to verify structure
        console.log('Customers:', customersRes.data);
        console.log('Suppliers:', suppliersRes.data);
        console.log('Vehicles:', vehiclesRes.data);
        console.log('Warehouses:', warehousesRes.data);

        // Count the number of records from the 'data' property
        const customersCount = Array.isArray(customersRes.data.data) ? customersRes.data.data.length : 0;
        const suppliersCount = Array.isArray(suppliersRes.data.data) ? suppliersRes.data.data.length : 0;
        const vehiclesCount = Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data.length : 0;
        const warehousesCount = Array.isArray(warehousesRes.data.data) ? warehousesRes.data.data.length : 0;

        // Update stats with live counts
        setStats((prevStats) => ({
          ...prevStats,
          totalCustomers: customersCount,
          totalSuppliers: suppliersCount,
          activeVehicles: vehiclesCount,
          totalWarehouses: warehousesCount,
        }));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data from APIs. Please ensure the backend server is running on localhost:7000.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Dynamic entity count data based on stats
  const entityCountData = [
    { name: 'Suppliers', count: stats.totalSuppliers },
    { name: 'Customers', count: stats.totalCustomers },
    { name: 'vehicles', count: stats.activeVehicles },
    { name: 'Warehouses', count: stats.totalWarehouses },
  ];

  return (
    <Box >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      {loading && <Typography>Loading data...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {/* Key Metrics Cards */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          '& > *': { flex: '0 0 23%' }, // Equivalent to md={3} in old API
        }}
      >
        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              height: '100%',
              bgcolor: '#2196F3',
              color: 'white',
            }}
          >
            <Business sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalSuppliers}
            </Typography>
            <Typography variant="body1">Suppliers</Typography>
          </Paper>
        </Grid>

        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              height: '100%',
              bgcolor: '#4CAF50',
              color: 'white',
            }}
          >
            <People sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalCustomers}
            </Typography>
            <Typography variant="body1">Customers</Typography>
          </Paper>
        </Grid>

        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              height: '100%',
              bgcolor: '#FF9800',
              color: 'white',
            }}
          >
            <DirectionsCar sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.activeVehicles}
            </Typography>
            <Typography variant="body1">Vehicles</Typography>
          </Paper>
        </Grid>

        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              height: '100%',
              bgcolor: '#9C27B0',
              color: 'white',
            }}
          >
            <Warehouse sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.totalWarehouses}
            </Typography>
            <Typography variant="body1">Warehouses</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid
        container
        spacing={3}
        sx={{
          '& > *': { flex: '0 0 48%' }, // Adjust for two columns
        }}
      >
        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              minHeight: 350,
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

        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              minHeight: 350,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Entity Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={entityCountData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name"  />
                <YAxis  />
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