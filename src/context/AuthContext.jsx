import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoginDetails, setLogoutNull } from "../redux/actions/login/loginActions";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const loginState = useSelector(state => state.loginReducer?.loginDetails);
  const [isAuthenticated, setIsAuthenticated] = useState(!!loginState);
  
  useEffect(() => {
    setIsAuthenticated(!!loginState);
  }, [loginState]);

  const login = async (loginId, password) => {
    try {
      const response = await axios.post(
        "http://localhost:7000/api/auth/login",
        {
          LoginID: loginId,
          Password: password,
        }
      );
      
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);

        try {
          const base64Url = response.data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const userData = JSON.parse(jsonPayload);
          
          const userObject = {
            personId: userData.personId,
            role: userData.role,
            loginId: loginId,
            token: response.data.token
          };

          localStorage.setItem('user', JSON.stringify(userObject));
          
          dispatch(setLoginDetails(userObject));
          setIsAuthenticated(true);
          
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
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
