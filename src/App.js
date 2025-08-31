// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* All dashboard routes - each renders the Dashboard component */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/students-list" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/mood-insights" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/endorsement-custody" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/consultation-conference-forms" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/counseling-notes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/guidance-pass" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/appointment-approval" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/referral" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/file-maintenance" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/history-reports" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;