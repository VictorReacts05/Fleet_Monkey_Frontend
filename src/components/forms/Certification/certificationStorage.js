export const getCertifications = () => {
  const certifications = localStorage.getItem('certifications');
  return certifications ? JSON.parse(certifications) : [];
};

export const saveCertification = (certification) => {
  const certifications = getCertifications();
  const newCertification = {
    ...certification,
    id: certification.id || Date.now()
  };
  
  const updatedCertifications = certification.id 
    ? certifications.map(c => c.id === certification.id ? newCertification : c)
    : [...certifications, newCertification];
    
  localStorage.setItem('certifications', JSON.stringify(updatedCertifications));
  return newCertification;
};

export const deleteCertification = (id) => {
  const certifications = getCertifications();
  const updatedCertifications = certifications.filter(c => c.id !== id);
  localStorage.setItem('certifications', JSON.stringify(updatedCertifications));
};

export const getCertificationById = (id) => {
  const certifications = getCertifications();
  return certifications.find(c => c.id === parseInt(id));
};