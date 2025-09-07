import React, { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Eye, Edit, Trash2, ArrowLeft, Save, Clock } from 'lucide-react';
import '../styles/GuidanceNotes.css';
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
    referralAgencyName: ''
  });

  // Fetch all notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      //Actual API call
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
      //Actual API call
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle student selection and auto-populate data
  const handleStudentChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (value) {
      try {
        //Actual API call to get student details
         const token = localStorage.getItem('authToken');
         const response = await axios.get(
           `https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/student-details/${value}`,
           { headers: { Authorization: `Bearer ${token}` } }
         );
         const selectedStudent = response.data;
        if (selectedStudent) {
          setFormData(prev => ({
            ...prev,
            gradeYearLevelSection: `${selectedStudent.gradeYear} - ${selectedStudent.section}`,
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      //Actual API call
       const token = localStorage.getItem('authToken');
       const url = editingNote 
         ? `https://guidanceofficeapi-production.up.railway.app/api/guidance-notes/${editingNote.noteId}`
         : 'https://guidanceofficeapi-production.up.railway.app/api/guidance-notes';
       const method = editingNote ? 'put' : 'post';
       const response = await axios[method](url, formData, {
         headers: { Authorization: `Bearer ${token}` }
       });

      if (editingNote) {
        // Update existing note
        setNotes(prev => prev.map(note => 
          note.noteId === editingNote.noteId 
            ? { ...note, ...formData, updatedAt: new Date().toISOString() }
            : note
        ));
        alert('Guidance note updated successfully!');
      } else {
        // Create new note
        const newNote = {
          noteId: Date.now(),
          ...formData,
          counselorId: 1,
          createdAt: new Date().toISOString(),
          student: students.find(s => s.studentId.toString() === formData.studentId)
        };
        setNotes(prev => [newNote, ...prev]);
        alert('Guidance note created successfully!');
      }

      // Reset form
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
        referredBy: '',
        presentingProblem: '',
        assessment: '',
        interventions: '',
        planOfAction: '',
        isFollowThroughSession: false,
        followThroughDate: '',
        isReferral: false,
        referralAgencyName: ''
      });
      setShowForm(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
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
      referredBy: note.referredBy,
      presentingProblem: note.presentingProblem,
      assessment: note.assessment,
      interventions: note.interventions,
      planOfAction: note.planOfAction,
      isFollowThroughSession: note.isFollowThroughSession,
      followThroughDate: note.followThroughDate || '',
      isReferral: note.isReferral,
      referralAgencyName: note.referralAgencyName
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this guidance note?')) return;

    try {
      //Actual API call
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
  const handleCreateNew = () => {
    setEditingNote(null);
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
      referredBy: '',
      presentingProblem: '',
      assessment: '',
      interventions: '',
      planOfAction: '',
      isFollowThroughSession: false,
      followThroughDate: '',
      isReferral: false,
      referralAgencyName: ''
    });
    setShowForm(true);
  };

  // Handle back to list
  const handleBack = () => {
    setShowForm(false);
    setEditingNote(null);
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
    return situations.join(', ') || 'None specified';
  };

  // Form View
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
            {editingNote ? 'Edit' : 'Create'} Guidance/Counseling Note
          </h2>
        </div>

        <div className="endorsement-form-card guidance-scrollable-form">
          <form onSubmit={handleSubmit} className="endorsement-form">
            {/* Student Selection */}
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

            {/* Interview Date and Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="interviewDate" className="form-label">Interview Date *</label>
                <input
                  type="date"
                  id="interviewDate"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
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
                  className="form-input"
                />
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

            {/* School Year Info */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tertiarySemester" className="form-label">Semester (Tertiary)</label>
                <select
                  id="tertiarySemester"
                  name="tertiarySemester"
                  value={formData.tertiarySemester}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="seniorHighQuarter" className="form-label">Quarter (Senior High)</label>
                <select
                  id="seniorHighQuarter"
                  name="seniorHighQuarter"
                  value={formData.seniorHighQuarter}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Quarter</option>
                  <option value="1st">1st Quarter</option>
                  <option value="2nd">2nd Quarter</option>
                  <option value="3rd">3rd Quarter</option>
                  <option value="4th">4th Quarter</option>
                  <option value="Summer">Summer</option>
                </select>
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
              <label className="form-label">Nature of Counseling (Select all that apply)</label>
              <div className="guidance-checkbox-grid">
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
            </div>

            {/* Counseling Situation */}
            <div className="form-group">
              <label className="form-label">Counseling Situation (Select all that apply)</label>
              <div className="guidance-checkbox-grid">
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

              {/* Referred By conditional field */}
              {formData.isReferred && (
                <div className="guidance-conditional-field">
                  <label htmlFor="referredBy" className="form-label">Referred By</label>
                  <input
                    type="text"
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                    placeholder="Name of person who referred the student"
                    className="form-input"
                  />
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
                className="form-textarea"
                rows="4"
              />
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
                    <label htmlFor="followThroughDate" className="form-label">Follow-through Date</label>
                    <input
                      type="date"
                      id="followThroughDate"
                      name="followThroughDate"
                      value={formData.followThroughDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
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
                    <label htmlFor="referralAgencyName" className="form-label">Referral Agency Name</label>
                    <input
                      type="text"
                      id="referralAgencyName"
                      name="referralAgencyName"
                      value={formData.referralAgencyName}
                      onChange={handleInputChange}
                      placeholder="Name of agency or professional"
                      className="form-input"
                    />
                  </div>
                )}
              </div>
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
          <div className="header-actions">
            <button 
              type="button"
              onClick={handleCreateNew}
              className="create-button"
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
                {notes.map((note) => (
                  <tr key={note.noteId}>
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleView(note);
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
                            handleEdit(note);
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
                            handleDelete(note.noteId);
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

export default GuidanceNotesView;