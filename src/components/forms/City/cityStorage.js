export const getCities = () => {
  const cities = localStorage.getItem('cities');
  return cities ? JSON.parse(cities) : [];
};

export const saveCity = (city) => {
  const cities = getCities();
  const newCity = {
    ...city,
    id: city.id || Date.now()
  };
  
  const updatedCities = city.id 
    ? cities.map(c => c.id === city.id ? newCity : c)
    : [...cities, newCity];
    
  localStorage.setItem('cities', JSON.stringify(updatedCities));
  return newCity;
};

export const deleteCity = (id) => {
  const cities = getCities();
  const updatedCities = cities.filter(c => c.id !== id);
  localStorage.setItem('cities', JSON.stringify(updatedCities));
};

export const getCityById = (id) => {
  const cities = getCities();
  return cities.find(c => c.id === parseInt(id));
};