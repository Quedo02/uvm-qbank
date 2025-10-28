import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { showToast } from '../utils/toast';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (token && u) {
      setUser(JSON.parse(u));
    }
    setInitialized(true); // evita redirects prematuros en el primer render
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Sesión cerrada');
    setUser(null);
    window.location.replace('/login');
  }, []);

  return { user, initialized, login, logout };
}
