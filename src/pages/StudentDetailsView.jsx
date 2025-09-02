import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, Mail, Phone, MapPin, FileText, TrendingUp, Heart, GraduationCap, Users, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import '../styles/StudentDetails.css';
import axios from 'axios';
//import ConsentFormView from './ConsentFormView';
//import InventoryFormView from './InventoryFormView';
//import CareerFormView from './CareerFormView';

const StudentDetailsView = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [forms, setForms] = useState({
    consentForm: null,
    inventoryForm: null,
    careerForm: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingForm, setViewingForm] = useState(null);

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
        const inventoryResponse = await axios.get(`${API_BASE}/student/${studentId}/inventory-form`, { headers });
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
        const careerResponse = await axios.get(`${API_BASE}/student/${studentId}/career-form`, { headers });
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

  const getMoodBadgeClass = (mood) => {
    switch (mood?.toUpperCase()) {
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

  const getStatusIcon = (submitted) => {
    return submitted ? 
      <CheckCircle className="form-status-icon form-status-success" /> : 
      <XCircle className="form-status-icon form-status-error" />;
  };

  const handleViewForm = (formType) => {
    setViewingForm(formType);
  };

  const handleBackFromForm = () => {
    setViewingForm(null);
  };

  // If viewing a form, render the appropriate form viewer
  /*if (viewingForm) {
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
  }*/

  if (loading) {
    return (
      <div className="student-details-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-details-container">
        <div className="loading-container">
          <AlertCircle size={48} className="empty-icon" />
          <h3 className="empty-title">Student Not Found</h3>
          <p className="empty-description">Unable to load student details.</p>
          <button onClick={onBack} className="primary-button" style={{ marginTop: '16px' }}>
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
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={onBack}
              className="back-button"
              type="button"
            >
              <ArrowLeft size={16} />
              Back to Students
            </button>
            <div className="header-divider"></div>
            <div className="student-title-section">
              <h1 className="student-details-title">{student.fullName || student.name}</h1>
              <p className="student-details-subtitle">
                {student.studentNumber || student.studentno} • {student.program}
              </p>
            </div>
          </div>
          <div className="header-right">
            <span className="student-status-badge">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-button ${activeTab === 'overview' ? 'tab-active' : ''}`}
          >
            <User size={16} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`tab-button ${activeTab === 'forms' ? 'tab-active' : ''}`}
          >
            <FileText size={16} />
            Forms
          </button>
          <button
            onClick={() => setActiveTab('mood')}
            className={`tab-button ${activeTab === 'mood' ? 'tab-active' : ''}`}
          >
            <Heart size={16} />
            Mood Tracking
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="student-details-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            {/* Basic Information */}
            <div className="basic-info-section">
              <div className="card">
                <h2 className="card-title">Basic Information</h2>
                <div className="info-grid">
                  <div className="info-column">
                    <div className="info-item">
                      <User className="info-icon" size={20} />
                      <div className="info-content">
                        <p className="info-label">Full Name</p>
                        <p className="info-value">{student.fullName || student.name}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <GraduationCap className="info-icon" size={20} />
                      <div className="info-content">
                        <p className="info-label">Program & Year</p>
                        <p className="info-value">{student.program}</p>
                        <p className="info-subvalue">{student.gradeYear}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Mail className="info-icon" size={20} />
                      <div className="info-content">
                        <p className="info-label">Email Address</p>
                        <p className="info-value">{student.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="info-column">
                    <div className="info-item">
                      <Calendar className="info-icon" size={20} />
                      <div className="info-content">
                        <p className="info-label">Date Registered</p>
                        <p className="info-value">
                          {new Date(student.dateRegistered).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="info-item">
                      <Clock className="info-icon" size={20} />
                      <div className="info-content">
                        <p className="info-label">Last Login</p>
                        <p className="info-value">
                          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Mood Status */}
            <div className="mood-status-section">
              <div className="card">
                <div className="mood-status-header">
                  <h2 className="card-title">Recent Mood Status</h2>
                  <Heart className="mood-status-icon" size={20} />
                </div>
                {moodHistory.length > 0 ? (
                  <div className="recent-mood-content">
                    <div className="recent-mood-item">
                      <span className="recent-mood-label">Latest</span>
                      <span className={getMoodBadgeClass(moodHistory[0].moodLevel)}>
                        {moodHistory[0].moodLevel}
                      </span>
                    </div>
                    <div className="recent-mood-date">
                      {new Date(moodHistory[0].entryDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="recent-mood-content">
                    <p className="empty-description">No mood entries yet</p>
                  </div>
                )}
                <button 
                  onClick={() => setActiveTab('mood')}
                  className="view-full-history-button"
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="forms-grid">
            {/* Consent Form */}
            <div className="card form-card">
              <div className="form-card-header">
                <div className="form-card-info">
                  <Users className="form-icon form-icon-consent" size={24} />
                  <div className="form-card-text">
                    <h3 className="form-card-title">Client Consent Form</h3>
                    <p className="form-card-description">Parental consent and agreement</p>
                  </div>
                </div>
                {getStatusIcon(forms.consentForm?.submitted)}
              </div>
              
              {forms.consentForm?.submitted ? (
                <div className="form-card-content">
                  <div className="form-submission-date">
                    Submitted: {new Date(forms.consentForm.date).toLocaleDateString()}
                  </div>
                  <button 
                    className="form-view-button form-view-button-consent"
                    onClick={() => handleViewForm('consentForm')}
                  >
                    View Form
                  </button>
                </div>
              ) : (
                <div className="form-not-submitted">Not submitted</div>
              )}
            </div>

            {/* Inventory Form */}
            <div className="card form-card">
              <div className="form-card-header">
                <div className="form-card-info">
                  <FileText className="form-icon form-icon-inventory" size={24} />
                  <div className="form-card-text">
                    <h3 className="form-card-title">Individual Inventory</h3>
                    <p className="form-card-description">Personal background information</p>
                  </div>
                </div>
                {getStatusIcon(forms.inventoryForm?.submitted)}
              </div>
              
              {forms.inventoryForm?.submitted ? (
                <div className="form-card-content">
                  <div className="form-submission-date">
                    Submitted: {new Date(forms.inventoryForm.date).toLocaleDateString()}
                  </div>
                  <button 
                    className="form-view-button form-view-button-inventory"
                    onClick={() => handleViewForm('inventoryForm')}
                  >
                    View Form
                  </button>
                </div>
              ) : (
                <div className="form-not-submitted">Not submitted</div>
              )}
            </div>

            {/* Career Planning Form */}
            <div className="card form-card">
              <div className="form-card-header">
                <div className="form-card-info">
                  <TrendingUp className="form-icon form-icon-career" size={24} />
                  <div className="form-card-text">
                    <h3 className="form-card-title">Career Planning</h3>
                    <p className="form-card-description">Career goals and planning</p>
                  </div>
                </div>
                {getStatusIcon(forms.careerForm?.submitted)}
              </div>
              
              {forms.careerForm?.submitted ? (
                <div className="form-card-content">
                  <div className="form-submission-date">
                    Submitted: {new Date(forms.careerForm.date).toLocaleDateString()}
                  </div>
                  <button 
                    className="form-view-button form-view-button-career"
                    onClick={() => handleViewForm('careerForm')}
                  >
                    View Form
                  </button>
                </div>
              ) : (
                <div className="form-not-submitted">Not submitted</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mood' && (
          <div className="card mood-history-card">
            <div className="mood-history-header">
              <div className="mood-history-title-section">
                <Heart className="mood-history-icon" size={24} />
                <div>
                  <h2 className="card-title">Mood Tracking History</h2>
                  <p className="mood-history-subtitle">Track student's emotional well-being over time</p>
                </div>
              </div>
            </div>
            
            <div className="mood-history-content">
              {moodHistory.length > 0 ? (
                <div className="mood-history-list">
                  {moodHistory.map((entry, index) => (
                    <div key={index} className="mood-entry">
                      <div className="mood-entry-badge">
                        <span className={getMoodBadgeClass(entry.moodLevel)}>
                          {entry.moodLevel}
                        </span>
                      </div>
                      <div className="mood-entry-content">
                        <div className="mood-entry-date">
                          {new Date(entry.entryDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <AlertCircle className="empty-icon" size={48} />
                  <h3 className="empty-title">No mood entries</h3>
                  <p className="empty-description">This student hasn't submitted any mood entries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailsView;