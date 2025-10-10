import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, Menu, UserCheck, Plus, AtSign, Filter, Bell, Settings, LogOut, FileArchive, Edit, History, X, Clock, AlertTriangle, Lock } from 'lucide-react';
import useSessionTimeout from '../hooks/useSessionTimeout';
import StudentsListView from './StudentsListView';
import AppointmentApprovalView from './AppointmentApprovalView';
import MoodInsightsView from './MoodInsightsView';
import EndorsementCustodyView from './EndorsementCustodyView';
import ConsultationConferenceView from './ConsultationConferenceView';
import GuidanceNotesView from './GuidanceNotesView';
import GuidancePassView from './GuidancePassView';
import ReferralView from './ReferralView';
import FileMaintenanceView from './FileMaintenanceView';
import HistoryReportsView from './HistoryReportsView';
import { SessionValidator, clearSessionInfo } from '../utils/sessionManager';
import SettingsModal from '../components/SettingsModal';
import UserProfileModal from '../components/UserProfileModal';
import axios from 'axios';
import '../styles/ModalStyles.css';

const GuidanceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Session timeout configuration (1 minute timeout, 30 seconds warning)
  const { isWarning, timeLeft, isActive, extendSession, forceLogout } = useSessionTimeout(1, 0.5);
  
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Session validation state
  const [sessionValidator] = useState(() => new SessionValidator());
  const [showSessionInvalidatedModal, setShowSessionInvalidatedModal] = useState(false);
  const [sessionInvalidationReason, setSessionInvalidationReason] = useState('');

  // App Lock state
  const [isLocked, setIsLocked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appLocked') || 'false');
    } catch {
      return false;
    }
  });
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000); // tick every second
    return () => clearInterval(id);
  }, []);

  const currentDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const currentTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // persisted read keys
  const [readKeys, setReadKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('readNotificationKeys');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  const persistReadKeys = (nextSet) => {
    setReadKeys(new Set(nextSet));
    localStorage.setItem('readNotificationKeys', JSON.stringify(Array.from(nextSet)));
  };

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [autoCollapsed, setAutoCollapsed] = useState(false); 

  useEffect(() => {
   const update = () => {
     // collapse when viewport is narrow or when zoom reduces CSS px
     setAutoCollapsed(window.innerWidth < 1200);
   };
   update();
   window.addEventListener('resize', update);
   return () => window.removeEventListener('resize', update);
 }, []);

  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const fetchingRef = React.useRef(false);


  // Session validation effect
  useEffect(() => {
    const handleSessionInvalidated = (reason) => {
      console.log('🎯 Dashboard: Session invalidated callback received:', reason);
      setSessionInvalidationReason(reason);
      setShowSessionInvalidatedModal(true);
      console.log('🎯 Dashboard: Modal state set to true');
    };

    // Start session validation
    sessionValidator.startValidation(5000, handleSessionInvalidated); // Check every 5 seconds for testing

    // Cleanup on unmount
    return () => {
      sessionValidator.stopValidation();
    };
  }, [sessionValidator]);

  // Persist lock state
  useEffect(() => {
    localStorage.setItem('appLocked', JSON.stringify(isLocked));
  }, [isLocked]);

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


  // Handle session timeout - redirect to login when session expires
  useEffect(() => {
    if (!isActive) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      setCounselor({ name: '', email: '' });
      navigate('/', { replace: true });
    }
  }, [isActive, navigate]);

  // create a stable key that doesn't fluctuate with counts
  const getNotificationKey = (n) => {
    if (n.type === 'appointments') {
      return `appointments-pending-${n.count || 0}-${n.latestId || n.latestAt || 'none'}`;
    }
    if (n.type === 'referrals') {
    return `referrals-${n.count || 0}-${n.latestId || n.latestAt || 'none'}`;
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
    const token = localStorage.getItem('authToken');
    const [moodRes, pendingRes, referralRes] = await Promise.all([
      axios.get('https://guidanceofficeapi-production.up.railway.app/api/moodtracker/alerts'),
      axios.get('https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/pending-appointments'),
      axios.get('https://guidanceofficeapi-production.up.railway.app/api/referral/latest-per-student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);

    const moodAlerts = (moodRes.data || []).map(a => ({ ...a, type: 'mood', level: a.level || 'info' }));

    const pending = pendingRes.data || [];
    const appointmentAlert = pending.length > 0 ? [{
      type: 'appointments',
      level: pending.length >= 5 ? 'high' : pending.length >= 2 ? 'moderate' : 'info',
      message: `${pending.length} pending appointment${pending.length > 1 ? 's' : ''} awaiting approval`,
      count: pending.length,
      latestId: pending[0]?.appointmentId || null,
      latestAt: pending[0]?.createdAt || null
    }] : [];

    const referrals = referralRes.data || [];
    const newReferrals = referrals.filter(r => {
      // Check if this referral was submitted recently (within last 24 hours)
      const submissionDate = new Date(r.submissionDate);
      const now = new Date();
      const hoursDiff = (now - submissionDate) / (1000 * 60 * 60);
      return hoursDiff <= 24; // Only show referrals submitted in last 24 hours
    });
    
    const referralAlert = newReferrals.length > 0 ? [{
      type: 'referrals',
      level: newReferrals.length >= 3 ? 'moderate' : 'info',
      message: `${newReferrals.length} new referral${newReferrals.length > 1 ? 's' : ''} submitted`,
      count: newReferrals.length,
      latestId: newReferrals[0]?.referralId || null,
      latestAt: newReferrals[0]?.submissionDate || null
    }] : [];

    setNotifications([...appointmentAlert, ...referralAlert, ...moodAlerts]);
  } catch (e) {
    console.error('Error fetching notifications:', e);
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
    // Stop session validation
    sessionValidator.stopValidation();
    
    // Clear session info
    clearSessionInfo();
    // Clear any persisted lock state
    localStorage.removeItem('appLocked');
    console.log("Authentication token and session info removed successfully.");

    //Clear state
    setCounselor({ name: '', email: '' });

    //Redirect to login
    navigate('/');
  };

  // Handle forced logout due to session invalidation
  const handleForcedLogout = () => {
    sessionValidator.stopValidation();
    clearSessionInfo();
    localStorage.removeItem('appLocked');
    setCounselor({ name: '', email: '' });
    navigate('/');
  };

  const handleCounselorUpdate = (updatedCounselor) => {
    setCounselor(prev => ({ ...prev, ...updatedCounselor }));
  };

  const sidebarItems = [
    { id: 'students', icon: Users, label: 'Students List' },
    { id: 'mood', icon: TrendingUp, label: 'Mood Insights' },
    { id: 'consultation', icon: ClipboardList, label: 'Consultation/Conference Forms' },
    { id: 'notes', icon: Edit, label: 'Guidance/Counseling Notes' },
    { id: 'appointments', icon: Calendar, label: 'Appointment Approval' },
    { id: 'pass', icon: UserCheck, label: 'Guidance Pass' },
    { id: 'referral', icon: AtSign, label: 'Referral' },
    { id: 'endorsement', icon: FileText, label: 'Endorsement and Custody' },
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
        return <GuidancePassView />;
      case 'referral':
        return <ReferralView />;
      case 'filemaintenance':
        return <FileMaintenanceView />;
      case 'reports':
        return <HistoryReportsView />;
      default:
        return <StudentsListView />;
    }
  };

  return (
    <div className="dashboard-container">


  {/* Session Timeout Warning Modal */}
  {isWarning && !showSessionInvalidatedModal && !isLocked && (
    <div className="modal-overlay session-timeout-modal">
      <div className="modal session-timeout-warning">
        <div className="session-timeout-header">
          <AlertTriangle className="session-timeout-icon" size={32} />
          <h3>Session Timeout Warning</h3>
        </div>
        <div className="session-timeout-content">
          <p>Your session will expire in <strong>{timeLeft}</strong> due to inactivity.</p>
          <p>Click "Stay Logged In" to continue your session, or you will be automatically logged out.</p>
        </div>
        <div className="session-timeout-actions">
          <button 
            className="session-timeout-extend" 
            onClick={extendSession}
          >
            <Clock size={16} />
            Stay Logged In
          </button>
          <button 
            className="session-timeout-logout" 
            onClick={forceLogout}
          >
            <LogOut size={16} />
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )}
   
      {/* Sidebar */}
      <div className={`sidebar ${(isCollapsed || autoCollapsed) ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ textAlign: 'center', userSelect: 'none', caretColor: 'transparent'}}>
            <img
              src="/sti-tarlac-logo.png"
              alt="STI Tarlac Logo"
              style={{ width: '150px', height: '150px', objectFit: 'contain', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleTabChange('students')}
              draggable={false}
            />
          </div>
          <h1 className="sidebar-title">Guidance and Counseling Office</h1>
          <p className="sidebar-subtitle">Counselor Web Application</p>
        </div>
        
        <nav className="nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
              data-label={item.label}
              aria-label={item.label}
            >
              <item.icon size={20} />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* User Section */}
        <div className="user-section">
          <div className="user-info" onClick={() => setShowUserProfileModal(true)} style={{ cursor: 'pointer' }}>
            <div className="user-avatar">
              {counselor.name ? counselor.name.charAt(0) : 'GC'}
              </div>
            <div className="user-meta">
              <p className="user-name">{counselor.name || 'Loading...'}</p>
              <p className="user-email">{counselor.email || ''}</p>
            </div>
          </div>
          <div className="user-actions">
            <button 
              className="user-action-button settings-button" 
              onClick={() => setShowSettingsModal(true)}
              title="Settings"
            >
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

      {/* Session Invalidated Modal */}
      {showSessionInvalidatedModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
              <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Session Invalidated</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {sessionInvalidationReason || 'Your session has been invalidated because you logged in on another device.'}
              </p>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleForcedLogout} style={{ width: '100%' }}>
                Return to Login
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            style={{
            position: 'relative',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          >
            <Menu size={20} />
          </button>
            {/*<div>
              <h2 className="header-title">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="header-subtitle">Manage student guidance and counseling</p>
            </div>*/}
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

                {/* Lock Button */}
                <button 
                  className="notification-button" 
                  onClick={() => { setIsLocked(true); setUnlockPassword(''); setUnlockError(''); }}
                  style={{ marginLeft: 8 }}
                  title="Lock application"
                  aria-label="Lock application"
                >
                  <Lock size={20} />
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 11000,
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
                                if (n.type === 'referrals') handleTabChange('referral'); // Fixed: was 'referrals'
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

            {/* Add this here */}
              <div className="header-datetime">
                <span className="header-date">{currentDate}</span>
                <span className="header-time">{currentTime}</span>
              </div>
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
                        if (n.type === 'referrals') handleTabChange('referral');
                      }}
                      // Update the modal title:
                      title={n.type === 'appointments' ? 'Go to Appointment Approval' : 
                             n.type === 'referrals' ? 'Go to Referral' : 
                             n.type === 'mood' ? 'Go to Mood Insights' : 'View Details'}
                      >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: levelDot, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: '#111827' }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                          {n.type === 'appointments' ? 'Appointment Approval' : 
                            n.type === 'referrals' ? 'Referral' : 
                            n.type === 'mood' ? 'Mood Insights' : 'Notification'}
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

      {/* Global App Lock Overlay */}
      {isLocked && !showSessionInvalidatedModal && (
        <div className="modal-overlay" style={{ 
          zIndex: 20000, 
          backdropFilter: 'blur(8px)', 
          backgroundColor: 'rgba(0, 0, 0, 0.3)' 
        }}>
          <div className="modal" style={{ width: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Lock size={40} style={{ color: '#111827', marginBottom: 8 }} />
              <h3 style={{ margin: 0 }}>Web Application Locked</h3>
              <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>Enter your password to continue.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input 
                type="password"
                className="form-control"
                placeholder="Password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('unlock-submit')?.click();
                  }
                }}
                autoFocus
              />
              {unlockError && (
                <div style={{ color: '#b91c1c', fontSize: 13 }}>{unlockError}</div>
              )}
              <div className="modal-actions" style={{ display: 'flex', gap: 8 }}>
                <button 
                  id="unlock-submit"
                  className="confirm-btn"
                  disabled={unlockLoading || !unlockPassword}
                  onClick={async () => {
                    setUnlockError('');
                    setUnlockLoading(true);
                    try {
                      const tokenBefore = localStorage.getItem('authToken');
                      const deviceId = localStorage.getItem('deviceId');
                      const sessionId = localStorage.getItem('sessionId');
                      const email = counselor?.email || '';
                      if (!email) {
                        throw new Error('Missing counselor email');
                      }
                      const res = await axios.post(
                        'https://guidanceofficeapi-production.up.railway.app/api/counselor/login',
                        {
                          email: email.trim().toLowerCase(),
                          password: unlockPassword.trim(),
                          deviceId,
                          sessionId
                        }
                      );
                      const newToken = res?.data?.token;
                      if (!newToken) throw new Error('No token received');
                      localStorage.setItem('authToken', newToken);
                      setIsLocked(false);
                      setUnlockPassword('');
                      // Resume session validation after unlock
                      sessionValidator.startValidation(5000, (reason) => {
                        setSessionInvalidationReason(reason);
                        setShowSessionInvalidatedModal(true);
                      });
                    } catch (err) {
                      const status = err?.response?.status;
                      if (status === 401) setUnlockError('Incorrect password.');
                      else setUnlockError('Unable to verify password. Try again.');
                    } finally {
                      setUnlockLoading(false);
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  {unlockLoading ? 'Verifying…' : 'Unlock'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleLogout}
                  style={{ flex: 1 }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        counselor={counselor}
        onUpdate={handleCounselorUpdate}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        counselor={counselor}
      />
    </div>
  );
};

export default GuidanceDashboard;