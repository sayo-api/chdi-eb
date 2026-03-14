import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AppAuthContext = createContext(null);

export function AppAuthProvider({ children }) {
  const [appUser, setAppUser] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const initFromStorage = useCallback(() => {
    try {
      const token = localStorage.getItem('appToken');
      const userData = localStorage.getItem('appUserData');
      if (token && userData) {
        setAppUser(JSON.parse(userData));
      }
    } catch { localStorage.removeItem('appUserData'); }
    setLoadingApp(false);
  }, []);

  useEffect(() => { initFromStorage(); }, [initFromStorage]);

  const loginApp = (token, user) => {
    localStorage.setItem('appToken', token);
    localStorage.setItem('appUserData', JSON.stringify(user));
    setAppUser(user);
  };

  const logoutApp = () => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('appUserData');
    setAppUser(null);
  };

  const isAppLoggedIn = !!appUser;

  return (
    <AppAuthContext.Provider value={{ appUser, loadingApp, loginApp, logoutApp, isAppLoggedIn }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export const useAppAuth = () => {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAppAuth must be inside AppAuthProvider');
  return ctx;
};
