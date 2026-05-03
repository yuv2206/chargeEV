import { createContext, useEffect, useState } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('ev_admin_token');
    return token ? { role: 'admin' } : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ev_user_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem('ev_user_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = (payload) => {
    localStorage.setItem('ev_user_token', payload.token);
    setUser(payload.user);
  };

  const logoutUser = () => {
    localStorage.removeItem('ev_user_token');
    setUser(null);
  };

  const loginAdmin = (payload) => {
    localStorage.setItem('ev_admin_token', payload.token);
    setAdmin(payload.admin);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('ev_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

