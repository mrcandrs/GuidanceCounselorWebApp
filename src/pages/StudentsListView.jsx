import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Users, ArrowLeft } from 'lucide-react';
import StudentDetailsView from './StudentDetailsView';
import '../styles/Dashboard.css';
import axios from "axios";

// Move CourseSelectionView OUTSIDE of the main component
const CourseSelectionView = ({ courses, handleCourseSelect }) => (
  <div className="page-container">
    <div className="page-header">
      <h2 className="page-title">Students List</h2>
    </div>

    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1f2937', 
          margin: '0 0 8px 0' 
        }}>
          Select Course Program
        </h3>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px', 
          margin: '0' 
        }}>
          Choose a course program to view students or select "All Students" to view everyone.
        </p>
      </div>

      <div className="course-grid">
        {courses.map((course) => {
          const IconComponent = course.icon;
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => handleCourseSelect(course)}
              style={{ 
                borderColor: course.color,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div className="course-card-header">
                <div 
                  className="course-icon"
                  style={{ backgroundColor: course.color }}
                >
                  <IconComponent size={24} color="white" />
                </div>
                <div className="course-code" style={{ color: course.color }}>
                  {course.code}
                </div>
              </div>
              <div className="course-info">
                <h4 className="course-name">{course.name}</h4>
                <p className="course-description">{course.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// Move StudentsTableView OUTSIDE of the main component
const StudentsTableView = ({ 
  selectedCourse, 
  handleBackToCourseSelection, 
  searchTerm, 
  setSearchTerm, 
  isLoading, 
  filteredStudents, 
  displayedStudents,
  getMoodBadgeClass,
  handleDelete,
  handleView,
  erroredAvatars,
  setErroredAvatars
}) => (
  <div className="page-container">
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={handleBackToCourseSelection}
          className="back-button"
          type="button"
          style={{
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>
        <div>
          <h2 className="page-title">
            {selectedCourse?.code === 'ALL' ? 'All Students' : `${selectedCourse?.code} Students`}
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px', 
            margin: '4px 0 0 0' 
          }}>
            {selectedCourse?.description}
          </p>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="search-container">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={`Search ${selectedCourse?.code === 'ALL' ? 'all students' : selectedCourse?.code + ' students'}...`}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="filter-button" type="button">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {isLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0',
          color: '#6b7280'
        }}>
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ 
            marginBottom: '16px', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Showing {filteredStudents.length} of {displayedStudents.length} students
          </div>
          
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Student No.</th>
                <th className="table-header-cell">Program and Year</th>
                <th className="table-header-cell">Last Mood Level</th>
                <th className="table-header-cell">Date Registered</th>
                <th className="table-header-cell">Last Login</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="table-cell">
                    <div className="student-info">
                      <div className="student-avatar">
                        {!erroredAvatars[student.id] ? (
                            <img
                              src={`https://guidanceofficeapi-production.up.railway.app/api/student/${student.id}/photo`}
                              alt={student.name || 'Student photo'}
                              onError={() => setErroredAvatars(prev => ({ ...prev, [student.id]: true }))}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="student-avatar-fallback">
                              {(student.name || 'S').charAt(0)}
                            </div>
                        )}
                      </div>
                      <div>
                        <div className="student-name">{student.name || 'N/A'}</div>
                        <div className="student-status">{student.status || 'Active'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{student.studentno || 'N/A'}</td>
                  <td className="table-cell">
                    {student.program || 'N/A'} - {student.section || 'N/A'}
                  </td>
                  <td className="table-cell">
                    <span className={getMoodBadgeClass(student.lastMood)}>
                      {student.lastMood || "N/A"}
                    </span>
                  </td>
                  <td className="table-cell">
                    {student.dateregistered ? new Date(student.dateregistered).toLocaleString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) : 'N/A'}
                  </td>
                  <td className="table-cell">
                    {student.lastlogin ? new Date(student.lastlogin).toLocaleString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) : 'N/A'}
                  </td>
                  <td className="table-cell">
                    <div className="action-buttons">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleView(student.id);
                          }}
                          className="action-button action-view"
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
                            handleDelete(student.id);
                          }}
                          className="action-button action-delete"
                          style={{ pointerEvents: 'auto', zIndex: 999 }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: '48px 0' }}>
                    <div style={{ color: '#6b7280' }}>
                      {searchTerm 
                        ? `No students found matching "${searchTerm}"` 
                        : `No ${selectedCourse?.code === 'ALL' ? '' : selectedCourse?.code} students found.`
                      }
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

// Main StudentsListView component (simplified)
const StudentsListView = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [erroredAvatars, setErroredAvatars] = useState({});

const handleView = (studentId) => {
  setViewingStudentId(studentId);
};

const handleBackFromDetails = () => {
  setViewingStudentId(null);
};

// Updated handleDelete for nuclear CORS test - NO credentials
const handleDelete = async (studentId) => {
  if (!window.confirm('Are you sure you want to delete this student?')) return;

  try {
    const token = localStorage.getItem('authToken');
    
    console.log('Attempting to delete student with ID:', studentId);
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    const response = await axios.delete(
      `https://guidanceofficeapi-production.up.railway.app/api/student/${studentId}`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
        // Remove withCredentials entirely for this test
      }
    );
    
    console.log('Delete response:', response);
    
    if (response.status === 204 || response.status === 200) {
      // Refresh the students list - but make sure this function exists
      if (typeof fetchAllStudents === 'function') {
        await fetchAllStudents();
      } else {
        // Force page refresh if fetchAllStudents isn't available
        window.location.reload();
      }
      alert('Student deleted successfully!');
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        alert('Authentication failed. Please log in again.');
        return;
      } else if (error.response.status === 403) {
        alert('You do not have permission to delete students.');
        return;
      } else if (error.response.status === 404) {
        alert('Student not found.');
        return;
      } else {
        alert(`Server error: ${error.response.data?.message || 'Unknown error'}`);
        return;
      }
    } else if (error.request) {
      console.error('Network error - no response received');
      alert('Network error: Unable to reach the server. Please check your connection.');
    } else {
      console.error('Request setup error:', error.message);
      alert(`Request error: ${error.message}`);
    }
  }
};

  // Course configuration
  const courses = [
    { 
      id: 'all', 
      name: 'All Students', 
      code: 'ALL',
      description: 'View all registered students',
      color: '#0477BF',
      icon: Users,
      matchValues: ['ALL']
    },
    { 
      id: 'bsit', 
      name: 'Information Technology', 
      code: 'BSIT',
      description: 'Bachelor of Science in Information Technology',
      color: '#ef4444',
      icon: Users,
      matchValues: [
        'BSIT', 
        'Bachelor of Science in Information Technology', 
        'Information Technology',
        'Bachelor of Science in Information Technology (BSIT)'
      ]
    },
    { 
      id: 'bscs', 
      name: 'Computer Science', 
      code: 'BSCS',
      description: 'Bachelor of Science in Computer Science',
      color: '#8b5cf6',
      icon: Users,
      matchValues: [
        'BSCS', 
        'Bachelor of Science in Computer Science', 
        'Computer Science',
        'Bachelor of Science in Computer Science (BSCS)'
      ]
    },
    { 
      id: 'bshm', 
      name: 'Hospitality Management', 
      code: 'BSHM',
      description: 'Bachelor of Science in Hospitality Management',
      color: '#f59e0b',
      icon: Users,
      matchValues: [
        'BSHM', 
        'Bachelor of Science in Hospitality Management', 
        'Hospitality Management',
        'Bachelor of Science in Hospitality Management (BSHM)'
      ]
    },
    { 
      id: 'bstm', 
      name: 'Tourism Management', 
      code: 'BSTM',
      description: 'Bachelor of Science in Tourism Management',
      color: '#10b981',
      icon: Users,
      matchValues: [
        'BSTM', 
        'Bachelor of Science in Tourism Management', 
        'Tourism Management',
        'Bachelor of Science in Tourism Management (BSTM)'
      ]
    }
  ];


  const getMoodBadgeClass = (mood) => {
    switch (mood) {
      case 'MILD':
        return 'mood-badge mood-mild';
      case 'MODERATE':
        return 'mood-badge mood-moderate';
      case 'HIGH':
        return 'mood-badge mood-high';
      default:
        return 'mood-badge mood-neutral';
    }
  };

  const fetchAllStudents = async () => {
    if (hasLoadedStudents) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood",
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAllStudents(response.data);
      setHasLoadedStudents(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to load students. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudentsByCourse = (course, studentList = allStudents) => {
    if (!course || !studentList || studentList.length === 0) return;

    if (course.code === "ALL") {
      setDisplayedStudents(studentList);
      return;
    }

    const filtered = studentList.filter((student) => {
      if (!student.program) return false;
      const studentProgram = student.program.toUpperCase().trim();
      return course.matchValues.some((matchValue) =>
        studentProgram.includes(matchValue.toUpperCase())
      );
    });

    setDisplayedStudents(filtered);
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSearchTerm('');
    
    if (!hasLoadedStudents) {
      await fetchAllStudents();
      setTimeout(() => filterStudentsByCourse(course, allStudents), 0);
    } else {
      filterStudentsByCourse(course, allStudents);
    }
  };

  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
    setDisplayedStudents([]);
    setSearchTerm('');
  };

  useEffect(() => {
    if (allStudents.length > 0 && selectedCourse) {
      filterStudentsByCourse(selectedCourse, allStudents);
    }
  }, [allStudents, selectedCourse]);

  // Filter students by search term
  const filteredStudents = displayedStudents.filter((student) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(searchLower)) ||
      (student.studentno && student.studentno.toLowerCase().includes(searchLower)) ||
      (student.program && student.program.toLowerCase().includes(searchLower)) ||
      (student.section && student.section.toLowerCase().includes(searchLower)) ||
      (student.lastMood && student.lastMood.toLowerCase().includes(searchLower)) ||
      (student.id && student.id.toString().includes(searchLower))
    );
  });

    if (viewingStudentId) {
  return <StudentDetailsView studentId={viewingStudentId} onBack={handleBackFromDetails} />;
}

  // Clean return statement
  return selectedCourse ? (
    <StudentsTableView 
      selectedCourse={selectedCourse}
      handleBackToCourseSelection={handleBackToCourseSelection}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      isLoading={isLoading}
      filteredStudents={filteredStudents}
      displayedStudents={displayedStudents}
      getMoodBadgeClass={getMoodBadgeClass}
      handleDelete={handleDelete}
      handleView={handleView}
      erroredAvatars={erroredAvatars}
      setErroredAvatars={setErroredAvatars}
    />
  ) : (
    <CourseSelectionView 
      courses={courses}
      handleCourseSelect={handleCourseSelect}
    />
  );
};

export default StudentsListView;