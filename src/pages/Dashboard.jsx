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
  const [notifications, setNotifications] = useState([]);

  // persisted read keys
  const [readKeys, setReadKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('readNotificationKeys');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const fetchingRef = React.useRef(false);


  const persistReadKeys = (nextSet) => {
  setReadKeys(new Set(nextSet));
  localStorage.setItem('readNotificationKeys', JSON.stringify(Array.from(nextSet)));
  };

  // Update active tab when URL changes
  useEffect(() => {
    const currentTab = pathToTabMap[location.pathname] || 'students';
    setActiveTab(currentTab);
    
    // If user navigates to /dashboard, redirect to /dashboard/students-list
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/students-list', { replace: true });
    }
  }, [location.pathname, navigate]);

  //Background polling 
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5000); // 5s
    const onFocus = () => fetchNotifications();
    const onStorage = (e) => {
      if (e.key === 'readNotificationKeys') fetchNotifications();
    };

    fetchNotifications(); // initial
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // create a stable key that doesn't fluctuate with counts
  const getNotificationKey = (n) => {
    if (n.type === 'appointments') {
      return `appointments-pending-${n.count || 0}-${n.latestId || n.latestAt || 'none'}`;
    }
    if (n.type === 'mood') {
      return `mood-${n.level || 'info'}-${n.message || ''}`;
    }
    return `${n.type}-${n.level || 'info'}-${n.message || ''}`;
  };

  const unreadCount = notifications.filter(n => !readKeys.has(getNotificationKey(n))).length;

  // Handle tab changes - now updates URL
  const handleTabChange = (tabId) => {
    const path = tabToPathMap[tabId];
    if (path) {
      navigate(path);
    }
    setActiveTab(tabId);
  };

  // Function to fetch pending appointments
  const fetchPendingAppointments = async () => {
    try {
      const res = await axios.get(
        "https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/pending-appointments"
      );
      setPendingAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  //Use effect for pending appointments
  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  // Replace your existing fetchAlerts with this unified fetcher
  const fetchNotifications = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setNotificationLoading(true);
    try {
      const [moodRes, pendingRes] = await Promise.all([
        axios.get("https://guidanceofficeapi-production.up.railway.app/api/moodtracker/alerts"),
        axios.get("https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/pending-appointments"),
      ]);

      const moodAlerts = (moodRes.data || []).map(a => ({
        ...a,
        type: 'mood',
        level: a.level || 'info'
      }));

      const pending = pendingRes.data || [];
      const latestPendingId = pending[0]?.appointmentId || null;
      const latestPendingAt = pending[0]?.createdAt || null;

      const appointmentAlert = pending.length > 0
        ? [{
            type: 'appointments',
            level: pending.length >= 5 ? 'high' : pending.length >= 2 ? 'moderate' : 'info',
            message: `${pending.length} pending appointment${pending.length > 1 ? 's' : ''} awaiting approval`,
            count: pending.length,
            latestId: latestPendingId,
            latestAt: latestPendingAt
          }]
        : [];

      setNotifications([...appointmentAlert, ...moodAlerts]);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      fetchingRef.current = false;
      setNotificationLoading(false);
    }
  };

  // Handle notification bell click
  const handleNotificationClick = () => {
  if (!showNotifications) {
    fetchNotifications();
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
    { id: 'appointments', icon: Calendar, label: 'Appointment Approval' },
    { id: 'pass', icon: UserCheck, label: 'Guidance Pass' },
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
        return <AppointmentApprovalView 
          pendingAppointments={pendingAppointments}
          onAppointmentUpdate={fetchPendingAppointments} />;
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
                  {unreadCount > 0 && (
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
                      {unreadCount > 9 ? '9+' : unreadCount}
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
                        Notifications
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
                          <p>Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                          <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                          <p style={{ margin: 0 }}>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n, index) => {
                          const bg = n.level === 'high' ? '#FEF2F2'
                            : n.level === 'moderate' ? '#FFFBEB'
                            : '#EFF6FF';
                          const dot = n.level === 'high' ? '#EF4444'
                            : n.level === 'moderate' ? '#F59E0B'
                            : '#3B82F6';
                          const text = n.level === 'high' ? '#991B1B'
                            : n.level === 'moderate' ? '#92400E'
                            : '#1E40AF';

                          const key = getNotificationKey(n);
                          const isRead = readKeys.has(key);
                          const opacity = isRead ? 0.6 : 1;

                          // base level color
                          const dotBase = n.level === 'high' ? '#EF4444'
                            : n.level === 'moderate' ? '#F59E0B'
                            : '#3B82F6';

                          // override to grey when read
                          const dotColor = isRead ? '#d1d5db' : dotBase;

                          return (
                            <div 
                              key={index} 
                              style={{
                                padding: '16px 20px',
                                borderBottom: index < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                                background: bg,
                                cursor: 'pointer',
                                opacity
                              }}
                              onClick={() => {
                                // mark this one as read
                                const next = new Set(readKeys);
                                next.add(key);
                                persistReadKeys(next);
                                
                                setShowNotifications(false);
                                if (n.type === 'appointments') handleTabChange('appointments');
                                if (n.type === 'mood') handleTabChange('mood');
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: dotColor,
                                  marginTop: '6px',
                                  flexShrink: 0
                                }} />
                                <div style={{ flex: 1 }}>
                                  <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: text,
                                    lineHeight: '1.4'
                                  }}>
                                    {n.message}
                                  </p>
                                  {n.type === 'appointments' && typeof n.count === 'number' && (
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>
                                      Tap to review pending appointments
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    <div style={{ 
                      padding: '12px 20px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button 
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          background: 'white',
                          color: '#374151',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                        onClick={() => {
                          setShowNotifications(false);
                          setShowNotificationCenter(true);
                        }}
                      >
                        View all Notifications →
                      </button>
                      
                      {unreadCount > 0 && (
                        <button
                          style={{
                            padding: '8px',
                            border: 'none',
                            background: '#0477BF',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            borderRadius: '6px'
                          }}
                          onClick={() => {
                            const allKeys = new Set(readKeys);
                            notifications.forEach(n => allKeys.add(getNotificationKey(n)));
                            persistReadKeys(allKeys);
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

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

      {/* ADD THE ALL-NOTIFICATIONS MODAL HERE */}
      {showNotificationCenter && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '520px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0 }}>All Notifications</h3>

            {notifications.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No notifications</p>
            ) : (
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {notifications.map((n, i) => {
                  const key = getNotificationKey(n);
                  const isRead = readKeys.has(key);
                  const itemBg = isRead ? '#ffffff' : '#f8fafc';
                  const levelDotBase =
                    n.level === 'high' ? '#EF4444' :
                    n.level === 'moderate' ? '#F59E0B' : '#3B82F6';
                  const levelDot = isRead ? '#d1d5db' : levelDotBase;

                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e5e7eb',
                        background: itemBg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const next = new Set(readKeys);
                        next.add(key);
                        persistReadKeys(next);
                        setShowNotificationCenter(false);
                        if (n.type === 'appointments') handleTabChange('appointments');
                        if (n.type === 'mood') handleTabChange('mood');
                      }}
                      title={n.type === 'appointments' ? 'Go to Appointment Approval' : 'Go to Mood Insights'}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: levelDot, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: '#111827' }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                          {n.type === 'appointments' ? 'Appointment Approval' : 'Mood Insights'}
                        </div>
                      </div>
                      {!isRead && (
                        <button
                          className="filter-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(readKeys);
                            next.add(key);
                            persistReadKeys(next);
                          }}
                          style={{ padding: '6px 8px', fontSize: 12 }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                className="filter-button full-width"
                onClick={() => {
                  const all = new Set(readKeys);
                  notifications.forEach(n => all.add(getNotificationKey(n)));
                  persistReadKeys(all);
                }}
              >
                Mark all as read
              </button>
              <button className="primary-button full-width" onClick={() => setShowNotificationCenter(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidanceDashboard;