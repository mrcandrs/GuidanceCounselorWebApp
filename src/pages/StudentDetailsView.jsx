import React, { useState, useEffect } from 'react';
import { ArrowLeft, ALargeSmall, User, Calendar, Mail, Phone, MapPin, FileText, TrendingUp, Heart, GraduationCap, Users, Clock, AlertCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import '../styles/StudentDetails.css';
import axios from 'axios';
import ConsentFormView from './ConsentFormView';
import InventoryFormView from './InventoryFormView';
import CareerFormView from './CareerFormView';

const StudentDetailsView = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [forms, setForms] = useState({
    consentForm: null,
    inventoryForm: null,
    careerForm: null
  });
  const [moodFilter, setMoodFilter] = useState({
  moodLevel: 'all', // 'all', 'MILD', 'MODERATE', 'HIGH'
  dateRange: 'all', // 'all', 'week', 'month', '3months'
  customStartDate: '',
  customEndDate: ''
});
  const [showMoodFilter, setShowMoodFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingForm, setViewingForm] = useState(null);
  const [imageError, setImageError] = useState(false);


  const API_BASE = 'https://guidanceofficeapi-production.up.railway.app/api';

  // Fetch student details and all related data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        // Fetch student basic info
        const studentResponse = await axios.get(`${API_BASE}/student/${studentId}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        setStudent(studentResponse.data);

        // Fetch mood history
        try {
          const moodResponse = await axios.get(`${API_BASE}/student/${studentId}/mood-history`, {
            headers: { 'Content-Type': 'application/json' }
          });
          setMoodHistory(moodResponse.data || []);
        } catch (moodError) {
          console.log('No mood history found or endpoint not available');
          setMoodHistory([]);
        }

        // Check form submissions
        await checkFormSubmissions();

      } catch (error) {
        console.error('Error fetching student data:', error);
        alert('Failed to load student details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const checkFormSubmissions = async () => {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
      // Check Consent Form
      try {
        const consentResponse = await axios.get(`${API_BASE}/student/${studentId}/consent-form`, { headers });
        setForms(prev => ({
          ...prev,
          consentForm: consentResponse.data ? { 
            submitted: true, 
            date: consentResponse.data.signedDate || consentResponse.data.createdAt,
            data: consentResponse.data
          } : { submitted: false }
        }));
      } catch (error) {
        setForms(prev => ({ ...prev, consentForm: { submitted: false } }));
      }

      // Check Inventory Form  
      try {
        const inventoryResponse = await axios.get(`${API_BASE.replace('/api', '')}/api/inventory/${studentId}`, { headers });
        setForms(prev => ({
          ...prev,
          inventoryForm: inventoryResponse.data ? {
            submitted: true,
            date: inventoryResponse.data.submissionDate || inventoryResponse.data.createdAt,
            data: inventoryResponse.data
          } : { submitted: false }
        }));
      } catch (error) {
        setForms(prev => ({ ...prev, inventoryForm: { submitted: false } }));
      }

      // Check Career Planning Form
      try {
        const careerResponse = await axios.get(`${API_BASE.replace('/api', '')}/api/careerplanning/${studentId}`, { headers });
        setForms(prev => ({
          ...prev,
          careerForm: careerResponse.data ? {
            submitted: true,
            date: careerResponse.data.submittedAt || careerResponse.data.createdAt,
            data: careerResponse.data
          } : { submitted: false }
        }));
      } catch (error) {
        setForms(prev => ({ ...prev, careerForm: { submitted: false } }));
      }

    } catch (error) {
      console.error('Error checking form submissions:', error);
    }
  };

  // Add this filter function
const filterMoodHistory = (moodHistory) => {
  let filtered = [...moodHistory];

  // Filter by mood level
  if (moodFilter.moodLevel !== 'all') {
    filtered = filtered.filter(entry => entry.moodLevel === moodFilter.moodLevel);
  }

  // Filter by date range
  if (moodFilter.dateRange !== 'all') {
    const now = new Date();
    let startDate;

    switch (moodFilter.dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (moodFilter.customStartDate && moodFilter.customEndDate) {
          startDate = new Date(moodFilter.customStartDate);
          const endDate = new Date(moodFilter.customEndDate);
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.entryDate);
            return entryDate >= startDate && entryDate <= endDate;
          });
        }
        return filtered;
      default:
        return filtered;
    }

    if (startDate) {
      filtered = filtered.filter(entry => new Date(entry.entryDate) >= startDate);
    }
  }

  return filtered;
};

// Add this reset filter function
const resetMoodFilter = () => {
  setMoodFilter({
    moodLevel: 'all',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: ''
  });
};

  const getMoodBadgeClass = (mood) => {
    switch (mood?.toUpperCase()) {
      case 'MILD':
        return 'student-mood-badge student-mood-mild';
      case 'MODERATE':
        return 'student-mood-badge student-mood-moderate';
      case 'HIGH':
        return 'student-mood-badge student-mood-high';
      default:
        return 'student-mood-badge student-mood-neutral';
    }
  };

  const getStatusIcon = (submitted) => {
    return submitted ? (
      <CheckCircle className="student-form-status-icon student-form-status-success" />
    ) : (
      <XCircle className="student-form-status-icon student-form-status-error" />
    );
  };

  const handleViewForm = (formType) => {
    setViewingForm(formType);
  };

  const handleBackFromForm = () => {
    setViewingForm(null);
  };

  // If viewing a form, render the appropriate form viewer
  if (viewingForm) {
    const formData = forms[viewingForm]?.data;
    switch (viewingForm) {
      case 'consentForm':
        return <ConsentFormView data={formData} onBack={handleBackFromForm} />;
      case 'inventoryForm':
        return <InventoryFormView data={formData} onBack={handleBackFromForm} />;
      case 'careerForm':
        return <CareerFormView data={formData} onBack={handleBackFromForm} />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="student-details-container">
        <div className="student-loading-container">
          <div className="student-loading-spinner"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-details-container">
        <div className="student-loading-container">
          <AlertCircle size={48} className="student-empty-icon" />
          <h3 className="student-empty-title">Student Not Found</h3>
          <p className="student-empty-description">Unable to load student details.</p>
          <button onClick={onBack} className="student-primary-button" style={{ marginTop: '16px' }}>
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-details-container">
      {/* Header */}
      <div className="student-details-header">
        <div className="student-header-content">
          <div className="student-header-left">
        <button 
          onClick={onBack}
          className="student-back-button"
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>
            <div className="student-header-divider"></div>
            <div className="student-title-section">
              <div className="student-header-avatar">
              {!imageError ? (
                <img
                  src={`${API_BASE}/student/${studentId}/photo`}
                  alt={student.fullName || student.name}
                  onError={() => setImageError(true)}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="student-header-avatar-fallback">
                  {(student.fullName || student.name || 'S').charAt(0)}
                </div>
              )}
            </div>
            <div>
            </div>
              <h1 className="student-details-title">{student.fullName || student.name}</h1>
              <p className="student-details-subtitle">
                {student.studentNumber || student.studentno} • {student.program}
              </p>
            </div>
          </div>
          <div className="student-header-right">
            <span className="student-status-badge">Active</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="student-tab-navigation">
        <div className="student-tab-container">
        {/* Overview */}
        <button 
          onClick={() => setActiveTab('overview')}
          className={`student-tab-button ${activeTab === 'overview' ? 'student-tab-active' : ''}`}
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <User size={16} />
          Overview
        </button>
        {/* Forms */}
        <button 
          onClick={() => setActiveTab('forms')}
          className={`student-tab-button ${activeTab === 'forms' ? 'student-tab-active' : ''}`}
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <FileText size={16} />
          Forms
        </button>
        {/* Mood Tracking */}
        <button 
          onClick={() => setActiveTab('mood')}
          className={`student-tab-button ${activeTab === 'mood' ? 'student-tab-active' : ''}`}
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <Heart size={16} />
          Mood Tracking
        </button>
        </div>
      </div>

      {/* Content */}
      <div className="student-details-content">
        {activeTab === 'overview' && (
          <div className="student-overview-layout">
            {/* Basic Info */}
            <div className="student-basic-info-section">
              <div className="student-card">
                <h2 className="student-card-title">Basic Information</h2>
                <div className="student-info-grid">
                  <div className="student-info-column">
                    <div className="student-info-item">
                      <User className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Full Name</p>
                        <p className="student-info-value">{student.fullName || student.name}</p>
                      </div>
                    </div>
                    <div className="student-info-item">
                      <GraduationCap className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Program & Year</p>
                        <p className="student-info-value">{student.program}</p>
                        <p className="student-info-subvalue">{student.gradeYear}</p>
                      </div>
                    </div>
                    <div className="student-info-item">
                      <ALargeSmall className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Username</p>
                        <p className="student-info-value">{student.username}</p>
                      </div>
                    </div>
                    <div className="student-info-item">
                      <Mail className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Email Address</p>
                        <p className="student-info-value">{student.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="student-info-column">
                    <div className="student-info-item">
                      <Calendar className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Date Registered</p>
                        <p className="student-info-value">
                          {new Date(student.dateRegistered).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="student-info-item">
                      <Clock className="student-info-icon" size={20} />
                      <div className="student-info-content">
                        <p className="student-info-label">Last Login</p>
                        <p className="student-info-value">
                          {student.lastLogin
                            ? new Date(student.lastLogin).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Mood Status */}
            <div className="student-mood-status-section">
              <div className="student-card">
                <div className="student-mood-status-header">
                  <h2 className="student-card-title">Recent Mood Status</h2>
                  <Heart className="student-mood-status-icon" size={20} />
                </div>
                {moodHistory.length > 0 ? (
                  <div className="student-recent-mood-content">
                    <div className="student-recent-mood-item">
                      <span className="student-recent-mood-label">Latest</span>
                      <span className={getMoodBadgeClass(moodHistory[0].moodLevel)}>
                        {moodHistory[0].moodLevel}
                      </span>
                    </div>
                    <div className="student-recent-mood-date">
                      {new Date(moodHistory[0].entryDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="student-recent-mood-content">
                    <p className="student-empty-description">No mood entries yet</p>
                  </div>
                )}
                <button 
                    onClick={() => setActiveTab('mood')}
                    className="student-view-full-history-button"
                    type="button"
                    style={{
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                    }}
                >
                View Full History
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="student-forms-grid">
            {/* Consent Form */}
            <div className="student-card student-form-card">
              <div className="student-form-card-header">
                <div className="student-form-card-info">
                  <Users className="student-form-icon student-form-icon-consent" size={24} />
                  <div className="student-form-card-text">
                    <h3 className="student-form-card-title">Client Consent Form</h3>
                    <p className="student-form-card-description">Parental consent and agreement</p>
                  </div>
                </div>
                {getStatusIcon(forms.consentForm?.submitted)}
              </div>

              {forms.consentForm?.submitted ? (
                <div className="student-form-card-content">
                  <div className="student-form-submission-date">
                    Submitted: {new Date(forms.consentForm.date).toLocaleDateString()}
                  </div>
                    <button 
                      onClick={() => setViewingForm('consentForm')}
                      className="student-form-view-button student-form-view-button-consent"
                      type="button"
                      style={{
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                      }}
                    >
                      View Form
                    </button>
                </div>
              ) : (
                <div className="student-form-not-submitted">Not submitted</div>
              )}
            </div>

            {/* Inventory Form */}
            <div className="student-card student-form-card">
              <div className="student-form-card-header">
                <div className="student-form-card-info">
                  <FileText className="student-form-icon student-form-icon-inventory" size={24} />
                  <div className="student-form-card-text">
                    <h3 className="student-form-card-title">Individual Inventory Form</h3>
                    <p className="student-form-card-description">Personal background information</p>
                  </div>
                </div>
                {getStatusIcon(forms.inventoryForm?.submitted)}
              </div>

              {forms.inventoryForm?.submitted ? (
                <div className="student-form-card-content">
                  <div className="student-form-submission-date">
                    Submitted: {new Date(forms.inventoryForm.date).toLocaleDateString()}
                  </div>
                    <button 
                      onClick={() => setViewingForm('inventoryForm')}
                      className="student-form-view-button student-form-view-button-inventory"
                      type="button"
                      style={{
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                      }}
                    >
                      View Form
                    </button>
                </div>
              ) : (
                <div className="student-form-not-submitted">Not submitted</div>
              )}
            </div>

            {/* Career Planning Form */}
            <div className="student-card student-form-card">
              <div className="student-form-card-header">
                <div className="student-form-card-info">
                  <TrendingUp className="student-form-icon student-form-icon-career" size={24} />
                  <div className="student-form-card-text">
                    <h3 className="student-form-card-title">Career Planning Form</h3>
                    <p className="student-form-card-description">Career goals and planning</p>
                  </div>
                </div>
                {getStatusIcon(forms.careerForm?.submitted)}
              </div>

              {forms.careerForm?.submitted ? (
                <div className="student-form-card-content">
                  <div className="student-form-submission-date">
                    Submitted: {new Date(forms.careerForm.date).toLocaleDateString()}
                  </div>
                    <button 
                      onClick={() => setViewingForm('careerForm')}
                      className="student-form-view-button student-form-view-button-career"
                      type="button"
                      style={{
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                      }}
                    >
                      View Form
                    </button>
                </div>
              ) : (
                <div className="student-form-not-submitted">Not submitted</div>
              )}
            </div>
          </div>
        )}

  {activeTab === 'mood' && (
  <div className="student-card student-mood-history-card">
    <div className="student-mood-history-header">
      <div className="student-mood-history-title-section">
        <Heart className="student-mood-history-icon" size={24} />
        <div>
          <h2 className="student-card-title">Mood Tracking History</h2>
          <p className="student-mood-history-subtitle">Track student's emotional well-being over time</p>
        </div>
      </div>
      
      {/* Filter Button */}
      <div className="student-mood-filter-controls">
        <button 
          onClick={() => setShowMoodFilter(!showMoodFilter)}
          className="student-mood-filter-button"
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <Filter size={16} />
          Filter
          {(moodFilter.moodLevel !== 'all' || moodFilter.dateRange !== 'all') && (
            <span className="student-filter-active-badge"></span>
          )}
        </button>
      </div>
    </div>

    {/* Filter Panel */}
    {showMoodFilter && (
      <div className="student-mood-filter-panel">
        <div className="student-mood-filter-content">
          <div className="student-mood-filter-row">
            <div className="student-mood-filter-group">
              <label className="student-mood-filter-label">Mood Level</label>
              <select
                  value={moodFilter.moodLevel}
                  onChange={(e) => setMoodFilter(prev => ({ ...prev, moodLevel: e.target.value }))}
                  className="student-mood-filter-select"
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                <option value="all">All Levels</option>
                <option value="MILD">Mild</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="student-mood-filter-group">
              <label className="student-mood-filter-label">Date Range</label>
              <select
                value={moodFilter.dateRange}
                onChange={(e) => setMoodFilter(prev => ({ 
                  ...prev, 
                  dateRange: e.target.value,
                  customStartDate: e.target.value !== 'custom' ? '' : prev.customStartDate,
                  customEndDate: e.target.value !== 'custom' ? '' : prev.customEndDate
                }))}
                className="student-mood-filter-select"
                style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {moodFilter.dateRange === 'custom' && (
            <div className="student-mood-filter-row">
              <div className="student-mood-filter-group">
                <label className="student-mood-filter-label">Start Date</label>
                <input
                  type="date"
                  value={moodFilter.customStartDate}
                  onChange={(e) => setMoodFilter(prev => ({ ...prev, customStartDate: e.target.value }))}
                  className="student-mood-filter-input"
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div className="student-mood-filter-group">
                <label className="student-mood-filter-label">End Date</label>
                <input
                  type="date"
                  value={moodFilter.customEndDate}
                  onChange={(e) => setMoodFilter(prev => ({ ...prev, customEndDate: e.target.value }))}
                  className="student-mood-filter-input"
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="student-mood-filter-actions">
            <button
              onClick={resetMoodFilter}
              className="student-mood-filter-reset-button"
              type="button"
              style={{
                position: 'relative',
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
            <span className="student-mood-filter-results-count">
              {filterMoodHistory(moodHistory).length} of {moodHistory.length} entries
            </span>
          </div>
        </div>
      </div>
    )}

  <div className="student-mood-history-content">
      {(() => {
        const filteredMoodHistory = filterMoodHistory(moodHistory);
        
        if (moodHistory.length === 0) {
          return (
            <div className="student-empty-state">
              <AlertCircle className="student-empty-icon" size={48} />
              <h3 className="student-empty-title">No mood entries</h3>
              <p className="student-empty-description">This student hasn't submitted any mood entries yet.</p>
            </div>
          );
        }

        if (filteredMoodHistory.length === 0) {
          return (
            <div className="student-empty-state">
              <AlertCircle className="student-empty-icon" size={48} />
              <h3 className="student-empty-title">No entries match your filters</h3>
              <p className="student-empty-description">Try adjusting your filter criteria to see more results.</p>
            </div>
          );
        }

        return (
          <div className="student-mood-history-list">
            {filteredMoodHistory.map((entry, index) => (
              <div key={index} className="student-mood-entry">
                <div className="student-mood-entry-badge">
                  <span className={getMoodBadgeClass(entry.moodLevel)}>{entry.moodLevel}</span>
                </div>
                <div className="student-mood-entry-content">
                  <div className="student-mood-entry-date">
                    {new Date(entry.entryDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {entry.notes && (
                    <div className="student-mood-entry-notes">{entry.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default StudentDetailsView;