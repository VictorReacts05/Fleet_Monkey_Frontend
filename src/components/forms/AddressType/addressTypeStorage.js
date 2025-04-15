export const getAddressTypes = () => {
  const addressTypes = localStorage.getItem('addressTypes');
  const parsedTypes = addressTypes ? JSON.parse(addressTypes) : [];
  return parsedTypes.map(type => ({
    ...type,
    label: type.addressTypeName || type.name,
    value: type.id
  }));
};

export const saveAddressType = (addressType) => {
  const addressTypes = localStorage.getItem('addressTypes') ? 
    JSON.parse(localStorage.getItem('addressTypes')) : [];
  const newAddressType = {
    ...addressType,
    id: addressType.id || Date.now(),
    addressTypeName: addressType.addressTypeName || addressType.name
  };
  
  const updatedAddressTypes = addressType.id 
    ? addressTypes.map(at => at.id === addressType.id ? newAddressType : at)
    : [...addressTypes, newAddressType];
    
  localStorage.setItem('addressTypes', JSON.stringify(updatedAddressTypes));
  return newAddressType;
};

export const deleteAddressType = (id) => {
  const addressTypes = getAddressTypes();
  const updatedAddressTypes = addressTypes.filter(at => at.id !== id);
  localStorage.setItem('addressTypes', JSON.stringify(updatedAddressTypes));
};

export const getAddressTypeById = (id) => {
  const addressTypes = getAddressTypes();
  return addressTypes.find(at => at.id === parseInt(id));
};