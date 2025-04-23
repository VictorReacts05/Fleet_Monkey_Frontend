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
      const response = await axios.post(
        "http://localhost:5173/api/auth/login",
        {
          loginId,
          password,
        }
      );
      if (response.data.data) {
        let finalResponse = response.data.data;
        dispatch(setLoginDetails(finalResponse));
        setIsAuthenticated(true);
        navigate("/sales-rfq", { replace: true });
        return { success: true };
      } else {
        return { success: false, error: "Authentication failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Authentication failed",
      };
    }
  };

  const logout = () => {
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
