import React, { createContext, useState, useContext } from 'react';

const PersonContext = createContext();

export const PersonProvider = ({ children }) => {
  const [persons, setPersons] = useState([]);

  const addPerson = (person) => {
    setPersons([...persons, { ...person, id: Date.now() }]);
  };

  const updatePerson = (updatedPerson) => {
    setPersons(persons.map(p => 
      p.id === updatedPerson.id ? updatedPerson : p
    ));
  };

  const deletePerson = (id) => {
    setPersons(persons.filter(p => p.id !== id));
  };

  return (
    <PersonContext.Provider value={{ persons, addPerson, updatePerson, deletePerson }}>
      {children}
    </PersonContext.Provider>
  );
};

export const usePerson = () => useContext(PersonContext);