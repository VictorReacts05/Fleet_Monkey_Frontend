import React, { createContext, useState, useContext } from 'react';

const BankContext = createContext();

export const BankProvider = ({ children }) => {
  const [banks, setBanks] = useState([]);

  const addBank = (bank) => {
    setBanks([...banks, { ...bank, id: Date.now() }]);
  };

  const updateBank = (updatedBank) => {
    setBanks(banks.map(b => 
      b.id === updatedBank.id ? updatedBank : b
    ));
  };

  const deleteBank = (id) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  return (
    <BankContext.Provider value={{ banks, addBank, updateBank, deleteBank }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => useContext(BankContext);