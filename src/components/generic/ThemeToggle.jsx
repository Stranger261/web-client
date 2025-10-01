import { useSettings } from '../../context/SettingsContext';

export const ThemeToggle = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <button
      onClick={() =>
        updateSettings({
          theme: settings.theme === 'dark' ? 'light' : 'dark',
        })
      }
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
    >
      {settings.theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
