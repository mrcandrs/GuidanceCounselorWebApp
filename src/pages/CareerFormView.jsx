import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar, CheckCircle, Target, Star, BookOpen, Briefcase } from 'lucide-react';
import axios from 'axios';
import '../styles/FormViews.css';

const CareerFormView = ({ data, onBack }) => {
  const [activeSection, setActiveSection] = useState('personal');

  if (!data) {
    return (
      <div className="form-view-container">
        <div className="loading-container">
          <TrendingUp size={48} className="empty-icon" />
          <h3 className="empty-title">No Career Planning Form Data</h3>
          <p className="empty-description">Unable to load career planning form details.</p>
          <button onClick={onBack} className="primary-button" style={{ marginTop: '16px' }}>
            Back to Student Details
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'assessment', label: 'Self Assessment', icon: Star },
    { id: 'career', label: 'Career Choices', icon: Target },
    { id: 'plans', label: 'Future Plans', icon: Briefcase }
  ];

//Handling downloadable PDF (use server-filled STI template)
const handleDownloadPDF = async () => {
  try {
    const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';
    const token = localStorage.getItem('authToken');
    const studentId = data?.studentId || data?.student?.studentId;
    if (!studentId) return;
    const res = await axios.get(`${API_BASE}/api/careerplanning/${studentId}/pdf`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerPlanningForm_${studentId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download career planning PDF', e);
  }
};

  const renderPersonalInfo = () => (
    <div className="form-section">
      <h3 className="form-section-title">Personal Information</h3>
      <div className="form-info-grid">
        <div className="form-info-item">
          <span className="form-label">Student Number:</span>
          <span className="form-value">{data.studentNo || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Full Name:</span>
          <span className="form-value">{data.fullName || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Program:</span>
          <span className="form-value">{data.program || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Grade/Year:</span>
          <span className="form-value">{data.gradeYear || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Section:</span>
          <span className="form-value">{data.section || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Gender:</span>
          <span className="form-value">{data.gender || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Contact Number:</span>
          <span className="form-value">{data.contactNumber || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Birthday:</span>
          <span className="form-value">{data.birthday || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Submitted At:</span>
          <span className="form-value">
            {data.submittedAt ? new Date(data.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSelfAssessment = () => (
    <div className="form-sections-grid">
      <div className="form-section">
        <h3 className="form-section-title">Top Values</h3>
        <div className="assessment-list">
          <div className="assessment-item">
            <span className="assessment-number">1.</span>
            <span className="assessment-value">{data.topValue1 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">2.</span>
            <span className="assessment-value">{data.topValue2 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">3.</span>
            <span className="assessment-value">{data.topValue3 || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Top Strengths</h3>
        <div className="assessment-list">
          <div className="assessment-item">
            <span className="assessment-number">1.</span>
            <span className="assessment-value">{data.topStrength1 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">2.</span>
            <span className="assessment-value">{data.topStrength2 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">3.</span>
            <span className="assessment-value">{data.topStrength3 || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Top Skills</h3>
        <div className="assessment-list">
          <div className="assessment-item">
            <span className="assessment-number">1.</span>
            <span className="assessment-value">{data.topSkill1 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">2.</span>
            <span className="assessment-value">{data.topSkill2 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">3.</span>
            <span className="assessment-value">{data.topSkill3 || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Top Interests</h3>
        <div className="assessment-list">
          <div className="assessment-item">
            <span className="assessment-number">1.</span>
            <span className="assessment-value">{data.topInterest1 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">2.</span>
            <span className="assessment-value">{data.topInterest2 || 'N/A'}</span>
          </div>
          <div className="assessment-item">
            <span className="assessment-number">3.</span>
            <span className="assessment-value">{data.topInterest3 || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCareerChoices = () => (
    <div className="form-section">
      <h3 className="form-section-title">Career Choices & Program Information</h3>
      <div className="form-info-grid">
        <div className="form-info-item full-width">
          <span className="form-label">Program Choice:</span>
          <span className="form-value">{data.programChoice || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Program Choice Reason:</span>
          <span className="form-value">{data.programChoiceReason || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">First Choice:</span>
          <span className="form-value">{data.firstChoice || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Original Choice:</span>
          <span className="form-value">{data.originalChoice || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Nature of Job 1:</span>
          <span className="form-value">{data.natureJob1 || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Nature of Job 2:</span>
          <span className="form-value">{data.natureJob2 || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Program Expectation:</span>
          <span className="form-value">{data.programExpectation || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Enrollment Reason:</span>
          <span className="form-value">{data.enrollmentReason || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Future Vision:</span>
          <span className="form-value">{data.futureVision || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  const renderFuturePlans = () => (
    <div className="form-sections-grid">
      <div className="form-section">
        <h3 className="form-section-title">Main Plan After Graduation</h3>
        <div className="form-info-grid">
          <div className="form-info-item full-width">
            <span className="form-label">Main Plan:</span>
            <span className="form-value">{data.mainPlan || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Education Plans</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Another Course:</span>
            <span className={`form-value ${data.anotherCourse ? 'status-yes' : 'status-no'}`}>
              {data.anotherCourse ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Masters Program:</span>
            <span className={`form-value ${data.mastersProgram ? 'status-yes' : 'status-no'}`}>
              {data.mastersProgram ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Course Field:</span>
            <span className="form-value">{data.courseField || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Employment Plans</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Local Employment:</span>
            <span className={`form-value ${data.localEmployment ? 'status-yes' : 'status-no'}`}>
              {data.localEmployment ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Work Abroad:</span>
            <span className={`form-value ${data.workAbroad ? 'status-yes' : 'status-no'}`}>
              {data.workAbroad ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Employment Nature:</span>
            <span className="form-value">{data.employmentNature || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Aim for Promotion:</span>
            <span className={`form-value ${data.aimPromotion ? 'status-yes' : 'status-no'}`}>
              {data.aimPromotion ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Current Work Abroad:</span>
            <span className={`form-value ${data.currentWorkAbroad ? 'status-yes' : 'status-no'}`}>
              {data.currentWorkAbroad ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Current Work Nature:</span>
            <span className="form-value">{data.currentWorkNature || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Business Plans</h3>
        <div className="form-info-grid">
          <div className="form-info-item full-width">
            <span className="form-label">Business Nature:</span>
            <span className="form-value">{data.businessNature || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalInfo();
      case 'assessment': return renderSelfAssessment();
      case 'career': return renderCareerChoices();
      case 'plans': return renderFuturePlans();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="form-view-container">
      {/* Header */}
      <div className="form-view-header">
        <div className="header-content">
          <div className="header-left">
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
                Back to Student Details
              </button>
            <div className="header-divider"></div>
            <div className="form-title-section">
              <div className="form-title-with-icon">
                <TrendingUp className="form-header-icon" size={24} />
                <div>
                  <h1 className="form-view-title">Career Planning Form</h1>
                  <p className="form-view-subtitle">Career goals and future planning</p>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="form-status-indicator">
              <CheckCircle className="status-icon-success" size={16} />
              <span className="status-text">Submitted</span>
            </div>
              <button 
                onClick={handleDownloadPDF}
                className="download-pdf-button"
                type="button"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                Download PDF
              </button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="form-section-nav">
        <div className="section-nav-container">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
		            key={section.id} 
                onClick={() => setActiveSection(section.id)}
                className={`section-nav-button ${activeSection === section.id ? 'section-nav-active' : ''}`}
                type="button"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="form-view-content">
        <div className="form-card">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default CareerFormView;