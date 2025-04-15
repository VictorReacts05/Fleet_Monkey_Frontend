import React, { createContext, useState, useContext } from 'react';

const ProjectParameterContext = createContext();

export const ProjectParameterProvider = ({ children }) => {
  const [parameters, setParameters] = useState([]);

  const addParameter = (parameter) => {
    setParameters([...parameters, { ...parameter, id: Date.now() }]);
  };

  const updateParameter = (updatedParameter) => {
    setParameters(parameters.map(p => 
      p.id === updatedParameter.id ? updatedParameter : p
    ));
  };

  const deleteParameter = (id) => {
    setParameters(parameters.filter(p => p.id !== id));
  };

  return (
    <ProjectParameterContext.Provider value={{ parameters, addParameter, updateParameter, deleteParameter }}>
      {children}
    </ProjectParameterContext.Provider>
  );
};

export const useProjectParameter = () => useContext(ProjectParameterContext);