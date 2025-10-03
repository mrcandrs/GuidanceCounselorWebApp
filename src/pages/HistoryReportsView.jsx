import React, { useState, useEffect } from 'react';
import { Filter, Download, Calendar, TrendingUp, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/Dashboard.css';

const HistoryReportsView = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [historyData, setHistoryData] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    from: '',
    to: '',
    page: 1,
    pageSize: 20
  });

  // Fetch history data
  const fetchHistory = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const params = new URLSearchParams();
        
        if (filters.entityType) params.append('entityType', filters.entityType);
        if (filters.action) params.append('action', filters.action);
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

        // Change this URL to match your new controller:
        const response = await axios.get(`https://guidanceofficeapi-production.up.railway.app/api/history?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setHistoryData(response.data.items || []);
        // Handle pagination if you want
    } catch (error) {
        console.error('Error fetching history:', error);
        alert('Failed to load history');
    } finally {
        setLoading(false);
    }
};

  // Fetch reports data
  const fetchReports = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        
        const [appointmentsRes, referralsRes, notesRes, formsRes] = await Promise.all([
            axios.get('https://guidanceofficeapi-production.up.railway.app/api/reports/appointments', {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: filters.from, to: filters.to }
            }),
            axios.get('https://guidanceofficeapi-production.up.railway.app/api/reports/referrals', {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: filters.from, to: filters.to }
            }),
            axios.get('https://guidanceofficeapi-production.up.railway.app/api/reports/notes', {
                headers: { Authorization: `Bearer ${token}` },
                params: { from: filters.from, to: filters.to }
            }),
            axios.get('https://guidanceofficeapi-production.up.railway.app/api/reports/forms-completion', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        setReportsData({
            appointments: appointmentsRes.data,
            referrals: referralsRes.data,
            notes: notesRes.data,
            forms: formsRes.data
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    } else {
      fetchReports();
    }
  }, [activeTab, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const exportToCSV = () => {
    if (activeTab === 'history') {
      const csvContent = [
        ['Date', 'Entity', 'Action', 'Actor', 'Details'].join(','),
        ...historyData.map(item => [
          new Date(item.createdAt).toLocaleString(),
          `${item.entityType}${item.entityId ? ` #${item.entityId}` : ''}`,
          item.action,
          `${item.actorType}${item.actorId ? ` #${item.actorId}` : ''}`,
          `"${item.detailsJson || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `history_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'appointment': return <Calendar size={16} />;
      case 'referral': return <Users size={16} />;
      case 'note': return <FileText size={16} />;
      case 'consultation': return <FileText size={16} />;
      case 'endorsement': return <FileText size={16} />;
      case 'timeslot': return <Clock size={16} />;
      case 'guidancepass': return <CheckCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created': return <CheckCircle size={16} className="text-green-500" />;
      case 'updated': return <AlertCircle size={16} className="text-blue-500" />;
      case 'deleted': return <XCircle size={16} className="text-red-500" />;
      case 'approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="page-title">History & Reports</h2>
          <div className="tabs" style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`filter-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ 
                background: activeTab === 'history' ? '#0477BF' : 'white',
                color: activeTab === 'history' ? 'white' : '#374151',
                position: 'relative',
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              <Clock size={16} />
              History
            </button>
            <button 
              className={`filter-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
              style={{ 
                background: activeTab === 'reports' ? '#0477BF' : 'white',
                color: activeTab === 'reports' ? 'white' : '#374151',
                position: 'relative',
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              <TrendingUp size={16} />
              Reports
            </button>
          </div>
        </div>

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <select 
                value={filters.entityType} 
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="filter-select"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Entities</option>
                <option value="appointment">Appointments</option>
                <option value="referral">Referrals</option>
                <option value="note">Notes</option>
                <option value="consultation">Consultations</option>
                <option value="endorsement">Endorsements</option>
                <option value="timeslot">Time Slots</option>
                <option value="guidancepass">Guidance Passes</option>
              </select>

              <select 
                value={filters.action} 
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="filter-select"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="activated">Activated</option>
                <option value="deactivated">Deactivated</option>
              </select>

              <input 
                type="date" 
                value={filters.from} 
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="filter-input"
                placeholder="From Date"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              />

              <input 
                type="date" 
                value={filters.to} 
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="filter-input"
                placeholder="To Date"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              />

              <button 
                onClick={exportToCSV} 
                className="primary-button"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className="table-container">
              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner"></div>
                  <p>Loading history...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="empty-state">
                  <Clock size={48} className="empty-icon" />
                  <p>No history records found. Try adjusting your filters.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Entity</th>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} className="text-gray-400" />
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getEntityIcon(item.entityType)}
                            <span style={{ fontWeight: '500' }}>
                              {item.entityType}
                              {item.entityId && ` #${item.entityId}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getActionIcon(item.action)}
                            <span style={{ textTransform: 'capitalize' }}>{item.action}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            background: '#f3f4f6', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {item.actorType}
                            {item.actorId && ` #${item.actorId}`}
                          </span>
                        </td>
                        <td>
                          {item.detailsJson && (
                            <details style={{ cursor: 'pointer' }}>
                              <summary style={{ color: '#0477BF', fontSize: '12px' }}>View Details</summary>
                              <pre style={{ 
                                background: '#f8f9fa', 
                                padding: '8px', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                marginTop: '8px',
                                maxWidth: '200px',
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {JSON.stringify(JSON.parse(item.detailsJson), null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <input 
                type="date" 
                value={filters.from} 
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="filter-input"
                placeholder="From Date"
              />
              <input 
                type="date" 
                value={filters.to} 
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="filter-input"
                placeholder="To Date"
              />
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
              </div>
            ) : reportsData ? (
              <div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px', 
                  marginBottom: '32px' 
                }}>
                  <div className="kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Calendar size={20} className="text-blue-500" />
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Appointments</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                      {reportsData.total}
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Clock size={20} className="text-yellow-500" />
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Pending</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {reportsData.pending}
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <CheckCircle size={20} className="text-green-500" />
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Approved</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                      {reportsData.approved}
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <XCircle size={20} className="text-red-500" />
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Rejected</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                      {reportsData.rejected}
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <CheckCircle size={20} className="text-green-600" />
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Completed</h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                      {reportsData.completed}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Appointments by Day</h3>
                  {reportsData.byDay && reportsData.byDay.length > 0 ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'end', 
                      gap: '12px', 
                      height: '200px', 
                      padding: '20px 0',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {reportsData.byDay.map((day, index) => {
                        const maxCount = Math.max(...reportsData.byDay.map(d => d.count));
                        const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                        
                        return (
                          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <div style={{ 
                              width: '100%', 
                              background: '#0477BF', 
                              borderRadius: '4px 4px 0 0', 
                              minHeight: '4px',
                              height: `${height}%`,
                              transition: 'all 0.3s',
                              cursor: 'pointer'
                            }} title={`${day.count} appointments on ${new Date(day.date).toLocaleDateString()}`} />
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                              {new Date(day.date).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                              {day.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <TrendingUp size={48} className="empty-icon" />
                      <p>No appointment data available for the selected period.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp size={48} className="empty-icon" />
                <p>No reports data available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryReportsView;