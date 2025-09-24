import React from 'react';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import '../styles/FormViews.css';

const Row = ({ label, value }) => (
  <div className="form-info-item">
    <span className="form-label">{label}:</span>
    <span className="form-value">{value || 'N/A'}</span>
  </div>
);

const ExitInterviewFormView = ({ data, onBack, studentNumber }) => {
    const specificReasons = data?.specificReasons ? data.specificReasons.split(',').map(s => s.trim()).filter(Boolean) : [];
    let servicesObj = null;
    try { servicesObj = data?.serviceResponsesJson ? JSON.parse(data.serviceResponsesJson) : null; } catch { servicesObj = null; }

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
                <FileText className="form-header-icon form-header-icon-exit" size={24} />
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
        <div className="form-card form-scrollable-form">
          <div className="form-section">
            <h3 className="form-section-title">Submission Details</h3>
            <div className="form-info-grid">
              <Row label="Student ID" value={data.studentId} />
              <Row label="Student Number" value={studentNumber} />
              <Row label="Submitted At" value={data.submittedAt ? new Date(data.submittedAt).toLocaleString() : ''} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Reasons and Plans</h3>
            <div className="form-info-grid">
              <Row label="Main Reason" value={data.mainReason} />
                <div className="form-info-item">
                    <span className="form-label">Specific Reasons:</span>
                    <span className="form-value">
                    {specificReasons.length ? specificReasons.join(', ') : 'N/A'}
                    </span>
                </div>
              <Row label="Other Reason" value={data.otherReason} />
              <Row label="Plans After Leaving" value={data.plansAfterLeaving} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Services and Activities</h3>
            <div className="form-info-grid">
              {servicesObj ? (
            Object.keys(servicesObj).length ? (
            <div className="form-info-item" style={{ gridColumn: '1 / -1' }}>
            <span className="form-label">Service Responses:</span>
            <ul className="form-value-list">
                {Object.entries(servicesObj).map(([k, v]) => (
              <li key={k}>{k}: {String(v)}</li>
            ))}
            </ul>
            </div>
              ) : <Row label="Service Responses" value="None" />
            ) : (
              <Row label="Service Responses" value="N/A" />
            )}
              <Row label="Other Services Detail" value={data.otherServicesDetail} />
              <Row label="Other Activities Detail" value={data.otherActivitiesDetail} />
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
            <h3 className="form-section-title">Comments/Recommendations</h3>
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