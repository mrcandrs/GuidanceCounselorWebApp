import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import '../styles/Dashboard.css';
import axios from "axios";

//Mood colors
const colorForMood = (mood) => {
  switch (mood) {
      case "MILD": return "#34C759";
      case "MODERATE": return "#009951";
      case "HIGH": return "#1B5E20";
      case "N/A": return "#64748b";
      default: return "#999";
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

  // Monthly Reports Chart Component
  const MonthlyReportsChart = ({ data }) => {
    return (
      <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="week" />
            <YAxis allowDecimals={false} />
            <Tooltip />
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

  //Generate months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  //Generate years (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [distRes, trendsRes, alertsRes] = await Promise.all([
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/distribution`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/daily-trends`)
        ]);

        setDistribution(distRes.data || []);
        setTrends(trendsRes.data || []);

        //Generate mock monthly data for now - replace with actual API call
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
      // This would be replaced with actual API call
      // For now, generating mock data based on selected month/year
      const monthName = months[month];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      
      const mockData = [];
      for (let week = 1; week <= weeksInMonth; week++) {
        mockData.push({
          week: `Week ${week}`,
          mild: Math.floor(Math.random() * 20) + 10,
          moderate: Math.floor(Math.random() * 15) + 5,
          high: Math.floor(Math.random() * 8) + 2,
          na: Math.floor(Math.random() * 12) + 3
        });
      }
      
      setMonthlyReports(mockData);
    } catch (err) {
      console.error("Error fetching monthly reports:", err);
    }
  };

  // Map distribution into displayable array with colors
  const moodData = distribution.map(item => ({
    mood: item.mood,
    count: item.count,
    color: colorForMood(item.mood)
  }));

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
    <div className="page-container" style={{ width: '100%', minWidth: 0 }}>
      <h2 className="page-title">Student Mood Insights</h2>

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
                <div key={index} className="mood-item" style={{display:'flex', justifyContent:'space-between', padding: '8px 0'}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="mood-dot" style={{width:12, height:12, borderRadius:6, backgroundColor:m.color}} />
                    <span style={{fontSize:14, fontWeight:500}}>{m.mood}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{m.count} students</span>
                </div>
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
              <p>No data available for {months[selectedMonth]} {selectedYear}</p>
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
    </div>
  );
};

export default MoodInsightsView;