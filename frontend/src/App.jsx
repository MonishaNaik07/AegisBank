import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { notificationStart, fetchNotificationsSuccess } from './redux/slices/notificationSlice.js';
import api from './services/api.js';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Overview from './pages/Overview.jsx';
import Transfer from './pages/Transfer.jsx';
import AIInsights from './pages/AIInsights.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Notifications from './pages/Notifications.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';

// Components
import Layout from './components/Layout.jsx';

// Role Gate Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === 'suspended') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Load notifications in background when logged in
  useEffect(() => {
    if (token) {
      const getNotifications = async () => {
        dispatch(notificationStart());
        try {
          const res = await api.get('/notifications');
          dispatch(fetchNotificationsSuccess(res.data.notifications));
        } catch (err) {
          console.warn('Failed background load of notifications');
        }
      };

      getNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(getNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Overview />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Layout>
                <Transfer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Layout>
                <AIInsights />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Layout>
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Restricted Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Owner Restricted Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['Owner']}>
              <Layout>
                <OwnerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route
          path="*"
          element={<Navigate to={token ? '/dashboard' : '/'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
