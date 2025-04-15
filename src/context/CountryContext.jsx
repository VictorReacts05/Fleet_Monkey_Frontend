import React, { createContext, useState, useContext } from 'react';

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);

  const addCountry = (country) => {
    setCountries([...countries, { ...country, id: Date.now() }]);
  };

  const updateCountry = (updatedCountry) => {
    setCountries(countries.map(c => 
      c.id === updatedCountry.id ? updatedCountry : c
    ));
  };

  const deleteCountry = (id) => {
    setCountries(countries.filter(c => c.id !== id));
  };

  return (
    <CountryContext.Provider value={{ countries, addCountry, updateCountry, deleteCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};