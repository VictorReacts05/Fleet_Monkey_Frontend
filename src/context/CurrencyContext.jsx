import React, { createContext, useState, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);

  const addCurrency = (currency) => {
    setCurrencies([...currencies, { ...currency, id: Date.now() }]);
  };

  const updateCurrency = (updatedCurrency) => {
    setCurrencies(currencies.map(c => 
      c.id === updatedCurrency.id ? updatedCurrency : c
    ));
  };

  const deleteCurrency = (id) => {
    setCurrencies(currencies.filter(c => c.id !== id));
  };

  return (
    <CurrencyContext.Provider value={{ currencies, addCurrency, updateCurrency, deleteCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);