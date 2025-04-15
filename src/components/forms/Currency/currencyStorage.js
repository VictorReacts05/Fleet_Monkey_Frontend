export const getCurrencies = () => {
  const currencies = localStorage.getItem('currencies');
  return currencies ? JSON.parse(currencies) : [];
};

export const saveCurrency = (currency) => {
  const currencies = getCurrencies();
  const newCurrency = {
    ...currency,
    id: currency.id || Date.now()
  };
  
  const updatedCurrencies = currency.id 
    ? currencies.map(c => c.id === currency.id ? newCurrency : c)
    : [...currencies, newCurrency];
    
  localStorage.setItem('currencies', JSON.stringify(updatedCurrencies));
  return newCurrency;
};

export const deleteCurrency = (id) => {
  const currencies = getCurrencies();
  const updatedCurrencies = currencies.filter(c => c.id !== id);
  localStorage.setItem('currencies', JSON.stringify(updatedCurrencies));
};

export const getCurrencyById = (id) => {
  const currencies = getCurrencies();
  return currencies.find(c => c.id === parseInt(id));
};