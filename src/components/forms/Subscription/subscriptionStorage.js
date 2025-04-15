export const getSubscriptions = () => {
  const subscriptions = localStorage.getItem('subscriptions');
  return subscriptions ? JSON.parse(subscriptions) : [];
};

export const saveSubscription = (subscription) => {
  const subscriptions = getSubscriptions();
  const newSubscription = {
    ...subscription,
    id: subscription.id || Date.now()
  };
  
  const updatedSubscriptions = subscription.id 
    ? subscriptions.map(s => s.id === subscription.id ? newSubscription : s)
    : [...subscriptions, newSubscription];
    
  localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
  return newSubscription;
};

export const deleteSubscription = (id) => {
  const subscriptions = getSubscriptions();
  const updatedSubscriptions = subscriptions.filter(s => s.id !== id);
  localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
};

export const getSubscriptionById = (id) => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(s => s.id === parseInt(id));
};