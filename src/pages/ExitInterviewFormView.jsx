import React from 'react';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import '../styles/FormViews.css';

const Row = ({ label, value }) => (
  <div className="form-info-item">
    <span className="form-label">{label}:</span>
    <span className="form-value">{value || 'N/A'}</span>
  </div>
);

const ExitInterviewFormView = ({ data, onBack }) => {
  if (!data) {
    return (
      <div className="form-view-container">
        <div className="loading-container">
          <FileText size={48} className="empty-icon" />
          <h3 className="empty-title">No Exit Interview Data</h3>
          <p className="empty-description">Unable to load exit interview details.</p>
          <button onClick={onBack} className="primary-button" style={{ marginTop: '16px' }}>
            Back to Student Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-view-container">
      <div className="form-view-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={onBack}
              className="student-back-button"
              type="button"
              style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
              Back to Student Details
            </button>
            <div className="header-divider"></div>
            <div className="form-title-section">
              <div className="form-title-with-icon">
                <FileText className="form-header-icon" size={24} />
                <div>
                  <h1 className="form-view-title">Exit Interview Form</h1>
                  <p className="form-view-subtitle">Student’s exit responses</p>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="form-status-indicator">
              <CheckCircle className="status-icon-success" size={16} />
              <span className="status-text">Submitted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-view-content">
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Submission Details</h3>
            <div className="form-info-grid">
              <Row label="Student ID" value={data.studentId} />
              <Row label="Submitted At" value={data.submittedAt ? new Date(data.submittedAt).toLocaleString() : ''} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Reasons and Plans</h3>
            <div className="form-info-grid">
              <Row label="Main Reason" value={data.mainReason} />
              <Row label="Specific Reasons" value={data.specificReasons} />
              <Row label="Other Reason" value={data.otherReason} />
              <Row label="Plans After Leaving" value={data.plansAfterLeaving} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Learnings</h3>
            <div className="form-info-grid">
              <Row label="Values Learned" value={data.valuesLearned} />
              <Row label="Skills Learned" value={data.skillsLearned} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Services and Activities</h3>
            <div className="form-info-grid">
              <Row label="Service Responses (JSON)" value={data.serviceResponsesJson} />
              <Row label="Other Services Detail" value={data.otherServicesDetail} />
              <Row label="Other Activities Detail" value={data.otherActivitiesDetail} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Comments</h3>
            <div className="form-info-grid">
              <Row label="Comments" value={data.comments} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitInterviewFormView;