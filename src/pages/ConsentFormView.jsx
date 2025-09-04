import React from 'react';
import { ArrowLeft, Users, Calendar, CheckCircle, FileText, Save } from 'lucide-react';
import jsPDF from "jspdf";
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

//Handling downloadable PDF
// Fixed PDF download handler with better error handling and CORS support
const handleDownloadPDF = async () => {
  try {
    // Show loading state (optional)
    // setIsLoading(true);
    
    const response = await fetch(`/api/consentform/${data.consentId}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      // Handle different HTTP error codes
      let errorMessage = 'Failed to download PDF';
      
      if (response.status === 404) {
        const errorText = await response.text();
        errorMessage = errorText || 'Consent form or template not found';
      } else if (response.status === 500) {
        const errorText = await response.text();
        errorMessage = 'Server error occurred while generating PDF';
      } else {
        errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Check if response is actually a PDF
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Server did not return a valid PDF file');
    }

    const blob = await response.blob();
    
    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error('Received empty PDF file');
    }

    // Create download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from Content-Disposition header if available, otherwise use fallback
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `ConsentForm_${data.consentId}.pdf`; // fallback
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    a.download = filename;
    
    // Ensure the link is added to DOM for some browsers
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log('PDF downloaded successfully');
    
  } catch (error) {
    console.error('PDF download error:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Unable to download the PDF. Please try again.';
    alert(errorMessage);
    
    // Optional: Show toast notification instead of alert
    // showErrorToast(errorMessage);
    
  } finally {
    // Hide loading state (optional)
    // setIsLoading(false);
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
                <Save size={16} />
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