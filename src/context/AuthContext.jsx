import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoginDetails,
  setLogoutNull,
} from "../redux/actions/login/loginActions";
import APIBASEURL from "../utils/apiBaseUrl";
import accessMenusReducer from "../redux/reducers/accessMenus/accessmenu.reducers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.loginReducer?.loginDetails);
  const [isAuthenticated, setIsAuthenticated] = useState(!!loginState);

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
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setIsAuthenticated(true);
        handleFetchAccessMenuList();

        dispatch(setLoginDetails(response.data));

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

  const handleFetchAccessMenuList = async () => {
    try {
      const response = await axios.get(`${APIBASEURL}/tableAccess`);

      const finalResponse = response.data.data;
      if (
        finalResponse.masterTables.length > 0 ||
        finalResponse.tables.length > 0
      ) {
        dispatch(accessMenusReducer(finalResponse));

        navigate("/dashboard");

        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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
