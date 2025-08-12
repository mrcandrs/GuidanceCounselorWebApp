import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, UserCheck, Plus, Search, Filter, Bell, Settings, LogOut, Eye, Edit, Trash2, Check, X, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';
import axios from "axios";

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  
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

  //Students List View
  const StudentsListView = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const getMoodBadgeClass = (mood) => {
    switch (mood) {
      case 'MILD':
        return 'mood-badge mood-mild';
      case 'MODERATE':
        return 'mood-badge mood-moderate';
      case 'HIGH':
        return 'mood-badge mood-high';
      default:
        return 'mood-badge mood-neutral';
      }
    };

    //Fetching student data from API
    useEffect(() => {
      axios
        .get("https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood")
        .then((response) => {
          setStudents(response.data);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
      }, []);

    //Filter students by search term
    const filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
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

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Student No.</th>
                <th className="table-header-cell">Program and Year</th>
                <th className="table-header-cell">Last Mood Level</th>
                <th className="table-header-cell">Date Registered</th>
                <th className="table-header-cell">Last Login</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
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
                  <td className="table-cell">{student.studentno}</td>
                  <td className="table-cell">
                    {student.program} - {student.section}
                  </td>
                  <td className="table-cell">
                    <span className={getMoodBadgeClass(student.lastMood)}>
                      {student.lastMood || "N/A"}
                    </span>
                  </td>
                  <td className="table-cell">
                    {student.dateregistered ? new Date(student.dateregistered).toLocaleString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) : 'N/A'}
                  </td>
                  <td className="table-cell">
                    {student.lastlogin ? new Date(student.lastlogin).toLocaleString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) : 'N/A'}
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const colorForMood = (mood) => {
  switch (mood) {
      case "MILD": return "#34C759";
      case "MODERATE": return "#009951";
      case "HIGH": return "#1B5E20";
      case "N/A": return "#64748b";
      default: return "#999";
    }
  };

  const MoodTrendChart = ({ data }) => {
  // data expected: [{date: '2025-08-01', mild:0, moderate:1, high:2, na:0}, ...]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="mild" stroke={colorForMood("MILD")} />
        <Line type="monotone" dataKey="moderate" stroke={colorForMood("MODERATE")} />
        <Line type="monotone" dataKey="high" stroke={colorForMood("HIGH")} />
        <Line type="monotone" dataKey="na" stroke={colorForMood("N/A")} />
      </LineChart>
    </ResponsiveContainer>
    );
  };

  const MoodInsightsView = () => {
  const [distribution, setDistribution] = useState([]);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchAll = async () => {
      try {
        const [distRes, trendsRes, alertsRes] = await Promise.all([
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/distribution`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/daily-trends`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/alerts`)
        ]);

        setDistribution(distRes.data || []);
        setTrends(trendsRes.data || []);
        setAlerts(alertsRes.data || []);
      } catch (err) {
        console.error("Error fetching mood insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Map distribution into displayable array with colors
  const moodData = distribution.map(item => ({
    mood: item.mood,
    count: item.count,
    color: colorForMood(item.mood)
  }));

  return (
    <div className="page-container">
      <h2 className="page-title">Student Mood Insights</h2>

        {/* Overall Mood Distribution */}
        <div className="card">
          <h3 className="card-title">Overall Mood Distribution</h3>

          {loading ? (
            <p>Loading...</p>
          ) : moodData.length === 0 ? (
            <p>No data</p>
          ) : (
            <div>
              {moodData.map((m, index) => (
                <div key={index} className="mood-item" style={{display:'flex', justifyContent:'space-between', padding: '8px 0'}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="mood-dot" style={{width:12, height:12, borderRadius:6, backgroundColor:m.color}} />
                    <span style={{fontSize:14, fontWeight:500}}>{m.mood}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{m.count} students</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly/Daily Trends (chart) */}
        <div className="card">
          <h3 className="card-title">Weekly Trends</h3>
          {loading ? (
            <p>Loading chart...</p>
          ) : trends.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={48} className="empty-icon" />
              <p>No trend data yet</p>
            </div>
          ) : (
            <MoodTrendChart data={trends} />
          )}
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="card-title">Alerts</h3>
          {loading ? (
            <p>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p>No alerts at the moment</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className={`alert-card alert-${a.level}`} style={{marginBottom:12, padding:12, borderRadius:8, background: a.level === 'high' ? '#FEE2E2' : a.level === 'moderate' ? '#FEF3C7' : '#EFF6FF' }}>
                <p style={{margin:0, color: a.level === 'high' ? '#991B1B' : a.level === 'moderate' ? '#92400E' : '#1E3A8A'}}>{a.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

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