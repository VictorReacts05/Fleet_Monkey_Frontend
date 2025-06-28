import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const menuData = useSelector((state) => state.accessMenu.accessMenuData);

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authorization check for master routes
  const pathname = location.pathname.toLowerCase();
  const isMasterPath = pathname.startsWith("/master/");

  if (isMasterPath) {
    const allowedMasterTables = (menuData?.masterTables || []).map((item) =>
      item.tableName.toLowerCase()
    );

    const requestedPath = pathname.replace("/master/", "");

    const isAuthorized = allowedMasterTables.includes(requestedPath);

    if (!isAuthorized) {
      return <Navigate to="/no-access" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
