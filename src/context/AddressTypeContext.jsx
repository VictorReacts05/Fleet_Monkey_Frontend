import React, { createContext, useState, useContext } from 'react';

const AddressTypeContext = createContext();

export const AddressTypeProvider = ({ children }) => {
  const [addressTypes, setAddressTypes] = useState([]);

  const addAddressType = (addressType) => {
    setAddressTypes([...addressTypes, { ...addressType, id: Date.now() }]);
  };

  const updateAddressType = (updatedAddressType) => {
    setAddressTypes(addressTypes.map(at => 
      at.id === updatedAddressType.id ? updatedAddressType : at
    ));
  };

  const deleteAddressType = (id) => {
    setAddressTypes(addressTypes.filter(at => at.id !== id));
  };

  return (
    <AddressTypeContext.Provider value={{ addressTypes, addAddressType, updateAddressType, deleteAddressType }}>
      {children}
    </AddressTypeContext.Provider>
  );
};

export const useAddressType = () => useContext(AddressTypeContext);