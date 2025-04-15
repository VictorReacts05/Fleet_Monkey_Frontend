const STORAGE_KEY = 'projectParameters';

export const getProjectParameters = () => {
  const parameters = localStorage.getItem(STORAGE_KEY);
  return parameters ? JSON.parse(parameters) : [];
};

export const saveProjectParameter = (parameter) => {
  const parameters = getProjectParameters();
  if (parameter.id) {
    const index = parameters.findIndex(p => p.id === parameter.id);
    if (index !== -1) {
      parameters[index] = parameter;
    }
  } else {
    parameter.id = Date.now();
    parameters.push(parameter);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parameters));
  return parameter;
};

export const deleteProjectParameter = (id) => {
  const parameters = getProjectParameters();
  const filteredParameters = parameters.filter(param => param.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredParameters));
};

export const getParameterById = (id) => {
  const parameters = getProjectParameters();
  return parameters.find(param => param.id === id) || null;
};