import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, UserCheck, Plus, AtSign, Filter, Bell, Settings, LogOut, FileArchive, Edit, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StudentsListView from './StudentsListView';
import AppointmentApprovalView from './AppointmentApprovalView';
import MoodInsightsView from './MoodInsightsView';
import '../styles/Dashboard.css';
import axios from "axios";

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState({ name: '', email: '' });
  const [showModal, setShowModal] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  //const [searchTerm, setSearchTerm] = useState('');

  //Use effect for pending appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          "https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/pending-appointments"
        );
        setPendingAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);




  //Use effect for fetching Counselor from database
  useEffect(() => {
  const fetchCounselor = async () => {
    try {
      const token = localStorage.getItem('authToken'); //must be set during login
      console.log("Stored token:", token);
      if (!token) {
        console.error('No token found');
        return;
      }

      const res = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/counselor/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCounselor(res.data);
    } catch (err) {
      console.error('Failed to fetch counselor:', err);
    }
  };

  fetchCounselor();
  }, []);

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem('authToken');
    console.log("Authentication token removed successfully.");

    //Clear state
    setCounselor({ name: '', email: '' });

    //Redirect to login
    navigate('/');
  };

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
    { id: 'referral', icon: AtSign, label: 'Referral' },
    { id: 'filemaintenance', icon: FileArchive, label: 'File Maintenance' },
    { id: 'reports', icon: History, label: 'History and Reports' }
  ];

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
        return <AppointmentApprovalView pendingAppointments={pendingAppointments} />;
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
        
        {/* User Section */}
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {counselor.name ? counselor.name.charAt(0) : 'GC'}
              </div>
            <div>
              <p className="user-name">{counselor.name || 'Loading...'}</p>
              <p className="user-email">{counselor.email || ''}</p>
            </div>
          </div>
          <div className="user-actions">
            <button className="user-action-button settings-button">
              <Settings size={16} />
            </button>

            {/* Logout button */}
            <button className="user-action-button logout-button" onClick={() => setShowModal(true)}>
              <LogOut size={16} />
            </button>

            {showModal && (
            <div className="modal-overlay">
            <div className="modal">
            <h3>Are you sure you want to log out?</h3>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
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