import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

const ToastNotification = () => {
  return <Toaster />;
};

export const showToast = (message, type, duration = 3000) => {
  switch (type) {
    case 'success':
      toast.success(message, { duration });
      break;
    case 'error':
      toast.error(message, { duration });
      break;
    case 'loading':
      toast.loading(message, { duration });
      break;
    case 'custom':
      toast(message, { duration });
      break;
    default:
      toast(message, { duration });
      break;
  }
};

export default ToastNotification;
