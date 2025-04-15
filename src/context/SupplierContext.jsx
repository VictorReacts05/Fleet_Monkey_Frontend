import React, { createContext, useState, useContext } from 'react';

const SupplierContext = createContext();

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);

  const addSupplier = (supplier) => {
    setSuppliers([...suppliers, { ...supplier, id: Date.now() }]);
  };

  const updateSupplier = (updatedSupplier) => {
    setSuppliers(suppliers.map(s => 
      s.id === updatedSupplier.id ? updatedSupplier : s
    ));
  };

  const deleteSupplier = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
};