import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSubjects from './pages/admin/ManageSubjects';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';

import HomePage from './pages/HomePage';
import ManageUsers from './pages/admin/ManageUsers';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './pages/auth/RegisterPage';
import AddClass from './pages/class/AddClass';
import ManageClasses from './pages/admin/ManageClass';
import AddSubject from './pages/subject/AddSubject';
import WeeklySetup from './components/create/WeeklySetup';
import DailyTimetable from './components/create/DailyTimeTable';
import TimetableOverview from './components/create/TimetableOverview';
import { Toaster } from 'sonner';
import AboutPage from './pages/AboutPage';
import Footer from './components/common/Footer';
import ContactPage from './pages/ContactPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import Practice from './pages/Practice';

// Authentication Context
export const AuthContext = React.createContext({
  isAuthenticated: false,
  user: null,
  login: () => { },
  logout: () => { }
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setIsAuthenticated(true);
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout
    }}>
      <Router>
        <Toaster duration={1500} richColors />
        <div className="w-screen">
          <Navbar />
          {/* <Sidebar /> */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/practice" element={<Practice />} />

            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <ManageSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <AddSubject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <ManageClasses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/contacts"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <ContactMessagesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/classes/add"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <AddClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/timetables/:classId"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <WeeklySetup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/timetables/:classId/:dayName"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="admin"
                >
                  <DailyTimetable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/timetables/overview/:classId/"
              element={isAuthenticated ? <TimetableOverview /> : <Navigate to="/login" />}
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="teacher"
                >
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Principal Routes */}
            <Route
              path="/principal"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  requiredRole="principal"
                >
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* <Footer /> */}
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;