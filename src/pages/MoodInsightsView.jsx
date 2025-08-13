import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const MoodInsightsView = () => {
  const [distribution, setDistribution] = useState([]);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [distRes, trendsRes, alertsRes] = await Promise.all([
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/distribution`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/daily-trends`),
          axios.get(`https://guidanceofficeapi-production.up.railway.app/api/moodtracker/alerts`)
        ]);

        setDistribution(distRes.data || []);
        setTrends(trendsRes.data || []);
        setAlerts(alertsRes.data || []);
      } catch (err) {
        console.error("Error fetching mood insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Map distribution into displayable array with colors
  const moodData = distribution.map(item => ({
    mood: item.mood,
    count: item.count,
    color: colorForMood(item.mood)
  }));

  return (
    <div className="page-container" style={{ width: '100%', minWidth: 0 }}>
      <h2 className="page-title">Student Mood Insights</h2>

      <div className="grid-cols-3" style={{ width: '100%', minWidth: 0 }}>
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
        <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
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

        {/* Alerts */}
        <div className="card" style={{ minWidth: 0 }}>
          <h3 className="card-title">Alerts</h3>
          {loading ? (
            <p>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p>No alerts at the moment</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className={`alert-card alert-${a.level}`} style={{marginBottom:12, padding:12, borderRadius:8, background: a.level === 'high' ? '#FEE2E2' : a.level === 'moderate' ? '#FEF3C7' : '#EFF6FF' }}>
                <p style={{margin:0, color: a.level === 'high' ? '#991B1B' : a.level === 'moderate' ? '#92400E' : '#1E3A8A'}}>{a.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodInsightsView;