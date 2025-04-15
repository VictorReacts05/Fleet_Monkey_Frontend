import React, { createContext, useState, useContext } from 'react';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);

  const addCity = (city) => {
    setCities([...cities, { ...city, id: Date.now() }]);
  };

  const updateCity = (updatedCity) => {
    setCities(cities.map(c => 
      c.id === updatedCity.id ? updatedCity : c
    ));
  };

  const deleteCity = (id) => {
    setCities(cities.filter(c => c.id !== id));
  };

  return (
    <CityContext.Provider value={{ cities, addCity, updateCity, deleteCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};