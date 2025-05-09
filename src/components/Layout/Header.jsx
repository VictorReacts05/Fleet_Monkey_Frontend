import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Import the connect function from react-redux
import { connect } from 'react-redux';

const Header = ({ isMobile, onDrawerToggle, userInfo }) => {
  const { logout, isAuthenticated } = useAuth();
  /* const { mode, toggleTheme } = useTheme(); */
  const theme = useTheme();
  const mode = theme?.mode || "light";
  const toggleTheme =
    theme?.toggleTheme || (() => console.log("Theme toggle not available"));
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const isMobileView = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      }}
      elevation={0}
    >
      <Toolbar>
        {(isMobile || isMobileView) && (
          <IconButton
            color="inherit"
            onClick={onDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <LocalShippingIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Fleet Monkey
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Add New Button */}
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mr: 1, textTransform: 'none' }}
              onClick={() => {/* Add your create handler here */}}
            >
              Create New User
            </Button>

            <Tooltip title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton onClick={toggleTheme} sx={{ ml: 1 }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotificationMenuOpen}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              minWidth: 200,
              mt: 1.5,
              borderRadius: 2,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {userInfo?.firstName && userInfo?.lastName 
                ? `${userInfo.firstName} ${userInfo.lastName}`
                : userInfo?.loginId || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userInfo?.role || 'Administrator'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
        
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              minWidth: 300,
              maxWidth: 350,
              mt: 1.5,
              borderRadius: 2,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationMenuClose}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" fontWeight="medium">New order received</Typography>
              <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" fontWeight="medium">Vehicle maintenance due</Typography>
              <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" fontWeight="medium">Inventory alert: Low stock</Typography>
              <Typography variant="caption" color="text.secondary">5 hours ago</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              View all notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

// At the bottom of your file, update the Redux connection:
const mapStateToProps = (state) => {
  // Add console log to see what's in the state
  // console.log("Redux state in Header:", state.loginReducer);
  
  return {
    userInfo: {
      // Use the loginId from the token if available
      firstName: state.loginReducer?.loginDetails?.firstName,
      lastName: state.loginReducer?.loginDetails?.lastName,
      // Use the personId as a fallback for display
      loginId: state.loginReducer?.loginDetails?.loginId || 
              (state.loginReducer?.loginDetails?.personId ? 
                `User-${state.loginReducer.loginDetails.personId}` : null),
      role: state.loginReducer?.loginDetails?.role || 'Administrator'
    }
  };
};

// Export the connected component with the correct component name
export default connect(mapStateToProps)(Header);