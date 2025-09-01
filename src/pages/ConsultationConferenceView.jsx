import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import '../styles/ConsultationConferenceView.css';

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

const ConsultationConferenceView = () => {
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
    remarks: '',
    counselorname: '',
    parentguardian: '',
    schoolpersonnel: '',
    parentcontactnumber: ''
  });

  //Fetching all forms
  const fetchForms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/consultation-conference',
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
        'https://guidanceofficeapi-production.up.railway.app/api/consultation-conference/current-counselor',
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
          `https://guidanceofficeapi-production.up.railway.app/api/consultation-conference/student-details/${value}`,
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
        ? `https://guidanceofficeapi-production.up.railway.app/api/consultation-conference/${editingForm.consultationId}`
        : 'https://guidanceofficeapi-production.up.railway.app/api/consultation-conference';
      
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
        alert('Consultation/Conference form updated successfully!');
      } else {
        alert('Consultation/Conference form created successfully!');
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
        remarks: '',
        counselorname: counselorDetails ? `${counselorDetails.name} (${counselorDetails.email})` : '',
        parentguardian: '',
        schoolpersonnel: '',
        parentcontactnumber: ''
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
      remarks: form.remarks,
      counselorname: form.counselorname,
      parentguardian: form.parentguardian,
      schoolpersonnel: form.schoolpersonnel,
      parentcontactnumber: form.parentcontactnumber
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (consultationId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `https://guidanceofficeapi-production.up.railway.app/api/consultation-conference/${consultationId}`,
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
      remarks: '',
      counselorname: counselorDetails ? `${counselorDetails.name} (${counselorDetails.email})` : '',
      parentguardian: '',
      schoolpersonnel: '',
      parentcontactnumber: ''
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
            {editingForm ? 'Edit' : 'Create'} Consultation/Conference Form
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
              <label htmlFor="remarks" className="form-label">Remarks:</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Enter remarks here..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="counselorname" className="form-label">Name of Guidance Counselor:</label>
                <input
                  type="text"
                  id="counselorname"
                  name="counselorname"
                  value={formData.counselorname}
                  onChange={handleInputChange}
                  className="form-input form-input--readonly"
                  placeholder="Name of guidance counselor"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentguardian" className="form-label">Name of Parents/Guardians:</label>
                <input
                  type="text"
                  id="parentguardian"
                  name="parentguardian"
                  value={formData.parentguardian}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Name of parent/guardian"
                />
              </div>
            </div>

            <div className="form-group">
                <label htmlFor="schoolpersonnel" className="form-label">Name of School Personnel with Designation:</label>
                <input
                  type="text"
                  id="schoolpersonnel"
                  name="schoolpersonnel"
                  value={formData.schoolpersonnel}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Name of School Personnel with Designation"
                />
              </div>

            <div className="form-group">
                <label htmlFor="parentcontactnumber" className="form-label">Contact Number of Parents/Guardians:</label>
                <input
                  type="text"
                  id="parentcontactnumber"
                  name="parentcontactnumber"
                  value={formData.parentcontactnumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Parent/Guardian Contact Number"
                />
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
            View Consultation/Conference Form
          </h2>
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
              <label className="form-label">Remarks:</label>
              <div className="view-field view-textarea">
                {viewingForm.remarks || '-'}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name of Guidance Counselor:</label>
                <div className="view-field">
                  {viewingForm.counselorname || '-'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name of Parents/Guardians:</label>
                <div className="view-field">
                  {viewingForm.parentguardian || '-'}
                </div>
              </div>
            </div>

            <div className="form-group">
                <label className="form-label">Name of School Personnel with Designation:</label>
                <div className="view-field">
                  {viewingForm.schoolpersonnel || '-'}
                </div>
              </div>

            <div className="form-group">
                <label className="form-label">Contact Number of Parents/Guardians:</label>
                <div className="view-field">
                  {viewingForm.schoolpersonnel || '-'}
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
      <h2 className="page-title">Consultation/Conference Forms</h2>
      
      <div className="endorsement-card">
        <p className="page-description">Create and manage consultation and conference forms.</p>
        
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
            <p>No consultation/conference forms found. Click "Create New" to get started.</p>
          </div>
        ) : (
          <div className="forms-table-container">
            <table className="forms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Grade/Section</th>
                  <th>Counselor Name</th>
                  <th>Parent/Guardian Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.consultationId}>
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
                    <td>{form.counselorname || '-'}</td>
                    <td>{form.parentguardian || '-'}</td>
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
                            handleDelete(form.consultationId);
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

export default ConsultationConferenceView;