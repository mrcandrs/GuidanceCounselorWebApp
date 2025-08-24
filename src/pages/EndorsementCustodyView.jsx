import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import '../styles/EndorsementCustodyView.css';

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

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and refresh data
      const counselorDetails = await fetchCurrentCounselor();
      setFormData({
        studentId: '',
        date: getCurrentManilaDate(),
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
      alert('Error saving form. Please try again.');
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
    setFormData({
      studentId: form.studentId,
      date: new Date(form.date).toISOString().split('T')[0],
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
        </div>

        <div className="endorsement-form-card">
          <div className="view-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student</label>
                <div className="view-field">
                  <div className="student-info">
                    <div className="student-avatar">
                      {viewingForm.student?.firstName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="student-name">
                        {viewingForm.student?.firstName} {viewingForm.student?.lastName}
                      </div>
                      <div className="student-number">
                        {viewingForm.student?.studentNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <div className="view-field">
                  {formatManilaDate(viewingForm.date)}
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

            <div className="form-group">
              <label className="form-label">Created:</label>
              <div className="view-field">
                {formatManilaDate(viewingForm.date)}
              </div>
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
                  <th>Date</th>
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
                          {form.student?.firstName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="student-name">
                            {form.student?.firstName} {form.student?.lastName}
                          </div>
                          <div className="student-number">
                            {form.student?.studentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatManilaDate(form.date)}</td>
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
                          onClick={() => handleEdit(form)}
                          className="action-button edit-button"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(form.custodyId)}
                          className="action-button delete-button"
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