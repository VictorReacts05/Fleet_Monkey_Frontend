import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setLoginDetails, setLogoutNull } from "../redux/actions/login/loginActions";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get login state from Redux
  const loginState = useSelector(state => state.loginReducer?.loginDetails);
  const [isAuthenticated, setIsAuthenticated] = useState(!!loginState);
  
  // Log when auth state changes from Redux
  useEffect(() => {
    // console.log("Auth Context - Login State from Redux:", loginState);
    setIsAuthenticated(!!loginState);
  }, [loginState]);

  const login = async (loginId, password) => {
    try {
      console.log("Login attempt with:", { loginId });
      // Update the API endpoint to match your backend
      const response = await axios.post(
        "http://localhost:7000/api/auth/login",
        {
          // Match the case expected by your backend
          LoginID: loginId,
          Password: password,
        }
      );
      
      console.log("Login response:", response.data);
      
      // Handle the response based on your backend structure
      if (response.data && response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        
        // Get user details from token or make another request if needed
        try {
          console.log("Decoding token...");
          // Decode token to get basic user info (you might need a proper JWT decoder library)
          const base64Url = response.data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const userData = JSON.parse(jsonPayload);
          console.log("Decoded token data:", userData);
          
          // In the login function, update the userObject creation:
          
          // Create user object with data from token
          const userObject = {
            personId: userData.personId,
            role: userData.role,
            // Store the login ID that was used to log in
            loginId: loginId,
            token: response.data.token
          };
          
          console.log("User object created:", userObject);
          
          // Store in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userObject));
          
          // Update Redux state
          dispatch(setLoginDetails(userObject));
          setIsAuthenticated(true);
          
          // Navigate to dashboard
          console.log("Login successful, navigating to dashboard");
          navigate("/sales-rfq", { replace: true });
          return { success: true };
        } catch (tokenError) {
          console.error("Token parsing error:", tokenError);
          return { success: false, error: "Error processing authentication data" };
        }
      } else {
        console.log("Login failed: No token in response");
        return { success: false, error: response.data?.message || "Authentication failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      console.log("Error response data:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Authentication failed",
      };
    }
  };

  const logout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update Redux state
    dispatch(setLogoutNull());
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
