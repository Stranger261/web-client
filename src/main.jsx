import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/web-client">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            zIndex: 9999, // A very high number to ensure it's on top
          },
        }}
      />
      <App />
    </BrowserRouter>
  </StrictMode>
);
