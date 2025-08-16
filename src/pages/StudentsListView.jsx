import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Users, ArrowLeft } from 'lucide-react';
import '../styles/Dashboard.css'; // Import the shared CSS
import axios from "axios";

//Students List View with Course Selection
const StudentsListView = () => {
  const [allStudents, setAllStudents] = useState([]); // Store all students
  const [displayedStudents, setDisplayedStudents] = useState([]); // Students to display
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);

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
    color: '#10b981',
    icon: Users,
    matchValues: [
      'BSIT', 
      'Bachelor of Science in Information Technology', 
      'Information Technology',
      'Bachelor of Science in Information Technology (BSIT)'  // <-- Added
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
      'Bachelor of Science in Computer Science (BSCS)'        // <-- Added
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
      'Bachelor of Science in Hospitality Management (BSHM)'  // <-- Added
    ]
  },
  { 
    id: 'bstm', 
    name: 'Tourism Management', 
    code: 'BSTM',
    description: 'Bachelor of Science in Tourism Management',
    color: '#ef4444',
    icon: Users,
    matchValues: [
      'BSTM', 
      'Bachelor of Science in Tourism Management', 
      'Tourism Management',
      'Bachelor of Science in Tourism Management (BSTM)'      // <-- Added
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

  // Fetch all students once when component mounts (only when a course is selected)
const fetchAllStudents = async (selectedCourse) => {
  if (hasLoadedStudents) {
    // Already loaded, just filter
    filterStudentsByCourse(selectedCourse, allStudents);
    return;
  }

  setIsLoading(true);
  try {
    console.log("Fetching students...");

    const response = await axios.get(
      "https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood",
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("API Response:", response.data);

    setAllStudents(response.data);
    setHasLoadedStudents(true);

    // ✅ use the fresh data immediately
    filterStudentsByCourse(selectedCourse, response.data);

  } catch (error) {
    console.error("Error fetching students:", error);
    alert("Failed to load students. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Filter students by course program
const filterStudentsByCourse = (course, studentList = allStudents) => {
  console.log("Filtering for course:", course?.code, course);
  console.log("Student list count:", studentList.length);

  if (!course) {
    console.warn("No course object provided!");
    return;
  }

  if (course.code === "ALL") {
    setDisplayedStudents(studentList);
    return;
  }

  const filtered = studentList.filter((student) => {
    if (!student.program) {
      console.log("❌ Student without program:", student);
      return false;
    }

    const studentProgram = student.program.toUpperCase().trim();
    console.log(`Checking student "${student.name}" with program "${studentProgram}"`);

    const matches = course.matchValues.some((matchValue) =>
      studentProgram.includes(matchValue.toUpperCase())
    );

    if (!matches) {
      console.log(`❌ No match for ${studentProgram} in course ${course.code}`);
    } else {
      console.log(`✅ Matched ${studentProgram} with course ${course.code}`);
    }

    return matches;
  });

  console.log("Filtered count:", filtered.length);
  setDisplayedStudents(filtered);
};

  // Handle course selection
  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSearchTerm(""); // Clear search when switching courses
    
    // Fetch students if not already loaded
    if (!hasLoadedStudents) {
      await fetchAllStudents();
    }
    
    // Filter students based on selected course
    filterStudentsByCourse(course);
  };

  // Handle back to course selection
  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
    setDisplayedStudents([]);
    setSearchTerm("");
    // Note: We keep hasLoadedStudents and allStudents for performance
  };

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

  // Course Selection View
  const CourseSelectionView = () => (
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

  // Students List View (existing functionality with back button)
  const StudentsTableView = () => (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleBackToCourseSelection}
            className="back-button"
            type="button"
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
              {/* Debug info - remove this after fixing */}
              <br />
              <small style={{ color: '#ef4444' }}>
                Debug: Total loaded: {allStudents.length}, Course: {selectedCourse?.code}
              </small>
            </div>
            
            {/* Add this debug section temporarily */}
            {displayedStudents.length === 0 && allStudents.length > 0 && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '16px' 
              }}>
                <h4 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>Debug Info:</h4>
                <p style={{ color: '#991b1b', fontSize: '14px', margin: '0' }}>
                  No students found for course "{selectedCourse?.code}". <br />
                  Total students loaded: {allStudents.length} <br />
                  Sample programs: {allStudents.slice(0, 3).map(s => s.program).join(', ')}
                </p>
              </div>
            )}
            
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
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
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
                        <button className="action-button action-view" type="button">
                          <Eye size={16} />
                        </button>
                        <button className="action-button action-edit" type="button">
                          <Edit size={16} />
                        </button>
                        <button className="action-button action-delete" type="button">
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

  // Only render course selection initially - no loading on login page
  return selectedCourse ? <StudentsTableView /> : <CourseSelectionView />;
};

export default StudentsListView;