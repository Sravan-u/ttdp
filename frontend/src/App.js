import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import './App.css';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user || !token) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/unauthorized" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user || !token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const BackButtonGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const handlePopState = () => {
      if (!user && location.pathname === '/admin/dashboard') navigate('/admin/login', { replace: true });
      if (!user && location.pathname === '/dashboard') navigate('/login', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, location, navigate]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <BackButtonGuard />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
          <Route path="/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;