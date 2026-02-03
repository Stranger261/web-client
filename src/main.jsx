import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          zIndex: 9999,
        },
        duration: 1200,
      }}
    />
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <App />
    </LocalizationProvider>
  </BrowserRouter>,
  // </StrictMode>
);
