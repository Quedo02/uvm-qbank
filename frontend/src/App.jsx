import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api/axios';

import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Questions from './pages/Questions.jsx';
import Exams from './pages/Exams.jsx';
import ExamDetail from './pages/ExamDetail.jsx';
import Classes from './pages/Classes.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const onLogin = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.token);
    const me = await api.get('/auth/me');
    setUser(me.data);
  };
  const onLogout = () => { localStorage.removeItem('token'); setUser(null); };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const me = await api.get('/auth/me');
          setUser(me.data);
        } catch { localStorage.removeItem('token'); }
      }
      setInitialized(true);
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user} initialized={initialized}>
              <AppLayout user={user} onLogout={onLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="questions" element={<Questions />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          <Route path="classes" element={<Classes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
