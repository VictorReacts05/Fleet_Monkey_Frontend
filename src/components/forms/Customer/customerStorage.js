export const getCustomers = () => {
  const customers = localStorage.getItem('customers');
  return customers ? JSON.parse(customers) : [];
};

export const saveCustomer = (customer) => {
  const customers = getCustomers();
  const newCustomer = {
    ...customer,
    id: customer.id || Date.now()
  };
  
  const updatedCustomers = customer.id 
    ? customers.map(c => c.id === customer.id ? newCustomer : c)
    : [...customers, newCustomer];
    
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  return newCustomer;
};

export const deleteCustomer = (id) => {
  const customers = getCustomers();
  const updatedCustomers = customers.filter(c => c.id !== id);
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
};

export const getCustomerById = (id) => {
  const customers = getCustomers();
  return customers.find(c => c.id === parseInt(id));
};