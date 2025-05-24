import React from "react";
import { useParams, useLocation } from "react-router-dom";
import SalesOrderForm from "./SalesOrderForm";
import SalesOrderList from "./SalesOrderList";

const SalesOrderPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes("/view/");
  const isAddMode = location.pathname.includes("/add");

  if (id || isViewMode || isAddMode) {
    return <SalesOrderForm />;
  }

  return <SalesOrderList />;
};

export default SalesOrderPage;