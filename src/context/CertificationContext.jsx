import React, { createContext, useState, useContext } from 'react';

const CertificationContext = createContext();

export const CertificationProvider = ({ children }) => {
  const [certifications, setCertifications] = useState([]);

  const addCertification = (certification) => {
    setCertifications([...certifications, { ...certification, id: Date.now() }]);
  };

  const updateCertification = (updatedCertification) => {
    setCertifications(certifications.map(c => 
      c.id === updatedCertification.id ? updatedCertification : c
    ));
  };

  const deleteCertification = (id) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  return (
    <CertificationContext.Provider value={{ certifications, addCertification, updateCertification, deleteCertification }}>
      {children}
    </CertificationContext.Provider>
  );
};

export const useCertification = () => useContext(CertificationContext);