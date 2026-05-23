import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import { useThemeStore } from './store/themeStore'

// Configure axios to send credentials (cookies) with every request
axios.defaults.withCredentials = true;

useThemeStore.getState().initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
