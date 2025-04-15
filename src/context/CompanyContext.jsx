import React, { createContext, useState, useContext } from 'react';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);

  const addCompany = (company) => {
    setCompanies([...companies, { ...company, id: Date.now() }]);
  };

  const updateCompany = (updatedCompany) => {
    setCompanies(companies.map(c => 
      c.id === updatedCompany.id ? updatedCompany : c
    ));
  };

  const deleteCompany = (id) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  return (
    <CompanyContext.Provider value={{ companies, addCompany, updateCompany, deleteCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);