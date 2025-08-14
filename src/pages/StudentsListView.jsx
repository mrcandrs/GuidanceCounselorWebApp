import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import '../styles/Dashboard.css'; // Import the shared CSS
import axios from "axios";

//Students List View
  const StudentsListView = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

    //Fetching student data from API
    useEffect(() => {
      axios
        .get("https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood")
        .then((response) => {
          setStudents(response.data);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
      }, []);

    //Filter students by search term
    const filteredStudents = students.filter((student) => {
  const searchLower = searchTerm.toLowerCase();
  
  return (
    //Search by name
    student.name.toLowerCase().includes(searchLower) ||
    
    //Search by student number
    student.studentno.toLowerCase().includes(searchLower) ||
    
    //Search by program
    student.program.toLowerCase().includes(searchLower) ||
    
    //Search by section
    student.section.toLowerCase().includes(searchLower) ||
    
    //Search by last mood
    (student.lastMood && student.lastMood.toLowerCase().includes(searchLower)) ||
    
    // Search by ID (convert to string first)
    student.id.toString().includes(searchLower)
    );
  });

    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">Students List</h2>
      </div>

      <div className="card">
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search students..."
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  export default StudentsListView;