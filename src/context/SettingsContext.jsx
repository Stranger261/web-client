import { useContext, createContext, useEffect, useState } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    fontSize: 'base',
    theme: 'light',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('website-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = newSettings => {
    const htmlElement = document.documentElement;
    if (newSettings.theme === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      // FIX: Remove the 'dark' class when switching to light mode
      htmlElement.classList.remove('dark');
      htmlElement.setAttribute('data-theme', 'cupcake');
    }

    htmlElement.classList.remove(
      'text-xs',
      'text-sm',
      'text-base',
      'text-lg',
      'text-xl',
      'text-2xl',
      'text-3xl',
      'text-4xl',
      'text-5xl'
    );

    htmlElement.classList.add(`text-${newSettings.fontSize}`);
  };

  const updateSettings = newSettings => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    applySettings(updated);
    localStorage.setItem('website-settings', JSON.stringify(updated));
  };

  const value = {
    settings,
    updateSettings,
  };
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
