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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          {/* Nested routes for dashboard sections */}
          <Route index element={<Dashboard />} /> {/* Default route - redirects to students-list */}
          <Route path="students-list" element={<Dashboard />} />
          <Route path="mood-insights" element={<Dashboard />} />
          <Route path="endorsement-forms" element={<Dashboard />} />
          <Route path="consultation-forms" element={<Dashboard />} />
          <Route path="counseling-notes" element={<Dashboard />} />
          <Route path="guidance-pass" element={<Dashboard />} />
          <Route path="appointment-approval" element={<Dashboard />} />
          <Route path="referral" element={<Dashboard />} />
          <Route path="file-maintenance" element={<Dashboard />} />
          <Route path="history-reports" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}