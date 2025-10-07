import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save, Clock, AlertCircle, Search, ChevronDown, X, SortAsc } from 'lucide-react';
import { createPortal } from 'react-dom';
import '../styles/GuidanceNotes.css';
import Select from 'react-select';
import axios from 'axios';

// Utility functions
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

const getCurrentManilaDate = () => {
  const now = new Date();
  const manilaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  const year = manilaTime.getFullYear();
  const month = String(manilaTime.getMonth() + 1).padStart(2, '0');
  const day = String(manilaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentManilaTime = () => {
  const now = new Date();
  const manilaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  const hours = String(manilaTime.getHours()).padStart(2, '0');
  const minutes = String(manilaTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

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

const GuidanceNotesView = () => {
  const [notes, setNotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [showView, setShowView] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    studentId: '',
    interviewDate: getCurrentManilaDate(),
    timeStarted: getCurrentManilaTime(),
    timeEnded: '',
    schoolYear: '',
    tertiarySemester: '',
    seniorHighQuarter: '',
    gradeYearLevelSection: '',
    program: '',
    // Nature of Counseling
    isAcademic: false,
    isBehavioral: false,
    isPersonal: false,
    isSocial: false,
    isCareer: false,
    // Counseling Situation
    isIndividual: false,
    isGroup: false,
    isClass: false,
    isCounselorInitiated: false,
    isWalkIn: false,
    isFollowUp: false,
    isReferred: false,
    referredBy: '',
    // Notes sections
    presentingProblem: '',
    assessment: '',
    interventions: '',
    planOfAction: '',
    // Recommendations
    isFollowThroughSession: false,
    followThroughDate: '',
    isReferral: false,
    referralAgencyName: '',
    // Counselor info (auto-populated)
    counselorName: ''
  });
  // Search/Sort/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'interviewDate', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    grade: '',
    counselorName: ''
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
    { key: 'interviewDate', label: 'Interview Date', direction: 'desc' },
    { key: 'student', label: 'Student Name', direction: 'asc' },
    { key: 'grade', label: 'Grade/Section', direction: 'asc' },
    { key: 'counselorName', label: 'Counselor Name', direction: 'asc' }
  ];

  const filteredAndSortedNotes = useMemo(() => {
  const term = (searchTerm || '').trim().toLowerCase();
  let result = notes.slice();

  // 1) Filters
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter(n => new Date(n.interviewDate) >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter(n => new Date(n.interviewDate) <= to);
  }
  if (filters.grade) {
    const g = filters.grade.toLowerCase();
    result = result.filter(n => (n.gradeYearLevelSection || '').toLowerCase().includes(g));
  }
  if (filters.counselorName) {
    const c = filters.counselorName.toLowerCase();
    result = result.filter(n => (n.counselor?.name || '').toLowerCase().includes(c));
  }

  // 2) Search
  if (term) {
    result = result.filter(n => {
      const fullName = (n.student?.fullName || '').toLowerCase();
      const studNo = String(n.student?.studentNumber || '').toLowerCase();
      const grade = (n.gradeYearLevelSection || '').toLowerCase();
      const program = (n.program || '').toLowerCase();
      const counselor = (n.counselor?.name || '').toLowerCase();
      const nature = [
        n.isAcademic && 'academic',
        n.isBehavioral && 'behavioral',
        n.isPersonal && 'personal',
        n.isSocial && 'social',
        n.isCareer && 'career',
      ].filter(Boolean).join(' ').toLowerCase();
      const situation = [
        n.isIndividual && 'individual',
        n.isGroup && 'group',
        n.isClass && 'class',
        n.isCounselorInitiated && 'counselor initiated',
        n.isWalkIn && 'walk-in',
        n.isFollowUp && 'follow-up',
        n.isReferred && 'referred',
      ].filter(Boolean).join(' ').toLowerCase();
      return (
        fullName.includes(term) ||
        studNo.includes(term) ||
        grade.includes(term) ||
        program.includes(term) ||
        counselor.includes(term) ||
        nature.includes(term) ||
        situation.includes(term)
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
        case 'interviewDate':
          aValue = new Date(a.interviewDate);
          bValue = new Date(b.interviewDate);
          break;
        case 'grade':
          aValue = a.gradeYearLevelSection || '';
          bValue = b.gradeYearLevelSection || '';
          break;
        case 'counselorName':
          aValue = a.counselor?.name || '';
          bValue = b.counselor?.name || '';
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
}, [notes, searchTerm, filters, sortConfig]);

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
  setFilters({ dateFrom: '', dateTo: '', grade: '', counselorName: '' });
  setSearchTerm('');
};

const getCurrentSortText = () => {
  const currentSort = sortOptions.find(opt => opt.key === sortConfig.key);
  const directionText = sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A';
  if (sortConfig.key === 'interviewDate') {
    return `${currentSort?.label} (${sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'})`;
  }
  return `${currentSort?.label} (${directionText})`;
};

const hasActiveFilters = useMemo(() => {
  return Boolean(filters.dateFrom || filters.dateTo || filters.grade || filters.counselorName);
}, [filters]);

const uniqueGrades = useMemo(() => {
  const list = notes.map(n => n.gradeYearLevelSection).filter(Boolean);
  return [...new Set(list)].sort();
}, [notes]);

const uniqueCounselors = useMemo(() => {
  const list = notes.map(n => n.counselor?.name).filter(Boolean);
  return [...new Set(list)].sort();
}, [notes]);

  // Build options and a filter for name or student number
  const studentOptions = useMemo(() => students.map(s => ({
    value: String(s.studentId),
    label: `${s.fullName} - ${s.studentNumber}`,
    meta: s
  })), [students]);

  const filterOption = (option, rawInput) => {
    if (!rawInput) return true;
    const q = rawInput.toLowerCase();
    const s = option.data.meta;
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      String(s.studentNumber || '').toLowerCase().includes(q)
    );
  };

  // Replace native select change with react-select change
  const handleStudentSelect = async (opt) => {
    const value = opt?.value || '';

    // Clear validation error
    if (validationErrors.studentId) {
      setValidationErrors(prev => ({ ...prev, studentId: undefined }));
    }

    setFormData(prev => ({ ...prev, studentId: value }));

    if (value) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/student-details/${value}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const selectedStudent = response.data;
        if (selectedStudent) {
          setFormData(prev => ({
            ...prev,
            gradeYearLevelSection: selectedStudent.gradeYearLevelSection,
            program: selectedStudent.program
          }));
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        gradeYearLevelSection: '',
        program: ''
      }));
    }
  };

  const rsStyles = useMemo(() => ({
  control: (base) => ({
    ...base,
    borderColor: validationErrors.studentId ? '#ef4444' : base.borderColor,
    boxShadow: validationErrors.studentId ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : base.boxShadow
  }),
  menu: (base) => ({ ...base, zIndex: 20 })
}), [validationErrors.studentId]);

// Validation function
const validateForm = () => {
  const errors = {};

  // Required fields
  if (!formData.studentId) {
    errors.studentId = 'Student selection is required';
  }

  if (!formData.interviewDate) {
    errors.interviewDate = 'Interview date is required';
  }

  // Time validations
  if (!formData.timeEnded) {
    errors.timeEnded = 'End time is required';
  } else if (formData.timeStarted && formData.timeEnded) {
    const startTime = new Date(`1970-01-01T${formData.timeStarted}:00`);
    const endTime = new Date(`1970-01-01T${formData.timeEnded}:00`);
    if (endTime <= startTime) {
      errors.timeEnded = 'End time must be after start time';
    }
  }

  // Semester/Quarter (require at least one)
  if (!formData.tertiarySemester && !formData.seniorHighQuarter) {
    errors.semesterQuarter = 'Select either Semester or Quarter';
  }

  // Nature of Counseling (at least one)
  const natureSelected =
    formData.isAcademic ||
    formData.isBehavioral ||
    formData.isPersonal ||
    formData.isSocial ||
    formData.isCareer;
  if (!natureSelected) {
    errors.natureOfCounseling = 'At least one nature of counseling must be selected';
  }

  // Counseling Situation (at least one)
  const situationSelected =
    formData.isIndividual ||
    formData.isGroup ||
    formData.isClass ||
    formData.isCounselorInitiated ||
    formData.isWalkIn ||
    formData.isFollowUp ||
    formData.isReferred;
  if (!situationSelected) {
    errors.counselingSituation = 'At least one counseling situation must be selected';
  }

  // If referred is checked, referredBy should be filled
  if (formData.isReferred && !formData.referredBy.trim()) {
    errors.referredBy = 'Referred by field is required when "Referred" is selected';
  }

  // Recommendations: require at least one
  if (!formData.isFollowThroughSession && !formData.isReferral) {
    errors.recommendations = 'Select at least one recommendation';
  }

  // Follow-through validation
  if (formData.isFollowThroughSession && !formData.followThroughDate) {
    errors.followThroughDate = 'Follow-through date is required when follow-through session is selected';
  }

  // Referral validation
  if (formData.isReferral && !formData.referralAgencyName.trim()) {
    errors.referralAgencyName = 'Referral agency name is required when referral is selected';
  }

  // Interview date validation (shouldn't be future date)
  const today = new Date();
  const interviewDate = new Date(formData.interviewDate);
  if (interviewDate > today) {
    errors.interviewDate = 'Interview date cannot be in the future';
  }

  // Basic content validation
  if (!formData.presentingProblem.trim()) {
    errors.presentingProblem = 'Presenting problem is required';
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  // Fetch current counselor details
  const fetchCurrentCounselor = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/current-counselor',
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

  // Fetch all notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/guidance-notes',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchStudents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Handle semester/quarter mutual exclusion
    if (name === 'tertiarySemester' && value) {
      newFormData.seniorHighQuarter = '';
    } else if (name === 'seniorHighQuarter' && value) {
      newFormData.tertiarySemester = '';
    }

    // Handle referred checkbox
    if (name === 'isReferred') {
      if (!checked) {
        newFormData.referredBy = '';
      }
    }

    // Handle follow-through checkbox
    if (name === 'isFollowThroughSession') {
      if (!checked) {
        newFormData.followThroughDate = '';
      }
    }

    // Handle referral checkbox
    if (name === 'isReferral') {
      if (!checked) {
        newFormData.referralAgencyName = '';
      }
    }

    setFormData(newFormData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert('Please correct the errors in the form before submitting.');
      return;
    }

    setLoading(true);

    // Clean up empty date fields
    const cleanedFormData = {
      ...formData,
      followThroughDate: formData.followThroughDate === '' ? null : formData.followThroughDate
    };

    try {
      const token = localStorage.getItem('authToken');
      const url = editingNote 
        ? `https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/${editingNote.noteId}`
        : 'https://guidanceofficeapi-production.up.railway.app/api/guidance-notes';
      const method = editingNote ? 'put' : 'post';
      const response = await axios[method](url, cleanedFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (editingNote) {
        setNotes(prev => prev.map(note => 
          note.noteId === editingNote.noteId 
            ? { ...note, ...cleanedFormData, updatedAt: new Date().toISOString() }
            : note
        ));
        alert('Guidance note updated successfully!');
      } else {
        const newNote = {
          noteId: Date.now(),
          ...cleanedFormData,
          counselorId: 1,
          createdAt: new Date().toISOString(),
          student: students.find(s => s.studentId.toString() === cleanedFormData.studentId)
        };
        setNotes(prev => [newNote, ...prev]);
        alert('Guidance note created successfully!');
      }

      // Reset form
      await handleCreateNew();
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      console.error('Full error response:', error.response?.data);
      alert(`Error saving guidance note: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle view
  const handleView = (note) => {
    setViewingNote(note);
    setShowView(true);
  };

  // Handle edit
  const handleEdit = (note) => {
    setEditingNote(note);
    setValidationErrors({});
    setFormData({
      studentId: note.studentId.toString(),
      interviewDate: note.interviewDate,
      timeStarted: note.timeStarted,
      timeEnded: note.timeEnded,
      schoolYear: note.schoolYear,
      tertiarySemester: note.tertiarySemester,
      seniorHighQuarter: note.seniorHighQuarter,
      gradeYearLevelSection: note.gradeYearLevelSection,
      program: note.program,
      isAcademic: note.isAcademic,
      isBehavioral: note.isBehavioral,
      isPersonal: note.isPersonal,
      isSocial: note.isSocial,
      isCareer: note.isCareer,
      isIndividual: note.isIndividual,
      isGroup: note.isGroup,
      isClass: note.isClass,
      isCounselorInitiated: note.isCounselorInitiated,
      isWalkIn: note.isWalkIn,
      isFollowUp: note.isFollowUp,
      isReferred: note.isReferred || false,
      referredBy: note.referredBy,
      presentingProblem: note.presentingProblem,
      assessment: note.assessment,
      interventions: note.interventions,
      planOfAction: note.planOfAction,
      isFollowThroughSession: note.isFollowThroughSession,
      followThroughDate: note.followThroughDate || '',
      isReferral: note.isReferral,
      referralAgencyName: note.referralAgencyName,
      counselorName: note.counselor?.name || ''
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this guidance note?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(prev => prev.filter(note => note.noteId !== noteId));
      alert('Guidance note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting guidance note. Please try again.');
    }
  };

  // Handle create new
  const handleCreateNew = async () => {
    setEditingNote(null);
    setValidationErrors({});
    
    // Fetch counselor details and auto-populate
    const counselorDetails = await fetchCurrentCounselor();
    
    setFormData({
      studentId: '',
      interviewDate: getCurrentManilaDate(),
      timeStarted: getCurrentManilaTime(),
      timeEnded: '',
      schoolYear: '',
      tertiarySemester: '',
      seniorHighQuarter: '',
      gradeYearLevelSection: '',
      program: '',
      isAcademic: false,
      isBehavioral: false,
      isPersonal: false,
      isSocial: false,
      isCareer: false,
      isIndividual: false,
      isGroup: false,
      isClass: false,
      isCounselorInitiated: false,
      isWalkIn: false,
      isFollowUp: false,
      isReferred: false,
      referredBy: '',
      presentingProblem: '',
      assessment: '',
      interventions: '',
      planOfAction: '',
      isFollowThroughSession: false,
      followThroughDate: '',
      isReferral: false,
      referralAgencyName: '',
      counselorName: counselorDetails ? counselorDetails.name : ''
    });
    setShowForm(true);
  };

  // Handle back to list
  const handleBack = () => {
    setShowForm(false);
    setEditingNote(null);
    setValidationErrors({});
  };

  // Handle back from view
  const handleBackFromView = () => {
    setShowView(false);
    setViewingNote(null);
  };

  // Get nature of counseling display text
  const getNatureOfCounseling = (note) => {
    const types = [];
    if (note.isAcademic) types.push('Academic');
    if (note.isBehavioral) types.push('Behavioral');
    if (note.isPersonal) types.push('Personal');
    if (note.isSocial) types.push('Social');
    if (note.isCareer) types.push('Career');
    return types.join(', ') || 'None specified';
  };

  // Get counseling situation display text
  const getCounselingSituation = (note) => {
    const situations = [];
    if (note.isIndividual) situations.push('Individual');
    if (note.isGroup) situations.push('Group');
    if (note.isClass) situations.push('Class');
    if (note.isCounselorInitiated) situations.push('Counselor Initiated');
    if (note.isWalkIn) situations.push('Walk-in');
    if (note.isFollowUp) situations.push('Follow-up');
    if (note.isReferred) situations.push('Referred');
    return situations.join(', ') || 'None specified';
  };

  // Form View
  if (showForm) {
    return (
      <div className="endorsement-custody-container">
        <div className="form-header">
          <button 
            type="button"
            onClick={handleBack}
            className="back-button"
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h2 className="form-title">
            {editingNote ? 'Edit' : 'Create'} Guidance/Counseling Note
          </h2>
        </div>

        <div className="endorsement-form-card guidance-scrollable-form">
          <form onSubmit={handleSubmit} className="endorsement-form">
            {/* Student Selection */}
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
                  onChange={handleStudentSelect}
                  styles={rsStyles} // uncomment if you added rsStyles for error border
              />
              {validationErrors.studentId && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.studentId}
                </div>
              )}
            </div>

            {/* Interview Date and Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="interviewDate" className="form-label">Interview Date</label>
                <input
                  type="date"
                  id="interviewDate"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${validationErrors.interviewDate ? 'error' : ''}`}
                />
                {validationErrors.interviewDate && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {validationErrors.interviewDate}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="timeStarted" className="form-label">Time Started</label>
                <input
                  type="time"
                  id="timeStarted"
                  name="timeStarted"
                  value={formData.timeStarted}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="timeEnded" className="form-label">Time Ended</label>
                <input
                  type="time"
                  id="timeEnded"
                  name="timeEnded"
                  value={formData.timeEnded}
                  onChange={handleInputChange}
                  className={`form-input ${validationErrors.timeEnded ? 'error' : ''}`}
                />
                {validationErrors.timeEnded && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {validationErrors.timeEnded}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="schoolYear" className="form-label">School Year</label>
                <input
                  type="text"
                  id="schoolYear"
                  name="schoolYear"
                  value={formData.schoolYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2023-2024"
                  className="form-input"
                />
              </div>
            </div>

            {/* School Year Info - Mutually Exclusive */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tertiarySemester" className="form-label">Semester (Tertiary)</label>
                <select
                  id="tertiarySemester"
                  name="tertiarySemester"
                  value={formData.tertiarySemester}
                  onChange={handleInputChange}
                  disabled={!!formData.seniorHighQuarter}
                  className={`form-select ${validationErrors.semesterQuarter ? 'error' : ''}`}
                >
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
                {formData.seniorHighQuarter && (
                  <div className="field-note">
                    Disabled because Quarter is selected
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="seniorHighQuarter" className="form-label">Quarter (Senior High)</label>
                <select
                  id="seniorHighQuarter"
                  name="seniorHighQuarter"
                  value={formData.seniorHighQuarter}
                  onChange={handleInputChange}
                  disabled={!!formData.tertiarySemester}
                  className={`form-select ${validationErrors.semesterQuarter ? 'error' : ''}`}
                >
                  <option value="">Select Quarter</option>
                  <option value="1st">1st Quarter</option>
                  <option value="2nd">2nd Quarter</option>
                  <option value="3rd">3rd Quarter</option>
                  <option value="4th">4th Quarter</option>
                  <option value="Summer">Summer</option>
                </select>
                {formData.tertiarySemester && (
                  <div className="field-note">
                    Disabled because Semester is selected
                  </div>
                )}
                {validationErrors.semesterQuarter && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {validationErrors.semesterQuarter}
                  </div>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gradeYearLevelSection" className="form-label">Grade/Year Level & Section</label>
                <input
                  type="text"
                  id="gradeYearLevelSection"
                  name="gradeYearLevelSection"
                  value={formData.gradeYearLevelSection}
                  onChange={handleInputChange}
                  placeholder="e.g., Grade 11-A, BSIT 4-B"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="program" className="form-label">Program</label>
                <input
                  type="text"
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  placeholder="e.g., STEM, ABM, BSIT"
                  className="form-input"
                />
              </div>
            </div>

            {/* Nature of Counseling */}
            <div className="form-group">
              <label className="form-label">Nature of Counseling (Select at least one)</label>
              <div className={`guidance-checkbox-grid ${validationErrors.natureOfCounseling ? 'error-border' : ''}`}>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isAcademic"
                    checked={formData.isAcademic}
                    onChange={handleInputChange}
                  />
                  Academic
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isBehavioral"
                    checked={formData.isBehavioral}
                    onChange={handleInputChange}
                  />
                  Behavioral
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isPersonal"
                    checked={formData.isPersonal}
                    onChange={handleInputChange}
                  />
                  Personal
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isSocial"
                    checked={formData.isSocial}
                    onChange={handleInputChange}
                  />
                  Social
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isCareer"
                    checked={formData.isCareer}
                    onChange={handleInputChange}
                  />
                  Career
                </label>
              </div>
              {validationErrors.natureOfCounseling && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.natureOfCounseling}
                </div>
              )}
            </div>

            {/* Counseling Situation */}
            <div className="form-group">
              <label className="form-label">Counseling Situation (Select at least one)</label>
              <div className={`guidance-checkbox-grid ${validationErrors.counselingSituation ? 'error-border' : ''}`}>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isIndividual"
                    checked={formData.isIndividual}
                    onChange={handleInputChange}
                  />
                  Individual
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isGroup"
                    checked={formData.isGroup}
                    onChange={handleInputChange}
                  />
                  Group
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isClass"
                    checked={formData.isClass}
                    onChange={handleInputChange}
                  />
                  Class
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isCounselorInitiated"
                    checked={formData.isCounselorInitiated}
                    onChange={handleInputChange}
                  />
                  Counselor Initiated
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isWalkIn"
                    checked={formData.isWalkIn}
                    onChange={handleInputChange}
                  />
                  Walk-in
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isFollowUp"
                    checked={formData.isFollowUp}
                    onChange={handleInputChange}
                  />
                  Follow-up
                </label>
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isReferred"
                    checked={formData.isReferred}
                    onChange={handleInputChange}
                  />
                  Referred
                </label>
              </div>
              {validationErrors.counselingSituation && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.counselingSituation}
                </div>
              )}

              {/* Referred By conditional field */}
              {formData.isReferred && (
                <div className="guidance-conditional-field">
                  <label htmlFor="referredBy" className="form-label">Referred By *</label>
                  <input
                    type="text"
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                    placeholder="Name of person who referred the student"
                    className={`form-input ${validationErrors.referredBy ? 'error' : ''}`}
                  />
                  {validationErrors.referredBy && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {validationErrors.referredBy}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Counseling Notes Sections */}
            <div className="form-group">
              <label htmlFor="presentingProblem" className="form-label">Presenting Problem</label>
              <textarea
                id="presentingProblem"
                name="presentingProblem"
                value={formData.presentingProblem}
                onChange={handleInputChange}
                placeholder="Describe the presenting problem..."
                className={`form-textarea ${validationErrors.presentingProblem ? 'error' : ''}`}
                required
                rows="4"
              />
              {validationErrors.presentingProblem && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.presentingProblem}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="assessment" className="form-label">Assessment</label>
              <textarea
                id="assessment"
                name="assessment"
                value={formData.assessment}
                onChange={handleInputChange}
                placeholder="Assessment notes..."
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="interventions" className="form-label">Interventions</label>
              <textarea
                id="interventions"
                name="interventions"
                value={formData.interventions}
                onChange={handleInputChange}
                placeholder="Interventions implemented..."
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="planOfAction" className="form-label">Plan of Action</label>
              <textarea
                id="planOfAction"
                name="planOfAction"
                value={formData.planOfAction}
                onChange={handleInputChange}
                placeholder="Plan of action..."
                className="form-textarea"
                rows="4"
              />
            </div>

            {/* Recommendations */}
            <div className="form-group">
              <label className="form-label">Recommendations</label>
              {validationErrors.recommendations && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.recommendations}
                </div>
              )}
              <div className="guidance-recommendation-section">
                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isFollowThroughSession"
                    checked={formData.isFollowThroughSession}
                    onChange={handleInputChange}
                  />
                  Follow-through Session Required
                </label>

                {formData.isFollowThroughSession && (
                  <div className="guidance-conditional-field">
                    <label htmlFor="followThroughDate" className="form-label">Follow-through Date *</label>
                    <input
                      type="date"
                      id="followThroughDate"
                      name="followThroughDate"
                      value={formData.followThroughDate}
                      onChange={handleInputChange}
                      className={`form-input ${validationErrors.followThroughDate ? 'error' : ''}`}
                    />
                    {validationErrors.followThroughDate && (
                      <div className="error-message">
                        <AlertCircle size={16} />
                        {validationErrors.followThroughDate}
                      </div>
                    )}
                  </div>
                )}

                <label className="guidance-checkbox-item">
                  <input
                    type="checkbox"
                    name="isReferral"
                    checked={formData.isReferral}
                    onChange={handleInputChange}
                  />
                  Referral Required
                </label>

                {formData.isReferral && (
                  <div className="guidance-conditional-field">
                    <label htmlFor="referralAgencyName" className="form-label">Referral Agency Name *</label>
                    <input
                      type="text"
                      id="referralAgencyName"
                      name="referralAgencyName"
                      value={formData.referralAgencyName}
                      onChange={handleInputChange}
                      placeholder="Name of agency or professional"
                      className={`form-input ${validationErrors.referralAgencyName ? 'error' : ''}`}
                    />
                    {validationErrors.referralAgencyName && (
                      <div className="error-message">
                        <AlertCircle size={16} />
                        {validationErrors.referralAgencyName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Counselor Name (Auto-populated and at bottom) */}
            <div className="form-group">
              <label htmlFor="counselorName" className="form-label">Name of Guidance Counselor</label>
              <input
                type="text"
                id="counselorName"
                name="counselorName"
                value={formData.counselorName}
                onChange={handleInputChange}
                className={`form-input form-input--readonly ${validationErrors.counselorName ? 'error' : ''}`}
                readOnly
                placeholder="Counselor name will be auto-populated"
              />
              {validationErrors.counselorName && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {validationErrors.counselorName}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="save-button"
              >
                <Save size={16} />
                {loading ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View Mode
  if (showView && viewingNote) {
    return (
      <div className="endorsement-custody-container">
        <div className="form-header">
          <button 
            type="button"
            onClick={handleBackFromView}
            className="back-button"
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h2 className="form-title">
            View Guidance/Counseling Note
          </h2>
        </div>

        <div className="endorsement-form-card guidance-scrollable-form">
          <div className="view-form">
            {/* Student Info */}
            <div className="form-group">
              <label className="form-label">Student</label>
              <div className="view-field">
                <div className="student-info">
                  <div className="student-avatar">
                    {viewingNote.student?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="student-name">
                      {viewingNote.student?.fullName}
                    </div>
                    <div className="student-number">
                      {viewingNote.student?.studentNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Counselor Info */}
            <div className="form-group">
              <label className="form-label">Counselor</label>
              <div className="view-field">
                {viewingNote.counselor?.name || '-'}
              </div>
            </div>

            {/* Interview Details */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interview Date</label>
                <div className="view-field">{formatManilaDate(viewingNote.interviewDate)}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Time Started</label>
                <div className="view-field">{formatTime(viewingNote.timeStarted)}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Time Ended</label>
                <div className="view-field">{formatTime(viewingNote.timeEnded)}</div>
              </div>
              <div className="form-group">
                <label className="form-label">School Year</label>
                <div className="view-field">{viewingNote.schoolYear || '-'}</div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Semester/Quarter</label>
                <div className="view-field">
                  {viewingNote.tertiarySemester && `${viewingNote.tertiarySemester} Semester`}
                  {viewingNote.seniorHighQuarter && `${viewingNote.seniorHighQuarter} Quarter`}
                  {!viewingNote.tertiarySemester && !viewingNote.seniorHighQuarter && '-'}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Grade/Year & Section</label>
                <div className="view-field">{viewingNote.gradeYearLevelSection || '-'}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Program</label>
              <div className="view-field">{viewingNote.program || '-'}</div>
            </div>

            {/* Nature of Counseling */}
            <div className="form-group">
              <label className="form-label">Nature of Counseling</label>
              <div className="view-field">{getNatureOfCounseling(viewingNote)}</div>
            </div>

            {/* Counseling Situation */}
            <div className="form-group">
              <label className="form-label">Counseling Situation</label>
              <div className="view-field">{getCounselingSituation(viewingNote)}</div>
            </div>

            {/* Referred By */}
            {viewingNote.referredBy && (
              <div className="form-group">
                <label className="form-label">Referred By</label>
                <div className="view-field">{viewingNote.referredBy}</div>
              </div>
            )}

            {/* Counseling Notes */}
            <div className="form-group">
              <label className="form-label">Presenting Problem</label>
              <div className="view-field view-textarea">
                {viewingNote.presentingProblem || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assessment</label>
              <div className="view-field view-textarea">
                {viewingNote.assessment || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Interventions</label>
              <div className="view-field view-textarea">
                {viewingNote.interventions || '-'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Plan of Action</label>
              <div className="view-field view-textarea">
                {viewingNote.planOfAction || '-'}
              </div>
            </div>

            {/* Recommendations */}
            <div className="form-group">
              <label className="form-label">Recommendations</label>
              <div className="view-field">
                <div className="guidance-recommendation-display">
                  <div className="guidance-recommendation-item">
                    <span className={`guidance-checkbox-display ${viewingNote.isFollowThroughSession ? 'checked' : ''}`}>
                      {viewingNote.isFollowThroughSession ? '✓' : '☐'}
                    </span>
                    Follow-through Session Required
                  </div>
                  
                  {viewingNote.isFollowThroughSession && viewingNote.followThroughDate && (
                    <div className="guidance-recommendation-detail">
                      Follow-through Date: {formatManilaDate(viewingNote.followThroughDate)}
                    </div>
                  )}

                  <div className="guidance-recommendation-item">
                    <span className={`guidance-checkbox-display ${viewingNote.isReferral ? 'checked' : ''}`}>
                      {viewingNote.isReferral ? '✓' : '☐'}
                    </span>
                    Referral Required
                  </div>

                  {viewingNote.isReferral && viewingNote.referralAgencyName && (
                    <div className="guidance-recommendation-detail">
                      Referral Agency: {viewingNote.referralAgencyName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Created</label>
                <div className="view-field">{formatManilaDateTime(viewingNote.createdAt)}</div>
              </div>
              {viewingNote.updatedAt && (
                <div className="form-group">
                  <label className="form-label">Last Updated</label>
                  <div className="view-field">{formatManilaDateTime(viewingNote.updatedAt)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="endorsement-custody-container">
      <h2 className="page-title">Guidance/Counseling Notes</h2>
      
      <div className="endorsement-card guidance-scrollable-form">
        <p className="page-description">Create and manage guidance and counseling notes for student sessions.</p>
        
        <div className="card-header">
          <div className="header-left">
            <button 
              type="button"
              onClick={handleCreateNew}
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
                placeholder="Search students, grade, program, counselor..."
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
                        {option.key === 'interviewDate' 
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
                <label className="filter-label">Grade/Section</label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="filter-input"
                  style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  <option value="">All</option>
                  {uniqueGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
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
                  <option value="">All</option>
                  {uniqueCounselors.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="results-summary">
          <p>
            Showing {filteredAndSortedNotes.length} of {notes.length} notes
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p>No guidance notes found. Click "Create New Note" to get started.</p>
          </div>
        ) : (
          <div className="forms-table-container">
            <table className="forms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Interview Date</th>
                  <th>Time</th>
                  <th>Nature</th>
                  <th>Situation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedNotes.map((note) => (
                  <tr 
                    key={note.noteId}
                    className="clickable-row"
                    onClick={() => handleView(note)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleView(note);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View form for ${note.student?.fullName || 'student'}`}
                    title="View"
                  >
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {note.student?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="student-name">
                            {note.student?.fullName}
                          </div>
                          <div className="student-number">
                            {note.student?.studentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{formatManilaDate(note.interviewDate)}</div>
                    </td>
                    <td>
                      <div className="guidance-time-display">
                        <Clock size={14} />
                        <span>{formatTime(note.timeStarted)}</span>
                        {note.timeEnded && (
                          <>
                            <span> - </span>
                            <span>{formatTime(note.timeEnded)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="guidance-nature-display">
                        {getNatureOfCounseling(note).split(', ').slice(0, 2).join(', ')}
                        {getNatureOfCounseling(note).split(', ').length > 2 && '...'}
                      </div>
                    </td>
                    <td>
                      <div className="guidance-situation-display">
                        {getCounselingSituation(note).split(', ').slice(0, 2).join(', ')}
                        {getCounselingSituation(note).split(', ').length > 2 && '...'}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          type="button"
                          onClick={() => handleView(note)}
                          className="action-button view-button"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleEdit(note)}
                          className="action-button edit-button"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(note.noteId)}
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

export default GuidanceNotesView;