export const getSuppliers = () => {
  const suppliers = localStorage.getItem('suppliers');
  return suppliers ? JSON.parse(suppliers) : [];
};

export const saveSupplier = (supplier) => {
  const suppliers = getSuppliers();
  const newSupplier = {
    ...supplier,
    id: supplier.id || Date.now()
  };
  
  const updatedSuppliers = supplier.id 
    ? suppliers.map(s => s.id === supplier.id ? newSupplier : s)
    : [...suppliers, newSupplier];
    
  localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
  return newSupplier;
};

export const deleteSupplier = (id) => {
  const suppliers = getSuppliers();
  const updatedSuppliers = suppliers.filter(s => s.id !== id);
  localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
};

export const getSupplierById = (id) => {
  const suppliers = getSuppliers();
  return suppliers.find(s => s.id === parseInt(id));
};