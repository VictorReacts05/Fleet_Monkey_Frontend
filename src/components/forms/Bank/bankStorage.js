export const getBanks = () => {
  const banks = localStorage.getItem('banks');
  return banks ? JSON.parse(banks) : [];
};

export const saveBank = (bank) => {
  const banks = getBanks();
  const newBank = {
    ...bank,
    id: bank.id || Date.now()
  };
  
  const updatedBanks = bank.id 
    ? banks.map(b => b.id === bank.id ? newBank : b)
    : [...banks, newBank];
    
  localStorage.setItem('banks', JSON.stringify(updatedBanks));
  return newBank;
};

export const deleteBank = (id) => {
  const banks = getBanks();
  const updatedBanks = banks.filter(b => b.id !== id);
  localStorage.setItem('banks', JSON.stringify(updatedBanks));
};

export const getBankById = (id) => {
  const banks = getBanks();
  return banks.find(b => b.id === parseInt(id));
};