export const getVehicles = () => {
  const vehicles = localStorage.getItem('vehicles');
  return vehicles ? JSON.parse(vehicles) : [];
};

export const saveVehicle = (vehicle) => {
  const vehicles = getVehicles();
  const newVehicle = {
    ...vehicle,
    id: vehicle.id || Date.now()
  };
  
  const updatedVehicles = vehicle.id 
    ? vehicles.map(v => v.id === vehicle.id ? newVehicle : v)
    : [...vehicles, newVehicle];
    
  localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  return newVehicle;
};

export const deleteVehicle = (id) => {
  const vehicles = getVehicles();
  const updatedVehicles = vehicles.filter(v => v.id !== id);
  localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
};

export const getVehicleById = (id) => {
  const vehicles = getVehicles();
  return vehicles.find(v => v.id === parseInt(id));
};