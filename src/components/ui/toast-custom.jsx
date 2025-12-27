import toast from 'react-hot-toast';

export const toastInfo = message => {
  return toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontWeight: '500',
    },
    duration: 3000,
  });
};

export const toastWarning = message => {
  return toast(message, {
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontWeight: '500',
    },
    duration: 4000,
  });
};
