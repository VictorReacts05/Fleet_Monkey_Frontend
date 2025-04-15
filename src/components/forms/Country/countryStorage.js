export const getCountries = () => {
  const countries = localStorage.getItem('countries');
  return countries ? JSON.parse(countries) : [];
};

export const saveCountry = (country) => {
  const countries = getCountries();
  const newCountry = {
    ...country,
    id: country.id || Date.now()
  };
  
  const updatedCountries = country.id 
    ? countries.map(c => c.id === country.id ? newCountry : c)
    : [...countries, newCountry];
    
  localStorage.setItem('countries', JSON.stringify(updatedCountries));
  return newCountry;
};

export const deleteCountry = (id) => {
  const countries = getCountries();
  const updatedCountries = countries.filter(c => c.id !== id);
  localStorage.setItem('countries', JSON.stringify(updatedCountries));
};

export const getCountryById = (id) => {
  const countries = getCountries();
  return countries.find(c => c.id === parseInt(id));
};