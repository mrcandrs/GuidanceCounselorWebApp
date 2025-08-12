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
import '../styles/Dashboard.css';

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data
  const students = [
    { id: 1, name: 'Marc Andres', studentno: '02000302066', program: 'BSIT', section: '4B', status: 'Active', lastMood: 'happy'},
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

  const getMoodBadgeClass = (mood) => {
    switch (mood) {
      case 'Happy':
        return 'mood-badge mood-happy';
      case 'Stressed':
        return 'mood-badge mood-stressed';
      case 'Anxious':
        return 'mood-badge mood-anxious';
      default:
        return 'mood-badge mood-neutral';
    }
  };

  const StudentsListView = () => (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Students List</h2>
      </div>
      
      <div className="card">
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-button">
            <Filter size={20} />
            Filter
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Student No.</th>
                <th className="table-header-cell">Program and Section</th>
                <th className="table-header-cell">Last Mood</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="table-cell">
                    <div className="student-info">
                      <div className="student-avatar">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-status">{student.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {student.studentno}
                  </td>
                  <td className="table-cell">
                    {student.program} - {student.section}
                  </td>
                  <td className="table-cell">
                    <span className={getMoodBadgeClass(student.lastMood)}>
                      {student.lastMood}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      <button className="action-button action-view">
                        <Eye size={16} />
                      </button>
                      <button className="action-button action-edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-button action-delete">
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
    <div className="page-container">
      <h2 className="page-title">Student Mood Insights</h2>
      
      <div className="grid grid-cols-3">
        <div className="card">
          <h3 className="card-title">Overall Mood Distribution</h3>
          <div>
            {moodData.map((mood, index) => (
              <div key={index} className="mood-item">
                <div className="mood-indicator">
                  <div className="mood-dot" style={{ backgroundColor: mood.color }}></div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{mood.mood}</span>
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{mood.count} students</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Weekly Trends</h3>
          <div className="empty-state">
            <TrendingUp size={48} className="empty-icon" />
            <p>Mood trend chart would be displayed here</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Alerts</h3>
          <div>
            <div className="alert-card alert-red">
              <p className="alert-text-red">
                5 students reported feeling anxious this week
              </p>
            </div>
            <div className="alert-card alert-yellow">
              <p className="alert-text-yellow">
                Stress levels increased by 15% compared to last week
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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