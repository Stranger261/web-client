import { Settings, Sun, Moon, Type, ArrowLeft, Home } from 'lucide-react';

import { useSettings } from '../../context/SettingsContext';
import { FONTSIZE } from '../../config/SETTINGS';

const AdminSettings = () => {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings size={24} style={{ fontSize: '1rem' }} />
              <h1 className="font-bold" style={{ fontSize: '1.5rem' }}>
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-12">
          <section>
            <h2 className="font-semibold mb-6" style={{ fontSize: '1.25rem' }}>
              How It Works
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="space-y-3" style={{ fontSize: '0.975rem' }}>
                <p>
                  • Your text size and theme preferences are automatically saved
                </p>
                <p>• Changes apply to your entire website immediately</p>
                <p>• Settings will persist when you return to the site</p>
                <p>
                  • All existing content will scale with your chosen text size
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-6" style={{ fontSize: '1.25rem' }}>
              Theme
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-lg transition-all min-w-0 ${
                    settings.theme === 'light'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                  }`}
                  style={{ fontSize: '1rem' }} // Fixed size for buttons
                >
                  <Sun size={20} className="flex-shrink-0" />
                  <span className="truncate">Light Mode</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-lg transition-all min-w-0 ${
                    settings.theme === 'dark'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                  }`}
                  style={{ fontSize: '1rem' }} // Fixed size for buttons
                >
                  <Moon size={20} className="flex-shrink-0" />
                  <span className="truncate">Dark Mode</span>
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-6" style={{ fontSize: '1.25rem' }}>
              Text Size
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                {FONTSIZE.map((size, index) => (
                  <div
                    key={size.value}
                    className="flex items-center justify-between"
                  >
                    <button
                      onClick={() => updateSettings({ fontSize: size.value })}
                      className={`flex items-center space-x-4 px-6 py-4 rounded-lg transition-all flex-1 mr-4 min-w-0 ${
                        settings.fontSize === size.value
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Type
                          size={20}
                          className="flex-shrink-0"
                          style={{ fontSize: '1rem' }}
                        />
                        <span className="truncate" style={{ fontSize: '1rem' }}>
                          {size.label}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`${size.preview} font-medium`}
                          style={{ lineHeight: '1.2' }}
                        >
                          Sample Text
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-6" style={{ fontSize: '1.25rem' }}>
              Preview
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
              <div className="space-y-4">
                <h3 className="font-bold">This is how your text will look</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation.
                </p>
                <p>
                  The quick brown fox jumps over the lazy dog. This sentence
                  contains every letter of the alphabet.
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-800 dark:text-blue-200"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Current:{' '}
                    {FONTSIZE.find(f => f.value === settings.fontSize)?.label}
                  </span>
                  <span
                    className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-purple-800 dark:text-purple-200"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Theme: {settings.theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
