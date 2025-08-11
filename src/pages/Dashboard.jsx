import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar, 
  ClipboardList, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  LogOut, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock 
} from 'lucide-react';

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data
  const students = [
    { id: 1, name: 'John Doe', grade: '12', section: 'A', status: 'Active', lastMood: 'Happy', consultations: 3 },
    { id: 2, name: 'Jane Smith', grade: '11', section: 'B', status: 'Active', lastMood: 'Stressed', consultations: 1 },
    { id: 3, name: 'Mike Johnson', grade: '10', section: 'C', status: 'Active', lastMood: 'Neutral', consultations: 5 },
    { id: 4, name: 'Sarah Wilson', grade: '12', section: 'A', status: 'Active', lastMood: 'Anxious', consultations: 2 },
  ];

  const pendingAppointments = [
    { id: 1, student: 'John Doe', grade: '12-A', reason: 'Academic counseling', date: '2024-08-10', time: '10:00 AM', status: 'pending' },
    { id: 2, student: 'Jane Smith', grade: '11-B', reason: 'Career guidance', date: '2024-08-11', time: '2:00 PM', status: 'pending' },
    { id: 3, student: 'Mike Johnson', grade: '10-C', reason: 'Personal issues', date: '2024-08-12', time: '9:00 AM', status: 'pending' },
  ];

  const moodData = [
    { mood: 'Happy', count: 45, color: '#22c55e' },
    { mood: 'Neutral', count: 32, color: '#64748b' },
    { mood: 'Stressed', count: 28, color: '#f59e0b' },
    { mood: 'Anxious', count: 15, color: '#ef4444' },
    { mood: 'Sad', count: 8, color: '#8b5cf6' },
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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      fontFamily: 'Arial, sans-serif'
    },
    sidebar: {
      width: '256px',
      backgroundColor: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    sidebarHeader: {
      padding: '24px',
      background: 'linear-gradient(to right, #0477BF, #0369a1)',
      color: 'white'
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: '0 0 4px 0'
    },
    sidebarSubtitle: {
      fontSize: '14px',
      color: '#bfdbfe',
      margin: 0
    },
    nav: {
      flex: 1,
      marginTop: '24px'
    },
    navButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      border: 'none',
      backgroundColor: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px'
    },
    navButtonActive: {
      backgroundColor: '#dbeafe',
      borderRight: '4px solid #0477BF',
      color: '#0477BF'
    },
    navButtonHover: {
      backgroundColor: '#f9fafb'
    },
    userSection: {
      padding: '24px',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#0477BF',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold'
    },
    userName: {
      fontWeight: '500',
      color: '#1f2937',
      margin: '0 0 2px 0',
      fontSize: '14px'
    },
    userEmail: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    userActions: {
      display: 'flex',
      gap: '8px'
    },
    userActionButton: {
      flex: 1,
      padding: '8px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    settingsButton: {
      backgroundColor: '#f3f4f6'
    },
    logoutButton: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 4px 0'
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    notificationButton: {
      position: 'relative',
      padding: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: '#6b7280'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '12px',
      height: '12px',
      backgroundColor: '#ef4444',
      borderRadius: '50%'
    },
    headerAvatar: {
      width: '32px',
      height: '32px',
      backgroundColor: '#F2E205',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1f2937',
      fontWeight: 'bold'
    },
    content: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    pageContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    pageTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    primaryButton: {
      backgroundColor: '#0477BF',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 16px 0'
    },
    searchContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px'
    },
    searchInputContainer: {
      flex: 1,
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '8px 8px 8px 40px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '8px',
      color: '#9ca3af'
    },
    filterButton: {
      backgroundColor: '#f3f4f6',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb'
    },
    tableHeaderCell: {
      padding: '12px 24px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer'
    },
    tableCell: {
      padding: '16px 24px',
      fontSize: '14px'
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center'
    },
    studentAvatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#0477BF',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      marginRight: '16px'
    },
    studentName: {
      fontWeight: '500',
      color: '#1f2937',
      margin: '0 0 2px 0'
    },
    studentStatus: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    moodBadge: {
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '9999px'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px'
    },
    actionButton: {
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      padding: '4px'
    },
    grid: {
      display: 'grid',
      gap: '24px'
    },
    gridCols1: {
      gridTemplateColumns: '1fr'
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    moodItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    moodIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    moodDot: {
      width: '16px',
      height: '16px',
      borderRadius: '50%'
    },
    appointmentCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    appointmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    appointmentActions: {
      display: 'flex',
      gap: '8px'
    },
    approveButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    appointmentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '12px',
      color: '#6b7280'
    },
    timeSlotGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px'
    },
    timeSlotButton: {
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 0',
      color: '#6b7280'
    },
    emptyIcon: {
      margin: '0 auto 16px',
      color: '#d1d5db'
    },
    alertCard: {
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '12px'
    },
    alertRed: {
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #f87171'
    },
    alertYellow: {
      backgroundColor: '#fffbeb',
      borderLeft: '4px solid #fbbf24'
    }
  };

  const getMoodBadgeStyle = (mood) => {
    const baseStyle = { ...styles.moodBadge };
    switch (mood) {
      case 'Happy':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'Stressed':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Anxious':
        return { ...baseStyle, backgroundColor: '#fecaca', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const StudentsListView = () => (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Students List</h2>
        <button style={styles.primaryButton}>
          <Plus size={20} />
          Add Student
        </button>
      </div>
      
      <div style={styles.card}>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputContainer}>
            <Search style={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search students..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.filterButton}>
            <Filter size={20} />
            Filter
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Student</th>
                <th style={styles.tableHeaderCell}>Grade & Section</th>
                <th style={styles.tableHeaderCell}>Last Mood</th>
                <th style={styles.tableHeaderCell}>Consultations</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.studentInfo}>
                      <div style={styles.studentAvatar}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div style={styles.studentName}>{student.name}</div>
                        <div style={styles.studentStatus}>{student.status}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    Grade {student.grade} - {student.section}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={getMoodBadgeStyle(student.lastMood)}>
                      {student.lastMood}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {student.consultations}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button style={{ ...styles.actionButton, color: '#0477BF' }}>
                        <Eye size={16} />
                      </button>
                      <button style={{ ...styles.actionButton, color: '#10b981' }}>
                        <Edit size={16} />
                      </button>
                      <button style={{ ...styles.actionButton, color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MoodInsightsView = () => (
    <div style={styles.pageContainer}>
      <h2 style={styles.pageTitle}>Student Mood Insights</h2>
      
      <div style={{ ...styles.grid, ...styles.gridCols3 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Overall Mood Distribution</h3>
          <div>
            {moodData.map((mood, index) => (
              <div key={index} style={styles.moodItem}>
                <div style={styles.moodIndicator}>
                  <div style={{ ...styles.moodDot, backgroundColor: mood.color }}></div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{mood.mood}</span>
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{mood.count} students</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Weekly Trends</h3>
          <div style={styles.emptyState}>
            <TrendingUp size={48} style={styles.emptyIcon} />
            <p>Mood trend chart would be displayed here</p>
          </div>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Alerts</h3>
          <div>
            <div style={{ ...styles.alertCard, ...styles.alertRed }}>
              <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>
                5 students reported feeling anxious this week
              </p>
            </div>
            <div style={{ ...styles.alertCard, ...styles.alertYellow }}>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                Stress levels increased by 15% compared to last week
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AppointmentApprovalView = () => (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Appointment Approval</h2>
        <button style={styles.primaryButton}>
          <Calendar size={20} />
          Set Available Times
        </button>
      </div>
      
      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pending Appointments</h3>
          <div>
            {pendingAppointments.map((appointment) => (
              <div key={appointment.id} style={styles.appointmentCard}>
                <div style={styles.appointmentHeader}>
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {appointment.student}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {appointment.grade}
                    </p>
                  </div>
                  <div style={styles.appointmentActions}>
                    <button style={styles.approveButton}>
                      <Check size={16} />
                    </button>
                    <button style={styles.rejectButton}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
                  {appointment.reason}
                </p>
                <div style={styles.appointmentMeta}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {appointment.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {appointment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Available Time Slots</h3>
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input type="date" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Time Slots</label>
              <div style={styles.timeSlotGrid}>
                {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button key={time} style={styles.timeSlotButton}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button style={{ ...styles.primaryButton, width: '100%', justifyContent: 'center' }}>
              Update Available Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const GenericFormView = ({ title, description }) => (
    <div style={styles.pageContainer}>
      <h2 style={styles.pageTitle}>{title}</h2>
      
      <div style={styles.card}>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={styles.primaryButton}>
              <Plus size={20} />
              Create New
            </button>
            <button style={styles.filterButton}>
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>
        
        <div style={styles.emptyState}>
          <FileText size={48} style={styles.emptyIcon} />
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
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.sidebarTitle}>Guidance Portal</h1>
          <p style={styles.sidebarSubtitle}>Counselor Dashboard</p>
        </div>
        
        <nav style={styles.nav}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(activeTab === item.id ? styles.navButtonActive : {}),
                color: activeTab === item.id ? '#0477BF' : '#374151'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>GC</div>
            <div>
              <p style={styles.userName}>Guidance Counselor</p>
              <p style={styles.userEmail}>counselor@school.edu</p>
            </div>
          </div>
          <div style={styles.userActions}>
            <button style={{ ...styles.userActionButton, ...styles.settingsButton }}>
              <Settings size={16} />
            </button>
            <button style={{ ...styles.userActionButton, ...styles.logoutButton }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h2 style={styles.headerTitle}>
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p style={styles.headerSubtitle}>Manage student guidance and counseling</p>
            </div>
            
            <div style={styles.headerActions}>
              <button style={styles.notificationButton}>
                <Bell size={20} />
                <span style={styles.notificationBadge}></span>
              </button>
              <div style={styles.headerAvatar}>GC</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GuidanceDashboard;