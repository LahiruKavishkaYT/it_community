import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StatsProvider } from './contexts/StatsContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import EventsPage from './pages/EventsPage';
import EventManagePage from './pages/EventManagePage';
import EventDetailPage from './pages/EventDetailPage';
import JobsPage from './pages/JobsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import CareerPathPage from './pages/CareerPathPage';
import MyFeedbackPage from './pages/MyFeedbackPage';
import JobDetailPage from './pages/JobDetailPage';
import FrontendMindmap from './pages/mindmaps/FrontendMindmap';
import BackendMindmap from './pages/mindmaps/BackendMindmap';
import DevOpsMindmap from './pages/mindmaps/DevOpsMindmap';
import FullStackMindmap from './pages/mindmaps/FullStackMindmap';
import AIEngineerMindmap from './pages/mindmaps/AIEngineerMindmap';
import DataAnalystMindmap from './pages/mindmaps/DataAnalystMindmap';
import DataScientistMindmap from './pages/mindmaps/DataScientistMindmap';
import AndroidDeveloperMindmap from './pages/mindmaps/AndroidDeveloperMindmap';
import IOSDeveloperMindmap from './pages/mindmaps/IOSDeveloperMindmap';
import BlockchainDeveloperMindmap from './pages/mindmaps/BlockchainDeveloperMindmap';
import LearningProjectUploadPage from './pages/LearningProjectUploadPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <StatsProvider>
      <Layout>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        
        {/* Public Browse Routes - Available to all users */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/career-path" element={<CareerPathPage />} />
        <Route path="/mindmaps/frontend" element={<FrontendMindmap />} />
        <Route path="/mindmaps/backend" element={<BackendMindmap />} />
        <Route path="/mindmaps/devops" element={<DevOpsMindmap />} />
        <Route path="/mindmaps/fullstack" element={<FullStackMindmap />} />
        <Route path="/mindmaps/ai-engineer" element={<AIEngineerMindmap />} />
        <Route path="/mindmaps/data-analyst" element={<DataAnalystMindmap />} />
        <Route path="/mindmaps/data-scientist" element={<DataScientistMindmap />} />
        <Route path="/mindmaps/android-developer" element={<AndroidDeveloperMindmap />} />
        <Route path="/mindmaps/ios-developer" element={<IOSDeveloperMindmap />} />
        <Route path="/mindmaps/blockchain-developer" element={<BlockchainDeveloperMindmap />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
        <Route path="/projects/learning/new" element={<ProtectedRoute><LearningProjectUploadPage /></ProtectedRoute>} />
        <Route path="/events/:id/manage" element={<ProtectedRoute><EventManagePage /></ProtectedRoute>} />
        <Route path="/job-applications" element={<ProtectedRoute><JobApplicationsPage /></ProtectedRoute>} />
        <Route path="/my-feedback" element={<ProtectedRoute><MyFeedbackPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
    </StatsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;