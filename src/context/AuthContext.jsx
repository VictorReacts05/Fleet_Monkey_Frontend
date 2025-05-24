import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setLoginDetails, setLogoutNull } from "../redux/actions/login/loginActions";
import APIBASEURL from "../utils/apiBaseUrl";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const loginState = useSelector(state => state.loginReducer?.loginDetails);
  const [isAuthenticated, setIsAuthenticated] = useState(!!loginState);
  // Add the missing user state
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setIsAuthenticated(!!loginState);
  }, [loginState]);

  const login = async (loginId, password) => {
    try {
      const response = await axios.post(`${APIBASEURL}/auth/login`, {
        LoginID: loginId,
        Password: password,
      });
      
      if (response.data.token) {
        // Store token and user separately
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        setIsAuthenticated(true);   
        
        // Update Redux store with login details
        dispatch(setLoginDetails(response.data));
        
        navigate("/dashboard");
        
        return { success: true };
      } else {
        return { success: false, error: "Invalid credentials" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Authentication failed",
      };
    }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch(setLogoutNull());
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
