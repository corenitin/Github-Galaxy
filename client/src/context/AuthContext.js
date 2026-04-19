import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('galaxy_token'));

  const fetchUser = useCallback(async (t) => {
    try {
      const { data } = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(data.user);
    } catch {
      localStorage.removeItem('galaxy_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = () => {
  window.location.href = `${process.env.REACT_APP_API_URL || ''}/auth/github`;
};

  const handleCallback = (newToken) => {
    localStorage.setItem('galaxy_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
  };

  const logout = async () => {
    await axios.post('/auth/logout').catch(() => {});
    localStorage.removeItem('galaxy_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, handleCallback, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
