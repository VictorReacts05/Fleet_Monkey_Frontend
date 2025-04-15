export const getCompanies = () => {
  const companies = localStorage.getItem('companies');
  return companies ? JSON.parse(companies) : [];
};

export const saveCompany = (company) => {
  const companies = getCompanies();
  const newCompany = {
    ...company,
    id: company.id || Date.now()
  };
  
  const updatedCompanies = company.id 
    ? companies.map(c => c.id === company.id ? newCompany : c)
    : [...companies, newCompany];
    
  localStorage.setItem('companies', JSON.stringify(updatedCompanies));
  return newCompany;
};

export const deleteCompany = (id) => {
  const companies = getCompanies();
  const updatedCompanies = companies.filter(c => c.id !== id);
  localStorage.setItem('companies', JSON.stringify(updatedCompanies));
};

export const getCompanyById = (id) => {
  const companies = getCompanies();
  return companies.find(c => c.id === parseInt(id));
};