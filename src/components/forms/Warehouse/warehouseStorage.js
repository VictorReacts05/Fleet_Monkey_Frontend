export const getWarehouses = () => {
  const warehouses = localStorage.getItem('warehouses');
  return warehouses ? JSON.parse(warehouses) : [];
};

export const saveWarehouse = (warehouse) => {
  const warehouses = getWarehouses();
  const newWarehouse = {
    ...warehouse,
    id: warehouse.id || Date.now()
  };
  
  const updatedWarehouses = warehouse.id 
    ? warehouses.map(w => w.id === warehouse.id ? newWarehouse : w)
    : [...warehouses, newWarehouse];
    
  localStorage.setItem('warehouses', JSON.stringify(updatedWarehouses));
  return newWarehouse;
};

export const deleteWarehouse = (id) => {
  const warehouses = getWarehouses();
  const updatedWarehouses = warehouses.filter(w => w.id !== id);
  localStorage.setItem('warehouses', JSON.stringify(updatedWarehouses));
};

export const getWarehouseById = (id) => {
  const warehouses = getWarehouses();
  return warehouses.find(w => w.id === parseInt(id));
};