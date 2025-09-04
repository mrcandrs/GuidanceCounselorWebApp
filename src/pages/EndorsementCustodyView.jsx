import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import '../styles/EndorsementCustodyView.css';

// Add this PDF handler function to your EndorsementCustodyView component
const handleDownloadPDF = (formData) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add text with automatic page breaks
  const addText = (text, x, y, fontSize = 10) => {
    doc.setFontSize(fontSize);
    if (y > 280) { // If near bottom of page
      doc.addPage();
      y = 20;
    }
    doc.text(text, x, y);
    return y + (fontSize === 16 ? 12 : fontSize === 12 ? 8 : 6);
  };

  // Helper function to add wrapped text for long content
  const addWrappedText = (text, x, y, maxWidth = 170, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, x, y);
      y += fontSize === 12 ? 8 : 6;
    });
    return y;
  };

  // Helper function to add a line separator
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    return y + 8;
  };

  // Header
  yPosition = addText("ENDORSEMENT - CUSTODY FORM", 20, yPosition, 16);
  yPosition = addText("Guidance and Counseling Services", 20, yPosition, 12);
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, yPosition, 10);
  
  yPosition = addLine(yPosition + 5);

  // Student Information
  yPosition = addText("STUDENT INFORMATION", 20, yPosition, 12);
  yPosition = addText(`Student Name: ${formData.student?.fullName || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Student Number: ${formData.student?.studentNumber || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Student ID: ${formData.studentId || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Grade/Year Level: ${formData.gradeYearLevel || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Section: ${formData.section || 'N/A'}`, 25, yPosition);
  yPosition += 5;

  // Session Details
  yPosition = addText("SESSION DETAILS", 20, yPosition, 12);
  yPosition = addText(`Date: ${formatManilaDate(formData.date)}`, 25, yPosition);
  yPosition = addText(`Time: ${formData.time ? formatTime(formData.time) : formatTime(new Date(formData.date).toTimeString().substring(0, 5))}`, 25, yPosition);
  yPosition += 5;

  // Counseling Information
  yPosition = addText("COUNSELING INFORMATION", 20, yPosition, 12);
  
  yPosition = addText("Concern/s:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.concerns, 30, yPosition);
  yPosition += 3;
  
  yPosition = addText("Intervention/s:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.interventions, 30, yPosition);
  yPosition += 3;
  
  yPosition = addText("Recommendation/s:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.recommendations, 30, yPosition);
  yPosition += 3;
  
  yPosition = addText("Referral/s:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.referrals, 30, yPosition);
  yPosition += 5;

  // Endorsement Information
  yPosition = addText("ENDORSEMENT INFORMATION", 20, yPosition, 12);
  yPosition = addText(`Endorsed By: ${formData.endorsedBy || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Endorsed To: ${formData.endorsedTo || 'N/A'}`, 25, yPosition);
  yPosition += 5;

  // Form Metadata
  yPosition = addText("FORM DETAILS", 20, yPosition, 12);
  yPosition = addText(`Form ID: ${formData.custodyId || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Created: ${formData.createdAt ? formatManilaDateTime(formData.createdAt) : formatManilaDate(formData.date)}`, 25, yPosition);
  if (formData.updatedAt) {
    yPosition = addText(`Last Updated: ${formatManilaDateTime(formData.updatedAt)}`, 25, yPosition);
  }
  yPosition += 15;

  // Signature section
  yPosition = addLine(yPosition);
  yPosition = addText("SIGNATURES", 20, yPosition, 12);
  yPosition += 10;
  
  // Counselor signature
  yPosition = addText("_________________________________", 25, yPosition);
  yPosition = addText(`Guidance Counselor: ${formData.endorsedBy || 'N/A'}`, 25, yPosition, 9);
  yPosition = addText(`Date: ${formatManilaDate(formData.date)}`, 25, yPosition + 10, 9);
  
  yPosition += 25;
  
  // Parent/Guardian signature
  yPosition = addText("_________________________________", 25, yPosition);
  yPosition = addText(`Parent/Guardian: ${formData.endorsedTo || 'N/A'}`, 25, yPosition, 9);
  yPosition = addText("Date: _______________", 25, yPosition + 10, 9);

  // Footer
  if (yPosition < 250) {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("This document was generated electronically by the Student Information System.", 20, 280);
    doc.text(`Page 1 of 1 | Generated: ${new Date().toISOString()}`, 20, 287);
  }

  // Save the PDF
  const studentName = formData.student?.fullName || 'Student';
  const formattedDate = new Date(formData.date).toISOString().split('T')[0];
  const fileName = `EndorsementCustodyForm_${studentName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
  doc.save(fileName);
};

// Utility function to format dates in Manila timezone
const formatManilaDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatManilaDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility function to get current date in Manila timezone for input fields
const getCurrentManilaDate = () => {
  const now = new Date();
  const manilaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  const year = manilaTime.getFullYear();
  const month = String(manilaTime.getMonth() + 1).padStart(2, '0');
  const day = String(manilaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Utility function to get current time in Manila timezone for input fields
const getCurrentManilaTime = () => {
  const now = new Date();
  const manilaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  const hours = String(manilaTime.getHours()).padStart(2, '0');
  const minutes = String(manilaTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Utility function to format time for display
const formatTime = (timeString) => {
  if (!timeString) return '-';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const EndorsementCustodyView = () => {
  const [forms, setForms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  const [showView, setShowView] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    date: getCurrentManilaDate(),
    time: getCurrentManilaTime(),
    gradeYearLevel: '',
    section: '',
    concerns: '',
    interventions: '',
    recommendations: '',
    referrals: '',
    endorsedBy: '',
    endorsedTo: ''
  });

  // Fetch all forms
  const fetchForms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for dropdown
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/student',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch current counselor details
  const fetchCurrentCounselor = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody/current-counselor',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching counselor details:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchForms();
    fetchStudents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle student selection change and fetch student details
  const handleStudentChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If a student is selected, fetch their details from Career Planning Form
    if (value) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody/student-details/${value}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const studentDetails = response.data;
        
        // Auto-populate Grade/Year Level and Section
        setFormData(prev => ({
          ...prev,
          gradeYearLevel: studentDetails.gradeYearLevel || '',
          section: studentDetails.section || ''
        }));

        console.log(`Student details fetched from ${studentDetails.source}:`, studentDetails);
      } catch (error) {
        console.error('Error fetching student details:', error);
        // Don't show error to user, just log it
      }
    } else {
      // Clear the fields if no student is selected
      setFormData(prev => ({
        ...prev,
        gradeYearLevel: '',
        section: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const url = editingForm 
        ? `https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody/${editingForm.custodyId}`
        : 'https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody';
      
      const method = editingForm ? 'put' : 'post';

      // Combine date and time for submission
      const submissionData = {
        ...formData,
        // Convert date and time to ISO string for backend
        dateTime: new Date(`${formData.date}T${formData.time}:00`).toISOString()
      };

      const response = await axios[method](url, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message
      if (editingForm) {
        alert('Endorsement custody form updated successfully!');
      } else {
        alert('Endorsement custody form created successfully!');
      }

      // Reset form and refresh data
      const counselorDetails = await fetchCurrentCounselor();
      setFormData({
        studentId: '',
        date: getCurrentManilaDate(),
        time: getCurrentManilaTime(),
        gradeYearLevel: '',
        section: '',
        concerns: '',
        interventions: '',
        recommendations: '',
        referrals: '',
        endorsedBy: counselorDetails ? `${counselorDetails.name} (${counselorDetails.email})` : '',
        endorsedTo: ''
      });
      setShowForm(false);
      setEditingForm(null);
      fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to perform this action.');
      } else if (error.response?.status === 404) {
        alert('Form not found. It may have been deleted.');
      } else {
        alert(`Error saving form: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle view
  const handleView = (form) => {
    setViewingForm(form);
    setShowView(true);
  };

  // Handle edit
  const handleEdit = (form) => {
    setEditingForm(form);
    
    // Extract date and time from the form's date field
    const formDate = new Date(form.date);
    const dateStr = formDate.toISOString().split('T')[0];
    const timeStr = formDate.toTimeString().split(' ')[0].substring(0, 5);
    
    setFormData({
      studentId: form.studentId,
      date: dateStr,
      time: timeStr,
      gradeYearLevel: form.gradeYearLevel,
      section: form.section,
      concerns: form.concerns,
      interventions: form.interventions,
      recommendations: form.recommendations,
      referrals: form.referrals,
      endorsedBy: form.endorsedBy,
      endorsedTo: form.endorsedTo
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (custodyId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody/${custodyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    }
  };

  // Handle create new
  const handleCreateNew = async () => {
    setEditingForm(null); 
        
    // Fetch counselor details and auto-populate endorsedBy field
    const counselorDetails = await fetchCurrentCounselor();
    
    setFormData({
      studentId: '',
      date: getCurrentManilaDate(),
      time: getCurrentManilaTime(),
      gradeYearLevel: '',
      section: '',
      concerns: '',
      interventions: '',
      recommendations: '',
      referrals: '',
      endorsedBy: counselorDetails ? `${counselorDetails.name} (${counselorDetails.email})` : '',
      endorsedTo: ''
    });
    setShowForm(true);
  };

  // Handle back to list
  const handleBack = () => {
    setShowForm(false);
    setEditingForm(null);
  };

  // Handle back from view
  const handleBackFromView = () => {
    setShowView(false);
    setViewingForm(null);
  };

  if (showForm) {
    return (
      <div className="endorsement-custody-container">
        <div className="form-header">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBack();
            }}
            className="back-button"
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h2 className="form-title">
            {editingForm ? 'Edit' : 'Create'} Endorsement - Custody Form
          </h2>
        </div>

        <div className="endorsement-form-card">
          <form onSubmit={handleSubmit} className="endorsement-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId" className="form-label">Student *</label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleStudentChange}
                  required
                  className="form-select"
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName} - {student.studentNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="time" className="form-label">Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gradeYearLevel" className="form-label">Grade/Year Level</label>
                <input
                  type="text"
                  id="gradeYearLevel"
                  name="gradeYearLevel"
                  value={formData.gradeYearLevel}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Grade 11, 1st Year"
                />
              </div>

              <div className="form-group">
                <label htmlFor="section" className="form-label">Section</label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., BSIT-4B"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="concerns" className="form-label">Concern/s:</label>
              <textarea
                id="concerns"
                name="concerns"
                value={formData.concerns}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Enter concern/s here..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="interventions" className="form-label">Intervention/s:</label>
              <textarea
                id="interventions"
                name="interventions"
                value={formData.interventions}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Describe intervention/s provided..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="recommendations" className="form-label">Recommendation/s:</label>
              <textarea
                id="recommendations"
                name="recommendations"
                value={formData.recommendations}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Provide recommendation/s..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="referrals" className="form-label">Referral/s:</label>
              <textarea
                id="referrals"
                name="referrals"
                value={formData.referrals}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="External referral/s if any..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endorsedBy" className="form-label">Endorsed by:</label>
                <input
                  type="text"
                  id="endorsedBy"
                  name="endorsedBy"
                  value={formData.endorsedBy}
                  onChange={handleInputChange}
                  className="form-input form-input--readonly"
                  placeholder="Name of guidance counselor"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="endorsedTo" className="form-label">Endorsed to</label>
                <input
                  type="text"
                  id="endorsedTo"
                  name="endorsedTo"
                  value={formData.endorsedTo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Name of parent/guardian"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit"
                disabled={loading}
                className="save-button"
                style={{ pointerEvents: 'auto', zIndex: 999 }}
              >
                <Save size={20} />
                {loading ? 'Saving...' : (editingForm ? 'Update Form' : 'Save Form')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // When the endorsement form is viewed
  if (showView && viewingForm) {
    return (
      <div className="endorsement-custody-container">
        <div className="form-header">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBackFromView();
            }}
            className="back-button"
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h2 className="form-title">
            View Endorsement - Custody Form
          </h2>
          <button 
          onClick={() => handleDownloadPDF(viewingForm)}
          className="download-pdf-button"
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Download PDF
        </button>
        </div>

        <div className="endorsement-form-card">
          <div className="view-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student</label>
                <div className="view-field">
                  <div className="student-info">
                    <div className="student-avatar">
                      {viewingForm.student?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="student-name">
                        {viewingForm.student?.fullName}
                      </div>
                      <div className="student-number">
                        {viewingForm.student?.studentNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <div className="view-field">
                  {formatManilaDate(viewingForm.date)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <div className="view-field">
                  {viewingForm.time ? formatTime(viewingForm.time) : formatTime(new Date(viewingForm.date).toTimeString().substring(0, 5))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade/Year Level</label>
                <div className="view-field">
                  {viewingForm.gradeYearLevel || '-'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <div className="view-field">
                  {viewingForm.section || '-'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Concern/s:</label>
              <div className="view-field view-textarea">
                {viewingForm.concerns || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Intervention/s:</label>
              <div className="view-field view-textarea">
                {viewingForm.interventions || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Recommendation/s:</label>
              <div className="view-field view-textarea">
                {viewingForm.recommendations || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Referral/s:</label>
              <div className="view-field view-textarea">
                {viewingForm.referrals || '-'}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Endorsed by:</label>
                <div className="view-field">
                  {viewingForm.endorsedBy || '-'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Endorsed to:</label>
                <div className="view-field">
                  {viewingForm.endorsedTo || '-'}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Created:</label>
                <div className="view-field">
                  {viewingForm.createdAt ? formatManilaDateTime(viewingForm.createdAt) : formatManilaDate(viewingForm.date)}
                </div>
              </div>

              {viewingForm.updatedAt && (
                <div className="form-group">
                  <label className="form-label">Last Updated:</label>
                  <div className="view-field">
                    {formatManilaDateTime(viewingForm.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="endorsement-custody-container">
      <h2 className="page-title">Endorsement and Custody Forms</h2>
      
      <div className="endorsement-card">
        <p className="page-description">Manage custody and endorsement forms for students.</p>
        
        <div className="card-header">
          <div className="header-actions">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateNew();
              }}
              className="create-button"
              style={{ pointerEvents: 'auto', zIndex: 999 }}
            >
              <Plus size={20} />
              Create New
            </button>
            <button className="filter-button">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p>No endorsement and custody forms found. Click "Create New" to get started.</p>
          </div>
        ) : (
          <div className="forms-table-container">
            <table className="forms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Grade/Section</th>
                  <th>Endorsed By</th>
                  <th>Endorsed To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.custodyId}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {form.student?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="student-name">
                            {form.student?.fullName}
                          </div>
                          <div className="student-number">
                            {form.student?.studentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{formatManilaDate(form.date)}</div>
                      <div className="time-display">
                        {form.time ? formatTime(form.time) : formatTime(new Date(form.date).toTimeString().substring(0, 5))}
                      </div>
                    </td>
                    <td>
                      {form.gradeYearLevel} {form.section && `- ${form.section}`}
                    </td>
                    <td>{form.endorsedBy || '-'}</td>
                    <td>{form.endorsedTo || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleView(form);
                          }}
                          className="action-button view-button"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(form);
                          }}
                          className="action-button edit-button"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(form.custodyId);
                          }}
                          className="action-button delete-button"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndorsementCustodyView;