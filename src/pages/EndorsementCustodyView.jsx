import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import '../styles/EndorsementCustodyView.css';

const EndorsementCustodyView = () => {
  const [forms, setForms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
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
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        gradeYearLevel: '',
        section: '',
        concerns: '',
        interventions: '',
        recommendations: '',
        referrals: '',
        endorsedBy: '',
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
  const handleCreateNew = () => {
    setEditingForm(null);
    setFormData({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      gradeYearLevel: '',
      section: '',
      concerns: '',
      interventions: '',
      recommendations: '',
      referrals: '',
      endorsedBy: '',
      endorsedTo: ''
    });
    setShowForm(true);
  };

  // Handle back to list
  const handleBack = () => {
    setShowForm(false);
    setEditingForm(null);
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
                style={{ pointerEvents: 'auto', zIndex: 999 }} // Temporary override
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
                  className="form-input"
                  placeholder="Name of guidance counselor"
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
                style={{ pointerEvents: 'auto', zIndex: 999 }} // Temporary override
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
                    <td>{new Date(form.date).toLocaleDateString()}</td>
                    <td>
                      {form.gradeYearLevel} {form.section && `- ${form.section}`}
                    </td>
                    <td>{form.endorsedBy || '-'}</td>
                    <td>{form.endorsedTo || '-'}</td>
                    <td>
                      <div className="action-buttons">
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