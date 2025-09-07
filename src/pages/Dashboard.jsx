import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, UserCheck, Plus, AtSign, Filter, Bell, Settings, LogOut, FileArchive, Edit, History, X } from 'lucide-react';
import StudentsListView from './StudentsListView';
import AppointmentApprovalView from './AppointmentApprovalView';
import MoodInsightsView from './MoodInsightsView';
import EndorsementCustodyView from './EndorsementCustodyView';
import ConsultationConferenceView from './ConsultationConferenceView';
import GuidanceNotesView from './GuidanceNotesView';
import '../styles/Dashboard.css';
import axios from "axios";

const GuidanceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map URL paths to tab IDs
  const pathToTabMap = {
    '/dashboard': 'students',
    '/dashboard/students-list': 'students',
    '/dashboard/mood-insights': 'mood',
    '/dashboard/endorsement-custody': 'endorsement',
    '/dashboard/consultation-conference-forms': 'consultation',
    '/dashboard/counseling-notes': 'notes',
    '/dashboard/guidance-pass': 'pass',
    '/dashboard/appointment-approval': 'appointments',
    '/dashboard/referral': 'referral',
    '/dashboard/file-maintenance': 'filemaintenance',
    '/dashboard/history-reports': 'reports'
  };

  // Map tab IDs to URL paths
  const tabToPathMap = {
    'students': '/dashboard/students-list',
    'mood': '/dashboard/mood-insights',
    'endorsement': '/dashboard/endorsement-custody',
    'consultation': '/dashboard/consultation-conference-forms',
    'notes': '/dashboard/counseling-notes',
    'pass': '/dashboard/guidance-pass',
    'appointments': '/dashboard/appointment-approval',
    'referral': '/dashboard/referral',
    'filemaintenance': '/dashboard/file-maintenance',
    'reports': '/dashboard/history-reports'
  };

  // Set active tab based on current URL
  const [activeTab, setActiveTab] = useState(() => {
    return pathToTabMap[location.pathname] || 'students';
  });

  const [counselor, setCounselor] = useState({ name: '', email: '' });
  const [showModal, setShowModal] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Update active tab when URL changes
  useEffect(() => {
    const currentTab = pathToTabMap[location.pathname] || 'students';
    setActiveTab(currentTab);
    
    // If user navigates to /dashboard, redirect to /dashboard/students-list
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/students-list', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Handle tab changes - now updates URL
  const handleTabChange = (tabId) => {
    const path = tabToPathMap[tabId];
    if (path) {
      navigate(path);
    }
    setActiveTab(tabId);
  };

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

  // Fetch alerts for notifications
  const fetchAlerts = async () => {
    setNotificationLoading(true);
    try {
      const res = await axios.get(
        "https://guidanceofficeapi-production.up.railway.app/api/moodtracker/alerts"
      );
      setAlerts(res.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle notification bell click
  const handleNotificationClick = () => {
    if (!showNotifications) {
      fetchAlerts();
    }
    setShowNotifications(!showNotifications);
  };

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

  const sidebarItems = [
    { id: 'students', icon: Users, label: 'Students List' },
    { id: 'mood', icon: TrendingUp, label: 'Mood Insights' },
    { id: 'endorsement', icon: FileText, label: 'Endorsement and Custody' },
    { id: 'consultation', icon: ClipboardList, label: 'Consultation/Conference Forms' },
    { id: 'notes', icon: Edit, label: 'Guidance/Counseling Notes' },
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
        return <EndorsementCustodyView />;
      case 'consultation':
        return <ConsultationConferenceView />;
      case 'notes':
        return <GuidanceNotesView />;
      case 'pass':
        return <GenericFormView title="Guidance Pass" description="Generate guidance passes for approved students." />;
      case 'referral':
        return <GenericFormView title="Referral" description="View student referral forms." />;
      case 'filemaintenance':
        return <GenericFormView title="File Maintenance" description="Adjust and adapt system assets." />;
      case 'reports':
        return <GenericFormView title="History and Reports" description="View tracked history and detailed reports." />;
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
              onClick={() => handleTabChange(item.id)}
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
              <div style={{ position: 'relative' }}>
                <button 
                  className="notification-button" 
                  onClick={handleNotificationClick}
                  style={{ position: 'relative' }}
                >
                  <Bell size={20} />
                  {alerts.length > 0 && (
                    <span className="notification-badge" style={{ 
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {alerts.length > 9 ? '9+' : alerts.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    minWidth: '320px',
                    maxHeight: '400px',
                    marginTop: '8px'
                  }}>
                    <div style={{ 
                      padding: '16px 20px', 
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        Mood Alerts
                      </h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        style={{ 
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notificationLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                          <p>Loading alerts...</p>
                        </div>
                      ) : alerts.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                          <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                          <p style={{ margin: 0 }}>No alerts at the moment</p>
                        </div>
                      ) : (
                        alerts.map((alert, index) => (
                          <div 
                            key={index} 
                            style={{
                              padding: '16px 20px',
                              borderBottom: index < alerts.length - 1 ? '1px solid #f3f4f6' : 'none',
                              background: alert.level === 'high' ? '#FEF2F2' : 
                                         alert.level === 'moderate' ? '#FFFBEB' : '#EFF6FF'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: alert.level === 'high' ? '#EF4444' :
                                                alert.level === 'moderate' ? '#F59E0B' : '#3B82F6',
                                marginTop: '6px',
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: '14px',
                                  color: alert.level === 'high' ? '#991B1B' :
                                         alert.level === 'moderate' ? '#92400E' : '#1E40AF',
                                  lineHeight: '1.4'
                                }}>
                                  {alert.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {alerts.length > 0 && (
                      <div style={{ 
                        padding: '12px 20px',
                        borderTop: '1px solid #e5e7eb',
                        background: '#f9fafb'
                      }}>
                        <button 
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: 'none',
                            background: 'none',
                            color: '#6b7280',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                          onClick={() => {
                            setShowNotifications(false);
                            handleTabChange('mood');
                          }}
                        >
                          View Mood Insights →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
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