import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';


import Tests from './pages/Tests';
import TestStart from './pages/TestStart';
import TestAttempt from './pages/TestAttempt';
import Result from './pages/Result';
import Review from './pages/Review';
import Profile from './pages/Profile';


import AdminDashboard from './pages/AdminDashboard';
import AdminTests from './pages/AdminTests';
import AdminTestEdit from './pages/AdminTestEdit';
import AdminAIGenerate from './pages/AdminAIGenerate';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <div style={{ flex: 1 }}>
            <Routes>
              {}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {}
              <Route path="/tests" element={<Tests />} />
              <Route
                path="/test/:id/start"
                element={
                  <PrivateRoute>
                    <TestStart />
                  </PrivateRoute>
                }
              />
              <Route
                path="/test/:id/attempt/:attemptId"
                element={
                  <PrivateRoute>
                    <TestAttempt />
                  </PrivateRoute>
                }
              />
              <Route
                path="/result/:attemptId"
                element={
                  <PrivateRoute>
                    <Result />
                  </PrivateRoute>
                }
              />
              <Route
                path="/result/:attemptId/review"
                element={
                  <PrivateRoute>
                    <Review />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {}
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/tests"
                element={
                  <PrivateRoute adminOnly>
                    <AdminTests />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/tests/new"
                element={
                  <PrivateRoute adminOnly>
                    <AdminTestEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/tests/:id/edit"
                element={
                  <PrivateRoute adminOnly>
                    <AdminTestEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/ai-generate"
                element={
                  <PrivateRoute adminOnly>
                    <AdminAIGenerate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute adminOnly>
                    <AdminUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute adminOnly>
                    <AdminReports />
                  </PrivateRoute>
                }
              />

              {}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
