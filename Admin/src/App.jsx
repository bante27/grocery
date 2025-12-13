// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

// Import your pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Optional: Remove Login import completely (or keep if you want fallback)
import Login from './pages/Login'; // You can delete this file later

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ROOT & LOGIN → Instantly go to Dashboard (Auto-login active) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />

            {/* All Admin Routes — No login required anymore */}
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route
              path="/users"
              element={
                <Layout>
                  <Users />
                </Layout>
              }
            />

            <Route
              path="/products"
              element={
                <Layout>
                  <Products />
                </Layout>
              }
            />

            <Route
              path="/orders"
              element={
                <Layout>
                  <Orders />
                </Layout>
              }
            />

            <Route
              path="/messages"
              element={
                <Layout>
                  <Messages />
                </Layout>
              }
            />

            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />

            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />

            {/* Optional: Fallback if someone types wrong URL */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;