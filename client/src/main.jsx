import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppAuthProvider } from './context/AppAuthContext';
import App from './App';
import './index.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppAuthProvider>
          <App />
        </AppAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
