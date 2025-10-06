import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save, Search, ChevronDown, X, SortAsc } from 'lucide-react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import axios from 'axios';
import Select from 'react-select';
import '../styles/ConsultationConferenceView.css';

// Updated PDF handler function for Consultation/Conference Form
const handleDownloadPDF = (formData) => {
  // Import jsPDF - make sure this is available in your project
  // You may need to add: import jsPDF from 'jspdf';
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
  yPosition = addText("CONSULTATION/CONFERENCE FORM", 20, yPosition, 16);
  yPosition = addText("Guidance and Counseling Services", 20, yPosition, 12);
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, yPosition, 10);
  
  yPosition = addLine(yPosition + 5);

  // Student Information Section
  yPosition = addText("STUDENT INFORMATION", 20, yPosition, 12);
  yPosition = addText(`Student Name: ${formData.student?.fullName || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Student Number: ${formData.student?.studentNumber || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Student ID: ${formData.studentId || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Grade/Year Level: ${formData.gradeYearLevel || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Section: ${formData.section || 'N/A'}`, 25, yPosition);
  yPosition += 5;

  // Session Details Section
  yPosition = addText("SESSION DETAILS", 20, yPosition, 12);
  yPosition = addText(`Date: ${formatManilaDate(formData.date)}`, 25, yPosition);
  yPosition = addText(`Time: ${formData.time ? formatTime(formData.time) : formatTime(new Date(formData.date).toTimeString().substring(0, 5))}`, 25, yPosition);
  yPosition += 5;

  // Consultation Information Section
  yPosition = addText("CONSULTATION/CONFERENCE DETAILS", 20, yPosition, 12);
  
  yPosition = addText("Concern/s:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.concerns, 30, yPosition);
  yPosition += 3;
  
  yPosition = addText("Remarks:", 25, yPosition, 11);
  yPosition = addWrappedText(formData.remarks, 30, yPosition);
  yPosition += 5;

  // Personnel Information Section
  yPosition = addText("PERSONNEL INFORMATION", 20, yPosition, 12);
  yPosition = addText(`Guidance Counselor: ${formData.counselorName || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Parent/Guardian: ${formData.parentGuardian || 'N/A'}`, 25, yPosition);
  yPosition = addText(`Parent/Guardian Contact: ${formData.parentContactNumber || 'N/A'}`, 25, yPosition);
  yPosition = addText(`School Personnel: ${formData.schoolPersonnel || 'N/A'}`, 25, yPosition);
  yPosition += 5;

  // Form Metadata Section
  yPosition = addText("FORM DETAILS", 20, yPosition, 12);
  yPosition = addText(`Form ID: ${formData.consultationId || 'N/A'}`, 25, yPosition);
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
  yPosition = addText(`Guidance Counselor: ${formData.counselorName || 'N/A'}`, 25, yPosition, 9);
  yPosition = addText(`Date: ${formatManilaDate(formData.date)}`, 25, yPosition + 10, 9);
  
  yPosition += 25;
  
  // Parent/Guardian signature
  yPosition = addText("_________________________________", 25, yPosition);
  yPosition = addText(`Parent/Guardian: ${formData.parentGuardian || 'N/A'}`, 25, yPosition, 9);
  yPosition = addText("Date: _______________", 25, yPosition + 10, 9);

  yPosition += 25;

  // School Personnel signature (if applicable)
  if (formData.schoolPersonnel) {
    yPosition = addText("_________________________________", 25, yPosition);
    yPosition = addText(`School Personnel: ${formData.schoolPersonnel}`, 25, yPosition, 9);
    yPosition = addText("Date: _______________", 25, yPosition + 10, 9);
  }

  // Footer
  if (yPosition < 250) {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("This document was generated electronically by the Student Information System.", 20, 280);
    doc.text(`Page 1 of 1 | Generated: ${new Date().toISOString()}`, 20, 287);
  }

  // Save the PDF with a descriptive filename
  const studentName = formData.student?.fullName || 'Student';
  const formattedDate = new Date(formData.date).toISOString().split('T')[0];
  const fileName = `ConsultationConferenceForm_${studentName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
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
  // Search, Sort, and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    gradeLevel: '',
    counselorName: '',
    parentGuardian: ''
  });

  const sortBtnRef = useRef(null);
  const [sortMenuPos, setSortMenuPos] = useState({ top: 0, left: 0, width: 250 });

  useLayoutEffect(() => {
  if (!showSortMenu || !sortBtnRef.current) return;
  const r = sortBtnRef.current.getBoundingClientRect();
  setSortMenuPos({
    top: r.bottom + 4,
    left: Math.max(8, r.right - 250),
    width: 250
    });
  }, [showSortMenu]);

  const sortOptions = [
    { key: 'date', label: 'Date & Time', direction: 'desc' },
    { key: 'student', label: 'Student Name', direction: 'asc' },
    { key: 'gradeLevel', label: 'Grade Level', direction: 'asc' },
    { key: 'counselorName', label: 'Counselor Name', direction: 'asc' },
    { key: 'parentGuardian', label: 'Parent/Guardian Name', direction: 'asc' }
  ];

  const filteredAndSortedForms = useMemo(() => {
  const term = (searchTerm || '').trim().toLowerCase();
  let result = forms.slice();

  // 1) Filters
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter(f => new Date(f.date) >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter(f => new Date(f.date) <= to);
  }
  if (filters.gradeLevel) {
    const gl = filters.gradeLevel.toLowerCase();
    result = result.filter(f => (f.gradeYearLevel || '').toLowerCase().includes(gl));
  }
  if (filters.counselorName) {
    const c = filters.counselorName.toLowerCase();
    result = result.filter(f => (f.counselorName || '').toLowerCase().includes(c));
  }
  if (filters.parentGuardian) {
    const p = filters.parentGuardian.toLowerCase();
    result = result.filter(f => (f.parentGuardian || '').toLowerCase().includes(p));
  }

  // 2) Search
  if (term) {
    result = result.filter(f => {
      const fullName = (f.student?.fullName || '').toLowerCase();
      const studNo = String(f.student?.studentNumber || '').toLowerCase();
      const level = (f.gradeYearLevel || '').toLowerCase();
      const section = (f.section || '').toLowerCase();
      const counselor = (f.counselorName || '').toLowerCase();
      const parent = (f.parentGuardian || '').toLowerCase();
      return (
        fullName.includes(term) ||
        studNo.includes(term) ||
        level.includes(term) ||
        section.includes(term) ||
        counselor.includes(term) ||
        parent.includes(term)
      );
    });
  }

  // 3) Sort
  if (sortConfig.key) {
    result.sort((a, b) => {
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
        case 'counselorName':
          aValue = a.counselorName || '';
          bValue = b.counselorName || '';
          break;
        case 'parentGuardian':
          aValue = a.parentGuardian || '';
          bValue = b.parentGuardian || '';
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
}, [forms, searchTerm, filters, sortConfig]);

  const handleSort = (key, direction = null) => {
  setSortConfig(prev => ({
    key,
    direction: direction || (prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc')
  }));
  setShowSortMenu(false);
};

const handleFilterChange = (filterKey, value) => {
  setFilters(prev => ({ ...prev, [filterKey]: value }));
};

const clearFilters = () => {
  setFilters({
    dateFrom: '',
    dateTo: '',
    gradeLevel: '',
    counselorName: '',
    parentGuardian: ''
  });
  setSearchTerm('');
};

const getCurrentSortText = () => {
  const currentSort = sortOptions.find(opt => opt.key === sortConfig.key);
  const directionText = sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A';
  if (sortConfig.key === 'date') {
    return `${currentSort?.label} (${sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'})`;
  }
  return `${currentSort?.label} (${directionText})`;
};

const hasActiveFilters = useMemo(() => {
  return Boolean(
    filters.dateFrom ||
    filters.dateTo ||
    filters.gradeLevel ||
    filters.counselorName ||
    filters.parentGuardian
  );
}, [filters]);

const uniqueGradeLevels = useMemo(() => {
  const levels = forms.map(f => f.gradeYearLevel).filter(Boolean);
  return [...new Set(levels)].sort();
}, [forms]);

const uniqueCounselorNames = useMemo(() => {
  const cs = forms.map(f => f.counselorName).filter(Boolean);
  return [...new Set(cs)].sort();
}, [forms]);

const uniqueParentGuardians = useMemo(() => {
  const ps = forms.map(f => f.parentGuardian).filter(Boolean);
  return [...new Set(ps)].sort();
}, [forms]);

  // helper for selecting student
  const selectStudent = async (studentId) => {
    setFormData(prev => ({ ...prev, studentId }));
  
    if (studentId) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://guidanceofficeapi-production.up.railway.app/api/consultation-conference/student-details/${studentId}`,
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
      counselorname: form.counselorName,    
      parentguardian: form.parentGuardian,
      schoolpersonnel: form.schoolPersonnel,
      parentcontactnumber: form.parentContactNumber
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
        
    // Fetch counselor details and auto-populate Counselor Name field
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

        <div className="endorsement-form-card consultation-scrollable-form">
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

  // When the consultation/conference form is viewed
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

        <div className="endorsement-form-card consultation-scrollable-form">
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
                  {viewingForm.counselorName || '-'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name of Parents/Guardians:</label>
                <div className="view-field">
                  {viewingForm.parentGuardian || '-'}
                </div>
              </div>
            </div>

            <div className="form-group">
                <label className="form-label">Name of School Personnel with Designation:</label>
                <div className="view-field">
                  {viewingForm.schoolPersonnel || '-'}
                </div>
              </div>

            <div className="form-group">
                <label className="form-label">Contact Number of Parents/Guardians:</label>
                <div className="view-field">
                  {viewingForm.parentContactNumber || '-'}
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
      
      <div className="endorsement-card consultation-scrollable-form">
        <p className="page-description">Create and manage consultation and conference forms.</p>
        
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
          {/* Search */}
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search students, counselor, parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="sort-dropdown-container">
            <button
              ref={sortBtnRef}
              className={`sort-button ${showSortMenu ? 'sort-button-active' : ''}`}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <SortAsc size={20} />
              Sort
              <ChevronDown size={16} className={`sort-chevron ${showSortMenu ? 'sort-chevron-up' : ''}`} />
            </button>

            {showSortMenu && createPortal(
              <div className="sort-dropdown sort-dropdown-portal"
                   style={{ position: 'fixed', top: sortMenuPos.top, left: sortMenuPos.left, width: sortMenuPos.width }}>
                <div className="sort-dropdown-header">
                  <span>Sort by</span>
                  <span className="current-sort">{getCurrentSortText()}</span>
                </div>
                {sortOptions.map((option) => (
                  <button
                    key={`${option.key}-${option.direction}`}
                    className={`sort-option ${sortConfig.key === option.key && sortConfig.direction === option.direction ? 'sort-option-active' : ''}`}
                    onClick={() => handleSort(option.key, option.direction)}
                    style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <span>{option.label}</span>
                    <span className="sort-direction">
                      {option.key === 'date' 
                        ? (option.direction === 'asc' ? 'Oldest First' : 'Newest First')
                        : (option.direction === 'asc' ? 'A-Z' : 'Z-A')}
                    </span>
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

          {/* Filter */}
          <button
            className={`filter-button ${showFilters ? 'filter-button-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filter
            {hasActiveFilters && (
              <span className="filter-badge">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

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
          style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Date To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className="filter-input"
          style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Grade Level</label>
        <select
          value={filters.gradeLevel}
          onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
          className="filter-input"
          style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <option value="">All Grade Levels</option>
          {uniqueGradeLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Counselor Name</label>
        <select
          value={filters.counselorName}
          onChange={(e) => handleFilterChange('counselorName', e.target.value)}
          className="filter-input"
          style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <option value="">All Counselors</option>
          {uniqueCounselorNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Parent/Guardian</label>
        <select
          value={filters.parentGuardian}
          onChange={(e) => handleFilterChange('parentGuardian', e.target.value)}
          className="filter-input"
          style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <option value="">All Parents/Guardians</option>
          {uniqueParentGuardians.map(pg => (
            <option key={pg} value={pg}>{pg}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
)}

<div className="results-summary">
  <p>
    Showing {filteredAndSortedForms.length} of {forms.length} forms
    {hasActiveFilters && " (filtered)"}
  </p>
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
                {filteredAndSortedForms.map((form) => (
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
                    <td>{form.counselorName || '-'}</td>
                    <td>{form.parentGuardian || '-'}</td>
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