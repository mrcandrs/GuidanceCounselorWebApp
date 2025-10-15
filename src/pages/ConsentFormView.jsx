import React from 'react';
import { ArrowLeft, Users, Calendar, CheckCircle, FileText, Save } from 'lucide-react';
import axios from 'axios';
import '../styles/FormViews.css';

const ConsentFormView = ({ data, onBack }) => {
  if (!data) {
    return (
      <div className="form-view-container">
        <div className="loading-container">
          <FileText size={48} className="empty-icon" />
          <h3 className="empty-title">No Consent Form Data</h3>
          <p className="empty-description">Unable to load consent form details.</p>
          <button onClick={onBack} className="primary-button" style={{ marginTop: '16px' }}>
            Back to Student Details
          </button>
        </div>
      </div>
    );
  }

  //Handling downloadable PDF (use server-filled STI template)
const handleDownloadPDF = async () => {
  try {
    const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';
    const token = localStorage.getItem('authToken');
    const consentId = data?.consentId;
    if (!consentId) return;
    const res = await axios.get(`${API_BASE}/api/consentform/${consentId}/pdf`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConsentForm_${consentId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download consent PDF', e);
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
                <Users className="form-header-icon" size={24} />
                <div>
                  <h1 className="form-view-title">Client Consent Form</h1>
                  <p className="form-view-subtitle">Parental consent and agreement details</p>
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

      {/* Content */}
      <div className="form-view-content">
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-info-grid">
              <div className="form-info-item">
                <span className="form-label">Student Name:</span>
                <span className="form-value">{data.student?.fullName || 'N/A'}</span>
              </div>
              <div className="form-info-item">
                <span className="form-label">Parent/Guardian Name:</span>
                <span className="form-value">{data.parentName || 'N/A'}</span>
              </div>
              <div className="form-info-item">
                <span className="form-label">Date Signed:</span>
                <span className="form-value">
                  {data.signedDate ? new Date(data.signedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="form-info-item">
                <span className="form-label">Consent Status:</span>
                <span className={`form-value ${data.isAgreed ? 'status-agreed' : 'status-not-agreed'}`}>
                  {data.isAgreed ? 'Agreed' : 'Not Agreed'}
                </span>
              </div>
            </div>
          </div>

          {data.counselor && (
            <div className="form-section">
              <h3 className="form-section-title">Counselor Information</h3>
              <div className="form-info-grid">
                <div className="form-info-item">
                  <span className="form-label">Counselor Name:</span>
                  <span className="form-value">{data.counselor.name || 'N/A'}</span>
                </div>
                <div className="form-info-item">
                  <span className="form-label">Counselor Email:</span>
                  <span className="form-value">{data.counselor.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3 className="form-section-title">Form Metadata</h3>
            <div className="form-info-grid">
              <div className="form-info-item">
                <span className="form-label">Form ID:</span>
                <span className="form-value">{data.consentId || 'N/A'}</span>
              </div>
              <div className="form-info-item">
                <span className="form-label">Student ID:</span>
                <span className="form-value">{data.studentId || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentFormView;