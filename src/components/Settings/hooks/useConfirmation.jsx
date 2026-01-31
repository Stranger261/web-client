// hooks/useConfirmation.js
import { useState } from 'react';

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  const confirm = options => {
    return new Promise(resolve => {
      setConfig({
        ...options,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        },
      });
      setIsOpen(true);
    });
  };

  const close = () => {
    setIsOpen(false);
    config.onCancel?.();
  };

  return {
    isOpen,
    config,
    confirm,
    close,
  };
};
