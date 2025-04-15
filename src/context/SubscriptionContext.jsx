import React, { createContext, useState, useContext } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);

  const addSubscription = (subscription) => {
    setSubscriptions([...subscriptions, { ...subscription, id: Date.now() }]);
  };

  const updateSubscription = (updatedSubscription) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === updatedSubscription.id ? updatedSubscription : s
    ));
  };

  const deleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, updateSubscription, deleteSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);