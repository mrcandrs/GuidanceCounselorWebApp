import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Calendar, ChevronDown, Search, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import '../styles/Dashboard.css';
import axios from "axios";

// Mood colors for charts (unchanged)
const colorForMood = (mood) => {
  switch (mood) {
      case "MILD": return "#34C759";
      case "MODERATE": return "#009951";
      case "HIGH": return "#1B5E20";
      case "N/A": return "#64748b";
      default: return "#999";
    }
  };

// Badge class to match StudentsListView badges
const badgeClassForMood = (mood) => {
  switch (mood) {
    case 'MILD': return 'mood-badge mood-mild';
    case 'MODERATE': return 'mood-badge mood-moderate';
    case 'HIGH': return 'mood-badge mood-high';
    default: return 'mood-badge mood-neutral';
  }
};

  //Chart component for mood trends
  const MoodTrendChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '260px', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mild" stroke={colorForMood("MILD")} />
          <Line type="monotone" dataKey="moderate" stroke={colorForMood("MODERATE")} />
          <Line type="monotone" dataKey="high" stroke={colorForMood("HIGH")} />
          <Line type="monotone" dataKey="na" stroke={colorForMood("N/A")} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    );
  };

  // Monthly Reports Chart Component with enhanced tooltip
  const MonthlyReportsChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const weekData = data.find(item => item.week === label);
        return (
          <div style={{
            background: 'white',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>{label}</p>
            {weekData && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                {weekData.weekStart} - {weekData.weekEnd}
              </p>
            )}
            {payload.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  borderRadius: '2px'
                }} />
                <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
            {weekData && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                Total: {weekData.totalEntries} entries
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="week" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="mild" fill={colorForMood("MILD")} name="Mild" />
            <Bar dataKey="moderate" fill={colorForMood("MODERATE")} name="Moderate" />
            <Bar dataKey="high" fill={colorForMood("HIGH")} name="High" />
            <Bar dataKey="na" fill={colorForMood("N/A")} name="N/A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

const MoodInsightsView = () => {
  const [distribution, setDistribution] = useState([]);
  const [trends, setTrends] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  // Students with mood (for search and mood drilldown)
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Generate months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [distRes, trendsRes] = await Promise.all([
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/distribution`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/daily-trends`)
        ]);

        setDistribution(distRes.data || []);
        setTrends(trendsRes.data || []);
        
        // Fetch monthly reports for current month/year
        await fetchMonthlyReports(selectedMonth, selectedYear);
      } catch (err) {
        console.error("Error fetching mood insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Fetch monthly reports when month/year changes
  useEffect(() => {
    if (!loading) {
      fetchMonthlyReports(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReports = async (month, year) => {
    try {
      setLoading(true);
      
      // Convert JavaScript month (0-based) to API month (1-based)
      const apiMonth = month + 1;
      
      const response = await axios.get(
        `https://guidanceofficeapi-production.up.railway.app/api/moodtracker/monthly-reports?month=${apiMonth}&year=${year}`
      );
      
      setMonthlyReports(response.data || []);
    } catch (err) {
      console.error("Error fetching monthly reports:", err);
      // Set empty data on error
      setMonthlyReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students with latest mood (cached)
  const ensureStudentsLoaded = async () => {
    if (students.length > 0 || studentsLoading) return;
    try {
      setStudentsLoading(true);
      const res = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/student/students-with-mood',
        { headers: { 'Content-Type': 'application/json' } }
      );
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error loading students-with-mood:', e);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Search by student number
  const handleSearch = async () => {
    const term = (studentSearch || '').trim();
    if (!term) {
      setSearchResults([]);
      return;
    }
    await ensureStudentsLoaded();
    const q = term.toLowerCase();
    const results = students.filter(s => (s.studentno || '').toLowerCase().includes(q));
    setSearchResults(results);
  };

  const openMoodModal = async (mood) => {
    setSelectedMood(mood);
    await ensureStudentsLoaded();
    setShowMoodModal(true);
  };

  // Calculate current mood distribution from students data
  const currentMoodDistribution = useMemo(() => {
    if (students.length === 0) return [];
    
    const moodCounts = students.reduce((acc, student) => {
      const mood = student.lastMood || 'N/A';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        color: colorForMood(mood)
      }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  // Use current mood distribution instead of API distribution
  const moodData = currentMoodDistribution;

  // Calculate monthly statistics
  const monthlyStats = monthlyReports.reduce((acc, week) => {
    acc.total += week.mild + week.moderate + week.high + week.na;
    acc.mild += week.mild;
    acc.moderate += week.moderate;
    acc.high += week.high;
    acc.na += week.na;
    return acc;
  }, { total: 0, mild: 0, moderate: 0, high: 0, na: 0 });

  return (
    <div className="page-container" style={{ width: '100%', minWidth: 0, paddingBottom: '100px' }}>
      <h2 className="page-title">Student Mood Insights</h2>

      {/* Search Student by Student Number - Moved above cards */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Search Student by Student Number</h3>
        <div className="search-input-container" style={{ maxWidth: '420px' }}>
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Enter student number…"
            className="search-input"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          {studentSearch && (
            <button className="search-clear" onClick={() => { setStudentSearch(''); setSearchResults([]); }}>
              <X size={16} />
            </button>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="filter-button" onClick={handleSearch} disabled={studentsLoading}>
            {studentsLoading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, color: '#6b7280', fontSize: 14 }}>
              Showing {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Student</th>
                    <th className="table-header-cell">Student No.</th>
                    <th className="table-header-cell">Program and Year</th>
                    <th className="table-header-cell">Last Mood Level</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((s, i) => (
                    <tr key={`${s.id || i}`} className="table-row">
                      <td className="table-cell">{s.name || 'N/A'}</td>
                      <td className="table-cell">{s.studentno || 'N/A'}</td>
                      <td className="table-cell">{s.program || 'N/A'} - {s.section || 'N/A'}</td>
                      <td className="table-cell"><span className={badgeClassForMood(s.lastMood)}>{s.lastMood || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="cards-row">
        {/* Overall Mood Distribution */}
        <div className="card" style={{ minWidth: 0 }}>
          <h3 className="card-title">Overall Mood Distribution</h3>

          {loading ? (
            <p>Loading...</p>
          ) : moodData.length === 0 ? (
            <p>No data</p>
          ) : (
            <div>
          {moodData.map((m, index) => (
            <button
              key={index}
              className="mood-item"
              onClick={() => openMoodModal(m.mood)}
              style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                padding: '8px 0',
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span className={badgeClassForMood(m.mood)}>{m.mood}</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{m.count} students</span>
            </button>
          ))}
            </div>
          )}
        </div>

        {/* Weekly/Daily Trends (chart) */}
        <div className="card weekly-trends-card" style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3 className="card-title">Weekly Trends</h3>
          {loading ? (
            <p>Loading chart...</p>
          ) : trends.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={48} className="empty-icon" />
              <p>No trend data yet</p>
            </div>
          ) : (
            <MoodTrendChart data={trends} />
          )}
        </div>

        {/* Monthly Reports with Month Selection */}
        <div className="card" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Monthly Reports</h3>
            
            {/* Month/Year Selector */}
            <div style={{ position: 'relative' }}>
              <button 
                className="filter-button"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}
              >
                <Calendar size={16} />
                <span>{months[selectedMonth]} {selectedYear}</span>
                <ChevronDown size={16} />
              </button>
              
              {showMonthDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 10,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {years.map(year => (
                    <div key={year}>
                      <div style={{ padding: '8px 16px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                        {year}
                      </div>
                      {months.map((month, index) => (
                        <button
                          key={`${year}-${index}`}
                          onClick={() => {
                            setSelectedMonth(index);
                            setSelectedYear(year);
                            setShowMonthDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 16px',
                            border: 'none',
                            background: selectedMonth === index && selectedYear === year ? '#dbeafe' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <p>Loading reports...</p>
          ) : monthlyReports.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} className="empty-icon" />
              <p>No mood data available for {months[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <div>
              {/* Monthly Statistics Summary */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                  {months[selectedMonth]} {selectedYear} Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <span style={{ fontWeight: '500' }}>Total Reports:</span> {monthlyStats.total}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500', color: colorForMood("HIGH") }}>High:</span> {monthlyStats.high}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500', color: colorForMood("MODERATE") }}>Moderate:</span> {monthlyStats.moderate}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500', color: colorForMood("MILD") }}>Mild:</span> {monthlyStats.mild}
                  </div>
                </div>
              </div>

              {/* Monthly Chart */}
              <MonthlyReportsChart data={monthlyReports} />
            </div>
          )}
        </div>
      </div>

      {/* Additional spacing to ensure scrollable content */}
      <div style={{ height: '200px', marginTop: '24px' }}>
        <div className="card">
          <h3 className="card-title">Additional Information</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            This section provides additional space to demonstrate page-level scrolling functionality. 
            The page should now scroll vertically when content exceeds the viewport height.
          </p>
        </div>
      </div>

      {/* Mood Drilldown Modal */}
      {showMoodModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 620, maxHeight: '80vh', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Students with mood: {selectedMood}</h3>
              <button className="filter-button" onClick={() => setShowMoodModal(false)}>
                <X size={16} />
                Close
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {studentsLoading ? (
                <div style={{ padding: 20 }}>Loading students…</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Student</th>
                        <th className="table-header-cell">Student No.</th>
                        <th className="table-header-cell">Program and Year</th>
                        <th className="table-header-cell">Current Mood</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => (s.lastMood || '').toUpperCase() === (selectedMood || '').toUpperCase())
                        .map((s, i) => (
                          <tr key={`${s.id || i}`} className="table-row">
                            <td className="table-cell">{s.name || 'N/A'}</td>
                            <td className="table-cell">{s.studentno || 'N/A'}</td>
                            <td className="table-cell">{s.program || 'N/A'} - {s.section || 'N/A'}</td>
                            <td className="table-cell"><span className={badgeClassForMood(s.lastMood)}>{s.lastMood || 'N/A'}</span></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodInsightsView;