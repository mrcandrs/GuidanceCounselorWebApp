import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, Eye, Trash2, Users, ArrowLeft, SortAsc, ChevronDown, X } from 'lucide-react';
import StudentDetailsView from './StudentDetailsView';
import '../styles/Dashboard.css';
import axios from "axios";

const CourseSelectionView = ({ courses, handleCourseSelect, loading }) => (
  <div className="page-container">
    <div className="page-header">
      <h2 className="page-title">Students List</h2>
      <button 
        className="primary-button" 
        onClick={fetchCourses}
        disabled={coursesLoading}
      >
      {coursesLoading ? 'Loading...' : 'Refresh Courses'}
      </button>
    </div>

    <div className="card student-scrollable-form">
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

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0',
          color: '#6b7280'
        }}>
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : (
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
      )}
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
  setErroredAvatars,
  showFilters, 
  setShowFilters, 
  filters, 
  setFilters, 
  sortConfig, 
  setSortConfig, 
  hasActiveFilters
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
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

  // Sort options for the dropdown
  const sortOptions = [
    { key: 'name', label: 'Name', direction: 'asc' },
    { key: 'name', label: 'Name', direction: 'desc' },
    { key: 'studentno', label: 'Student No.', direction: 'asc' },
    { key: 'studentno', label: 'Student No.', direction: 'desc' },
    { key: 'program', label: 'Program', direction: 'asc' },
    { key: 'program', label: 'Program', direction: 'desc' },
    { key: 'mood', label: 'Mood', direction: 'asc' },
    { key: 'mood', label: 'Mood', direction: 'desc' },
    { key: 'registeredAt', label: 'Registered', direction: 'desc' },
    { key: 'registeredAt', label: 'Registered', direction: 'asc' },
    { key: 'lastLogin', label: 'Last Login', direction: 'desc' },
    { key: 'lastLogin', label: 'Last Login', direction: 'asc' }
  ];

  // Handle sorting
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setShowSortMenu(false);
  };

   // Get current sort display text
  const getCurrentSortText = () => {
    const currentSort = sortOptions.find(opt => opt.key === sortConfig.key && opt.direction === sortConfig.direction);
    if (!currentSort) return 'Sort';
    
    const directionText = sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A';
    if (sortConfig.key === 'registeredAt') {
      return `${currentSort.label} (${sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'})`;
    }
    if (sortConfig.key === 'lastLogin') {
      return `${currentSort.label} (${sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'})`;
    }
    return `${currentSort.label} (${directionText})`;
  };

  return (
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

      <div className="card student-scrollable-form">
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
            {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="search-clear"
                >
                  <X size={16} />
                </button>
              )}
          </div>

          <div style={{ display:'flex', gap:8 }}>
            {/* Custom Sort Dropdown */}
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
                      style={{ position: 'fixed', top: sortMenuPos.top, left: sortMenuPos.left, width: sortMenuPos.width }}
                  >
                    <div className="sort-dropdown-header">
                      <span>Sort by</span>
                      <span className="current-sort">{getCurrentSortText()}</span>
                    </div>
                    {sortOptions.map((option, index) => (
                      <button
                        key={`${option.key}-${option.direction}-${index}`}
                        className={`sort-option ${sortConfig.key === option.key && sortConfig.direction === option.direction ? 'sort-option-active' : ''}`}
                        onClick={() => handleSort(option.key, option.direction)}
                        style={{
                          position: 'relative',
                          zIndex: 9999,
                          pointerEvents: 'auto',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{option.label}</span>
                        <span className="sort-direction">
                          {option.key === 'registeredAt' || option.key === 'lastLogin'
                            ? (option.direction === 'asc' ? 'Oldest First' : 'Newest First')
                            : (option.direction === 'asc' ? 'A-Z' : 'Z-A')
                          }
                        </span>
                      </button>
                    ))}
                    </div>
                , document.body)}
              </div>

        <button
          className={`filter-button ${showFilters ? 'active' : ''}`}
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter"
        >
          <Filter size={20} />
          Filter {hasActiveFilters ? '•' : ''}
        </button>
      </div>
    </div>

    {showFilters && (
      <div className="filter-panel" style={{ marginTop: -8, marginBottom: 8 }}>
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Mood</label>
            <select
              className="filter-input"
              value={filters.mood}
              onChange={e => setFilters(f => ({ ...f, mood: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="MILD">Mild</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-input"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Program</label>
            <input
              className="filter-input"
              placeholder="e.g., BSIT"
              value={filters.program}
              onChange={e => setFilters(f => ({ ...f, program: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Section</label>
            <input
              className="filter-input"
              placeholder="e.g., 4B"
              value={filters.section}
              onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Registered From</label>
            <input
              type="date"
              className="filter-input"
              value={filters.regFrom}
              onChange={e => setFilters(f => ({ ...f, regFrom: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Registered To</label>
            <input
              type="date"
              className="filter-input"
              value={filters.regTo}
              onChange={e => setFilters(f => ({ ...f, regTo: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Last Login From</label>
            <input
              type="date"
              className="filter-input"
              value={filters.loginFrom}
              onChange={e => setFilters(f => ({ ...f, loginFrom: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Last Login To</label>
            <input
              type="date"
              className="filter-input"
              value={filters.loginTo}
              onChange={e => setFilters(f => ({ ...f, loginTo: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button
            className="filter-button"
            type="button"
            onClick={() => setFilters({
              mood:'all', status:'all', program:'', section:'',
              regFrom:'', regTo:'', loginFrom:'', loginTo:''
            })}
          >
            Reset
          </button>
          <div style={{ color:'#6b7280', marginLeft:'auto' }}>
            {filteredStudents.length} of {displayedStudents.length} match
          </div>
        </div>
      </div>
    )}

      
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
                  <tr 
                    key={student.id} 
                    className="table-row clickable-row"
                    onClick={() => handleView(student.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleView(student.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${student.name || 'student'}`}
                      title="View"
                      >
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
};

// Main StudentsListView component
const StudentsListView = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [erroredAvatars, setErroredAvatars] = useState({});
  // Dynamic course configuration - fetch from API
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Filter and sort state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mood: 'all',
    status: 'all',
    program: '',
    section: '',
    regFrom: '',
    regTo: '',
    loginFrom: '',
    loginTo: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  const hasActiveFilters = Object.entries(filters).some(([k, v]) =>
    ['mood','status'].includes(k) ? v !== 'all' : v
  );

  const filteredStudents = useMemo(() => {
    let list = [...displayedStudents];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s =>
        (s.name||'').toLowerCase().includes(q) ||
        (s.studentno||'').toLowerCase().includes(q) ||
        (s.program||'').toLowerCase().includes(q) ||
        (s.section||'').toLowerCase().includes(q) ||
        (s.lastMood||'').toLowerCase().includes(q) ||
        String(s.id||'').includes(q)
      );
    }
    if (filters.mood !== 'all') list = list.filter(s => (s.lastMood||'').toUpperCase() === filters.mood);
    if (filters.status !== 'all') list = list.filter(s => (s.status||'').toLowerCase() === filters.status.toLowerCase());
    if (filters.program) list = list.filter(s => (s.program||'').toLowerCase().includes(filters.program.toLowerCase()));
    if (filters.section) list = list.filter(s => (s.section||'').toLowerCase().includes(filters.section.toLowerCase()));
    const inRange = (d, from, to) => {
      if (!d) return false;
      const dt = new Date(d);
      if (from && dt < new Date(from)) return false;
      if (to && dt > new Date(to)) return false;
      return true;
    };
    if (filters.regFrom || filters.regTo) list = list.filter(s => inRange(s.dateregistered, filters.regFrom, filters.regTo));
    if (filters.loginFrom || filters.loginTo) list = list.filter(s => s.lastlogin ? inRange(s.lastlogin, filters.loginFrom, filters.loginTo) : false);

    const cmp = (a,b,dir) => dir==='asc' ? (a<b?-1:a>b?1:0) : (a>b?-1:a<b?1:0);
    list.sort((a,b) => {
      switch (sortConfig.key) {
        case 'name':         return cmp((a.name||'').toLowerCase(), (b.name||'').toLowerCase(), sortConfig.direction);
        case 'studentno':    return cmp((a.studentno||'').toLowerCase(), (b.studentno||'').toLowerCase(), sortConfig.direction);
        case 'program':      return cmp((a.program||'').toLowerCase(), (b.program||'').toLowerCase(), sortConfig.direction);
        case 'mood':         return cmp((a.lastMood||'').toLowerCase(), (b.lastMood||'').toLowerCase(), sortConfig.direction);
        case 'registeredAt': return cmp(new Date(a.dateregistered||0).getTime(), new Date(b.dateregistered||0).getTime(), sortConfig.direction);
        case 'lastLogin':    return cmp(new Date(a.lastlogin||0).getTime(), new Date(b.lastlogin||0).getTime(), sortConfig.direction);
        default:             return 0;
      }
    });
    return list;
  }, [displayedStudents, searchTerm, filters, sortConfig]);

  const handleView = (studentId) => {
    setViewingStudentId(studentId);
  };

  const handleBackFromDetails = () => {
    setViewingStudentId(null);
  };

    // Fetch courses from API
  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await axios.get(
        "https://guidanceofficeapi-production.up.railway.app/api/maintenance/dictionaries",
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;

      // Build courses array from API data
      const dynamicCourses = [
        { 
          id: 'all', 
          name: 'All Students', 
          code: 'ALL',
          description: 'View all registered students',
          color: '#0477BF',
          icon: Users,
          matchValues: ['ALL']
        }
      ];

      // Add programs from API
      if (data.programs && Array.isArray(data.programs)) {
        const colors = ['#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#84cc16', '#f97316', '#ec4899'];

        data.programs.forEach((program, index) => {
          dynamicCourses.push({
            id: program.code.toLowerCase(),
            name: program.name,
            code: program.code,
            description: program.name,
            color: colors[index % colors.length],
            icon: Users,
            matchValues: [
              program.code,
              program.name,
              program.name + ' (' + program.code + ')'
            ]
          });
        });
      }

      setCourses(dynamicCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback to default courses if API fails
      setCourses([
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
          matchValues: ['BSIT', 'Bachelor of Science in Information Technology', 'Information Technology']
        }
      ]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

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

  // Fixed handleDelete function - now properly scoped within the component
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
        }
      );
      
      console.log('Delete response:', response);
      
      if (response.status === 204 || response.status === 200) {
        // Refresh the students list
        await fetchAllStudents();
        // Re-filter the current course after refresh
        if (selectedCourse) {
          setTimeout(() => filterStudentsByCourse(selectedCourse, allStudents), 100);
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

  useEffect(() => {
    if (allStudents.length > 0 && selectedCourse) {
      filterStudentsByCourse(selectedCourse, allStudents);
    }
  }, [allStudents, selectedCourse]);

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
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      filters={filters}
      setFilters={setFilters}
      sortConfig={sortConfig}
      setSortConfig={setSortConfig}
      hasActiveFilters={hasActiveFilters}
    />
  ) : (
    <CourseSelectionView 
      courses={courses}
      handleCourseSelect={handleCourseSelect}
      loading={coursesLoading}
    />
  );
};

export default StudentsListView;