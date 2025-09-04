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
const handleDownloadPDF = () => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add text with consistent formatting
  const addText = (text, x, y, fontSize = 10) => {
    doc.setFontSize(fontSize);
    doc.text(text, x, y);
    return y + (fontSize === 16 ? 12 : fontSize === 12 ? 8 : 6);
  };

  // Helper function to add a line separator
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    return y + 8;
  };

  // Header
  yPosition = addText("CLIENT CONSENT FORM", 20, yPosition, 16);
  yPosition = addText("Guidance and Counseling Services", 20, yPosition, 12);
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, yPosition, 10);
  
  yPosition = addLine(yPosition + 5);

  // Basic Information Section
  yPosition = addText("BASIC INFORMATION", 20, yPosition, 12);
  yPosition = addText(`Student Name: ${data.student?.fullName || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Student ID: ${data.studentId || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Parent/Guardian Name: ${data.parentName || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Date Signed: ${data.signedDate ? new Date(data.signedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A'}`, 25, yPosition);
  
  // Consent Status with visual emphasis
  doc.setFontSize(11);
  const consentStatus = data.isAgreed ? 'AGREED' : 'NOT AGREED';
  const statusColor = data.isAgreed ? [0, 128, 0] : [255, 0, 0]; // Green for agreed, red for not agreed
  doc.setTextColor(...statusColor);
  yPosition = addText(`Consent Status: ${consentStatus}`, 25, yPosition, 11);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  yPosition += 8;

  // Counselor Information (if available)
  if (data.counselor) {
    yPosition = addText("COUNSELOR INFORMATION", 20, yPosition, 12);
    yPosition = addText(`Counselor Name: ${data.counselor.name || 'N/A'}`, 25, yPosition);
    yPosition = addText(`Counselor Email: ${data.counselor.email || 'N/A'}`, 25, yPosition);
    yPosition = addText(`Counselor ID: ${data.counselorId || 'N/A'}`, 25, yPosition);
    yPosition += 8;
  }

  // Form Metadata
  yPosition = addText("FORM DETAILS", 20, yPosition, 12);
  yPosition = addText(`Form ID: ${data.consentId || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Form Type: Client Consent Form`, 25, yPosition);
  yPosition += 15;

  // Consent Declaration (if agreed)
  if (data.isAgreed) {
    yPosition = addLine(yPosition);
    yPosition = addText("CONSENT DECLARATION", 20, yPosition, 12);
    doc.setFontSize(10);
    const declaration = `I, ${data.parentName || '[Parent/Guardian Name]'}, hereby give my consent for ${data.student?.fullName || '[Student Name]'} to participate in guidance and counseling services as needed. This consent was provided on ${data.signedDate ? new Date(data.signedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]'}.`;
    
    // Split text to fit within margins
    const lines = doc.splitTextToSize(declaration, 170);
    lines.forEach(line => {
      yPosition = addText(line, 25, yPosition, 10);
    });
    
    yPosition += 15;
    
    // Signature line
    yPosition = addText("_________________________________", 25, yPosition);
    yPosition = addText(`${data.parentName || 'Parent/Guardian Signature'}`, 25, yPosition, 9);
    yPosition = addText(`Date: ${data.signedDate ? new Date(data.signedDate).toLocaleDateString() : '__________'}`, 25, yPosition + 10, 9);
  }

  // Footer
  if (yPosition < 250) {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("This document was generated electronically by the Student Information System.", 20, 280);
    doc.text(`Page 1 of 1 | Generated: ${new Date().toISOString()}`, 20, 287);
  }

  // Save the PDF with improved filename
  const studentName = data.student?.fullName || 'Student';
  const formattedDate = new Date().toISOString().split('T')[0];
  const fileName = `ConsentForm_${studentName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
  doc.save(fileName);
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