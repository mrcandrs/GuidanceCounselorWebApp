import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Users, ArrowLeft } from 'lucide-react';
import '../styles/Dashboard.css'; // Import the shared CSS
import axios from "axios";

//Students List View with Course Selection
  const StudentsListView = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Course configuration
  const courses = [
    { 
      id: 'all', 
      name: 'All Students', 
      code: 'ALL',
      description: 'View all registered students',
      color: '#0477BF',
      icon: Users
    },
    { 
      id: 'bsit', 
      name: 'Information Technology', 
      code: 'BSIT',
      description: 'Bachelor of Science in Information Technology',
      color: '#10b981',
      icon: Users
    },
    { 
      id: 'bscs', 
      name: 'Computer Science', 
      code: 'BSCS',
      description: 'Bachelor of Science in Computer Science',
      color: '#8b5cf6',
      icon: Users
    },
    { 
      id: 'bshm', 
      name: 'Hospitality Management', 
      code: 'BSHM',
      description: 'Bachelor of Science in Hospitality Management',
      color: '#f59e0b',
      icon: Users
    },
    { 
      id: 'bstm', 
      name: 'Tourism Management', 
      code: 'BSTM',
      description: 'Bachelor of Science in Tourism Management',
      color: '#ef4444',
      icon: Users
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

    //Fetch students based on selected course
  const fetchStudentsByCourse = async (courseCode) => {
    setIsLoading(true);
    try {
      let url = "https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood";
      
      //If not fetching all students, add course filter to API call
      if (courseCode !== 'ALL') {
        url += `?program=${courseCode}`;
      }
      
      const response = await axios.get(url);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      //You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  //Handle course selection
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSearchTerm(""); // Clear search when switching courses
    fetchStudentsByCourse(course.code);
  };

  //Handle back to course selection
  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
    setStudents([]);
    setSearchTerm("");
  };

  // Filter students by search term
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.studentno.toLowerCase().includes(searchLower) ||
      student.program.toLowerCase().includes(searchLower) ||
      student.section.toLowerCase().includes(searchLower) ||
      (student.lastMood && student.lastMood.toLowerCase().includes(searchLower)) ||
      student.id.toString().includes(searchLower)
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
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px -8px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
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
          <button className="filter-button">
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
            <div style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #0477BF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <p>Loading students...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
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
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="student-name">{student.name}</div>
                          <div className="student-status">{student.status}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{student.studentno}</td>
                    <td className="table-cell">
                      {student.program} - {student.section}
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
                        <button className="action-button action-view">
                          <Eye size={16} />
                        </button>
                        <button className="action-button action-edit">
                          <Edit size={16} />
                        </button>
                        <button className="action-button action-delete">
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
                        {searchTerm ? `No students found matching "${searchTerm}"` : `No ${selectedCourse?.code} students found.`}
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

  //Render based on whether a course is selected
  return selectedCourse ? <StudentsTableView /> : <CourseSelectionView />;
};

  export default StudentsListView;