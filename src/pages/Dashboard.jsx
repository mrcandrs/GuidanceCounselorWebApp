import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, UserCheck, Plus, Search, Filter, Bell, Settings, LogOut, Eye, Edit, Trash2, Check, X, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StudentsListView from './StudentsListView';
import MoodInsightsView from './MoodInsightsView';
import '../styles/Dashboard.css';
import axios from "axios";

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  //const [searchTerm, setSearchTerm] = useState('');
  
  const pendingAppointments = [
    { id: 1, student: 'John Doe', grade: '12-A', reason: 'Academic counseling', date: '2024-08-10', time: '10:00 AM', status: 'pending' },
    { id: 2, student: 'Jane Smith', grade: '11-B', reason: 'Career guidance', date: '2024-08-11', time: '2:00 PM', status: 'pending' },
    { id: 3, student: 'Mike Johnson', grade: '10-C', reason: 'Personal issues', date: '2024-08-12', time: '9:00 AM', status: 'pending' },
  ];

  const moodData = [
    { mood: 'MILD', count: 45, color: '#34C759' },
    { mood: 'N/A', count: 32, color: '#64748b' },
    { mood: 'MODERATE', count: 28, color: '#009951' },
    { mood: 'HIGH', count: 15, color: '#1B5E20' },
  ];

  const sidebarItems = [
    { id: 'students', icon: Users, label: 'Students List' },
    { id: 'mood', icon: TrendingUp, label: 'Mood Insights' },
    { id: 'endorsement', icon: FileText, label: 'Endorsement Forms' },
    { id: 'consultation', icon: ClipboardList, label: 'Consultation Forms' },
    { id: 'notes', icon: Edit, label: 'Counseling Notes' },
    { id: 'pass', icon: UserCheck, label: 'Guidance Pass' },
    { id: 'appointments', icon: Calendar, label: 'Appointment Approval' },
  ];

  const AppointmentApprovalView = () => (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Appointment Approval</h2>
        <button className="primary-button">
          <Calendar size={20} />
          Set Available Times
        </button>
      </div>
      
      <div className="grid grid-cols-2">
        <div className="card">
          <h3 className="card-title">Pending Appointments</h3>
          <div>
            {pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {appointment.student}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {appointment.grade}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    <button className="approve-button">
                      <Check size={16} />
                    </button>
                    <button className="reject-button">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
                  {appointment.reason}
                </p>
                <div className="appointment-meta">
                  <span className="appointment-meta-item">
                    <Calendar size={14} />
                    {appointment.date}
                  </span>
                  <span className="appointment-meta-item">
                    <Clock size={14} />
                    {appointment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Available Time Slots</h3>
          <div>
            <div className="form-group">
              <label className="label">Date</label>
              <input type="date" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Time Slots</label>
              <div className="time-slot-grid">
                {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button key={time} className="time-slot-button">
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-button full-width">
              Update Available Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const GenericFormView = ({ title, description }) => (
    <div className="page-container">
      <h2 className="page-title">{title}</h2>
      
      <div className="card">
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="primary-button">
              <Plus size={20} />
              Create New
            </button>
            <button className="filter-button">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>
        
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>No {title.toLowerCase()} found. Click "Create New" to get started.</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsListView />;
      case 'mood':
        return <MoodInsightsView />;
      case 'appointments':
        return <AppointmentApprovalView />;
      case 'endorsement':
        return <GenericFormView title="Endorsement Forms" description="Manage custody and endorsement forms for students." />;
      case 'consultation':
        return <GenericFormView title="Consultation Forms" description="Create and manage consultation and conference forms." />;
      case 'notes':
        return <GenericFormView title="Counseling Notes" description="Keep track of guidance and counseling session notes." />;
      case 'pass':
        return <GenericFormView title="Guidance Pass" description="Generate guidance passes for approved students." />;
      default:
        return <StudentsListView />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Guidance Portal</h1>
          <p className="sidebar-subtitle">Counselor Dashboard</p>
        </div>
        
        <nav className="nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">GC</div>
            <div>
              <p className="user-name">Guidance Counselor</p>
              <p className="user-email">counselor@school.edu</p>
            </div>
          </div>
          <div className="user-actions">
            <button className="user-action-button settings-button">
              <Settings size={16} />
            </button>
            <button className="user-action-button logout-button">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div>
              <h2 className="header-title">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="header-subtitle">Manage student guidance and counseling</p>
            </div>
            
            <div className="header-actions">
              <button className="notification-button">
                <Bell size={20} />
                <span className="notification-badge"></span>
              </button>
              <div className="header-avatar">GC</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GuidanceDashboard;