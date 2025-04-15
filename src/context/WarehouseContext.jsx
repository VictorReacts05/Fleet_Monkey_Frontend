import React, { createContext, useState, useContext } from 'react';

const WarehouseContext = createContext();

export const WarehouseProvider = ({ children }) => {
  const [warehouses, setWarehouses] = useState([]);

  const addWarehouse = (warehouse) => {
    setWarehouses([...warehouses, { ...warehouse, id: Date.now() }]);
  };

  const updateWarehouse = (updatedWarehouse) => {
    setWarehouses(warehouses.map(w => 
      w.id === updatedWarehouse.id ? updatedWarehouse : w
    ));
  };

  const deleteWarehouse = (id) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
  };

  return (
    <WarehouseContext.Provider value={{ warehouses, addWarehouse, updateWarehouse, deleteWarehouse }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => useContext(WarehouseContext);