import React, { useState, useEffect, useMemo } from 'react'; // Add useMemo
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save, Search, ChevronUp, ChevronDown, X, SortAsc } from 'lucide-react'; // Add Search, ChevronUp, ChevronDown, X, SortAsc
import axios from 'axios';
import jsPDF from 'jspdf';
import Select from 'react-select';
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
  // Search, Sort, and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    gradeLevel: '',
    endorsedBy: '',
    endorsedTo: ''
  });

  // helper for selecting student
  const selectStudent = async (studentId) => {
    setFormData(prev => ({ ...prev, studentId }));
  
    if (studentId) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://guidanceofficeapi-production.up.railway.app/api/endorsement-custody/student-details/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const studentDetails = response.data;
        setFormData(prev => ({
          ...prev,
          gradeYearLevel: studentDetails.gradeYearLevel || '',
          section: studentDetails.section || ''
        }));
        console.log(`Student details fetched from ${studentDetails.source}:`, studentDetails);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    } else {
      setFormData(prev => ({ ...prev, gradeYearLevel: '', section: '' }));
    }
  };
  
  // Build options and a filter for name or student number
  const studentOptions = students.map(s => ({
    value: s.studentId,
    label: `${s.fullName} - ${s.studentNumber}`,
    meta: s
  }));
  
  const filterOption = (option, rawInput) => {
    if (!rawInput) return true;
    const q = rawInput.toLowerCase();
    const s = option.data.meta;
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      String(s.studentNumber || '').toLowerCase().includes(q)
    );
  };


  // Sort options for the dropdown
  const sortOptions = [
    { key: 'date', label: 'Date & Time', direction: 'desc' },
    { key: 'student', label: 'Student Name', direction: 'asc' },
    { key: 'gradeLevel', label: 'Grade Level', direction: 'asc' },
    { key: 'endorsedBy', label: 'Endorsed By', direction: 'asc' },
    { key: 'endorsedTo', label: 'Endorsed To', direction: 'asc' }
  ];

  // Search, Sort, and Filter Logic
  const filteredAndSortedForms = useMemo(() => {
    let filtered = forms;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(form =>
        form.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.student?.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.endorsedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.endorsedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.gradeYearLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.section?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(form => new Date(form.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(form => new Date(form.date) <= new Date(filters.dateTo));
    }

    // Apply grade level filter
    if (filters.gradeLevel) {
      filtered = filtered.filter(form => 
        form.gradeYearLevel?.toLowerCase().includes(filters.gradeLevel.toLowerCase())
      );
    }

    // Apply endorsed by filter
    if (filters.endorsedBy) {
      filtered = filtered.filter(form => 
        form.endorsedBy?.toLowerCase().includes(filters.endorsedBy.toLowerCase())
      );
    }

    // Apply endorsed to filter
    if (filters.endorsedTo) {
      filtered = filtered.filter(form => 
        form.endorsedTo?.toLowerCase().includes(filters.endorsedTo.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'student':
            aValue = a.student?.fullName || '';
            bValue = b.student?.fullName || '';
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'gradeLevel':
            aValue = a.gradeYearLevel || '';
            bValue = b.gradeYearLevel || '';
            break;
          case 'endorsedBy':
            aValue = a.endorsedBy || '';
            bValue = b.endorsedBy || '';
            break;
          case 'endorsedTo':
            aValue = a.endorsedTo || '';
            bValue = b.endorsedTo || '';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [forms, searchTerm, filters, sortConfig]);

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

  // Handle sorting
const handleSort = (key, direction = null) => {
  setSortConfig(prev => ({
    key,
    direction: direction || (prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc')
  }));
  setShowSortMenu(false);
};

// Handle filter change
const handleFilterChange = (filterKey, value) => {
  setFilters(prev => ({
    ...prev,
    [filterKey]: value
  }));
};

// Clear all filters
const clearFilters = () => {
  setFilters({
    dateFrom: '',
    dateTo: '',
    gradeLevel: '',
    endorsedBy: '',
    endorsedTo: ''
  });
  setSearchTerm('');
};

// Get current sort display text
const getCurrentSortText = () => {
  const currentSort = sortOptions.find(opt => opt.key === sortConfig.key);
  const directionText = sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A';
  if (sortConfig.key === 'date') {
    return `${currentSort?.label} (${sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'})`;
  }
  return `${currentSort?.label} (${directionText})`;
};

// Check if any filters are active
const hasActiveFilters = useMemo(() => {
  return searchTerm || 
         filters.dateFrom || 
         filters.dateTo || 
         filters.gradeLevel || 
         filters.endorsedBy || 
         filters.endorsedTo;
}, [searchTerm, filters]);

// Get unique values for filter dropdowns
const uniqueGradeLevels = useMemo(() => {
  const levels = forms.map(form => form.gradeYearLevel).filter(Boolean);
  return [...new Set(levels)].sort();
}, [forms]);

const uniqueEndorsedBy = useMemo(() => {
  const endorsers = forms.map(form => form.endorsedBy).filter(Boolean);
  return [...new Set(endorsers)].sort();
}, [forms]);

const uniqueEndorsedTo = useMemo(() => {
  const endorsees = forms.map(form => form.endorsedTo).filter(Boolean);
  return [...new Set(endorsees)].sort();
}, [forms]);

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

        <div className="endorsement-form-card endorsement-scrollable-form">
          <form onSubmit={handleSubmit} className="endorsement-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId" className="form-label">Student</label>
                <Select
                  inputId="studentId"
                  classNamePrefix="rs"
                  placeholder="Search by name or student number..."
                  isClearable
                  isSearchable
                  options={studentOptions}
                  filterOption={filterOption}
                  value={studentOptions.find(o => o.value === formData.studentId) || null}
                  onChange={(opt) => selectStudent(opt?.value || '')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date</label>
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
                <label htmlFor="time" className="form-label">Time</label>
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

        <div className="endorsement-form-card endorsement-scrollable-form">
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
          <div className="header-left">
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
          </div>

          <div className="header-right">
            {/* Search Bar */}
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search students, endorsements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="search-clear"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-container">
              <button 
                className={`sort-button ${showSortMenu ? 'sort-button-active' : ''}`}
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <SortAsc size={20} />
                Sort
                <ChevronDown size={16} className={`sort-chevron ${showSortMenu ? 'sort-chevron-up' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="sort-dropdown">
                  <div className="sort-dropdown-header">
                    <span>Sort by</span>
                    <span className="current-sort">{getCurrentSortText()}</span>
                  </div>
                  {sortOptions.map((option) => (
                    <button
                      key={`${option.key}-${option.direction}`}
                      className={`sort-option ${sortConfig.key === option.key && sortConfig.direction === option.direction ? 'sort-option-active' : ''}`}
                      onClick={() => handleSort(option.key, option.direction)}
                    >
                      <span>{option.label}</span>
                      <span className="sort-direction">
                        {option.key === 'date' 
                          ? (option.direction === 'asc' ? 'Oldest First' : 'Newest First')
                          : (option.direction === 'asc' ? 'A-Z' : 'Z-A')
                        }
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button 
              className={`filter-button ${showFilters ? 'filter-button-active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filter 
              {hasActiveFilters && <span className="filter-badge">{Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)}</span>}
            </button>
          </div>
        </div>

        {/* 👇 ADD THE FILTER PANEL AND RESULTS SUMMARY HERE 👇 */}
      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-button">
                <X size={16} />
                Clear All
              </button>
            )}
          </div>
          
          <div className="filter-grid">
  <div className="filter-group">
    <label className="filter-label">Date From</label>
    <input
      type="date"
      value={filters.dateFrom}
      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
      className="filter-input"
      style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
    />
  </div>
  
  <div className="filter-group">
    <label className="filter-label">Date To</label>
    <input
      type="date"
      value={filters.dateTo}
      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
      className="filter-input"
      style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
    />
  </div>
  
  <div className="filter-group">
    <label className="filter-label">Grade Level</label>
    <select
      value={filters.gradeLevel}
      onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
      className="filter-input"
      style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
    >
      <option value="">All Grade Levels</option>
      {uniqueGradeLevels.map(level => (
        <option key={level} value={level}>{level}</option>
      ))}
    </select>
  </div>
  
  <div className="filter-group">
    <label className="filter-label">Endorsed By</label>
    <select
      value={filters.endorsedBy}
      onChange={(e) => handleFilterChange('endorsedBy', e.target.value)}
      className="filter-input"
      style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
    >
      <option value="">All Endorsers</option>
      {uniqueEndorsedBy.map(endorser => (
        <option key={endorser} value={endorser}>{endorser}</option>
      ))}
    </select>
  </div>
  
  <div className="filter-group">
    <label className="filter-label">Endorsed To</label>
    <select
      value={filters.endorsedTo}
      onChange={(e) => handleFilterChange('endorsedTo', e.target.value)}
      className="filter-input"
      style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
    >
      <option value="">All Recipients</option>
      {uniqueEndorsedTo.map(recipient => (
        <option key={recipient} value={recipient}>{recipient}</option>
      ))}
    </select>
  </div>
</div>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredAndSortedForms.length} of {forms.length} forms
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>
      {/* 👆 ADD THE FILTER PANEL AND RESULTS SUMMARY ABOVE 👆 */}
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading forms...</p>
          </div>
        ) : filteredAndSortedForms.length === 0 ? (
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
                {filteredAndSortedForms.map((form) => (
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
                          style={{ pointerEvents: 'auto', zIndex: 50 }}
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
                          style={{ pointerEvents: 'auto', zIndex: 50 }}
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
                          style={{ pointerEvents: 'auto', zIndex: 50 }}
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