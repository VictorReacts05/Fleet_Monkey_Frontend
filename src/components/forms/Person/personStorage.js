export const getPersons = () => {
  const persons = localStorage.getItem('persons');
  return persons ? JSON.parse(persons) : [];
};

export const savePerson = (person) => {
  const persons = getPersons();
  const newPerson = {
    ...person,
    id: person.id || Date.now()
  };
  
  const updatedPersons = person.id 
    ? persons.map(p => p.id === person.id ? newPerson : p)
    : [...persons, newPerson];
    
  localStorage.setItem('persons', JSON.stringify(updatedPersons));
  return newPerson;
};

export const deletePerson = (id) => {
  const persons = getPersons();
  const updatedPersons = persons.filter(p => p.id !== id);
  localStorage.setItem('persons', JSON.stringify(updatedPersons));
};

export const getPersonById = (id) => {
  const persons = getPersons();
  return persons.find(p => p.id === parseInt(id));
};