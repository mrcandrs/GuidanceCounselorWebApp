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
  actorType: '',
  outcome: '',
  channel: '',
  from: '',
  to: '',
  search: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reportTab, setReportTab] = useState('appointments'); // 'appointments' | 'referrals' | 'notes' | 'forms' | 'moods'

  // Fetch history data
const fetchHistory = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const params = {
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      actorType: filters.actorType || undefined,
      outcome: filters.outcome || undefined,
      channel: filters.channel || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page,
      pageSize
    };
    const res = await axios.get('/api/history', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    setHistoryData(res.data.items || []);
    setTotalItems(res.data.totalItems || 0);
    setTotalPages(res.data.totalPages || 1);
  } catch (e) {
    console.error('history fetch failed', e?.response?.data || e.message);
  } finally {
    setLoading(false);
  }
};

  // Fetch reports data
  const fetchReports = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('authToken');
    const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';
    const common = { headers: { Authorization: `Bearer ${token}` }, params: { from: filters.from, to: filters.to } };

    if (reportTab === 'appointments') {
      const { data } = await axios.get(`${API_BASE}/api/reports/appointments`, common);
      setReportsData({ type: 'appointments', ...data });
    } else if (reportTab === 'referrals') {
      const { data } = await axios.get(`${API_BASE}/api/reports/referrals`, common);
      setReportsData({ type: 'referrals', ...data });
    } else if (reportTab === 'notes') {
      const { data } = await axios.get(`${API_BASE}/api/reports/notes`, common);
      setReportsData({ type: 'notes', ...data });
    } else if (reportTab === 'forms') {
      const { data } = await axios.get(`${API_BASE}/api/reports/forms-completion`, common);
      setReportsData({ type: 'forms', ...data });
    } else if (reportTab === 'moods') {
      const [distribution, daily, monthly] = await Promise.all([
        axios.get(`${API_BASE}/api/moodtracker/distribution`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/moodtracker/daily-trends`, { headers: { Authorization: `Bearer ${token}` } }),
        // month/year optional; you can compute current month/year or add UI controls later
        axios.get(`${API_BASE}/api/moodtracker/monthly-reports`, { headers: { Authorization: `Bearer ${token}` }, params: { month: new Date().getMonth()+1, year: new Date().getFullYear() } }),
      ]);
      setReportsData({ type: 'moods', distribution: distribution.data, daily: daily.data, monthly: monthly.data });
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
  } finally {
    setLoading(false);
  }
};

  // 3) Trigger refetch when filters or pagination change (History tab active)
useEffect(() => {
  if (activeTab !== 'history') return;
  setPage(1); // reset page when filters change
}, [filters, activeTab]);

useEffect(() => {
  if (activeTab !== 'history') return;
  fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, page, pageSize]);

useEffect(() => {
  if (activeTab !== 'reports') return;
  fetchReports();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, reportTab, filters.from, filters.to]);

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


              <select value={filters.actorType} onChange={e => setFilters(f => ({ ...f, actorType: e.target.value }))}>
                <option value="">Actor Type (all)</option>
                <option value="counselor">Counselor</option>
                <option value="student">Student</option>
                <option value="system">System</option>
                <option value="admin">Admin</option>
              </select>

              <select value={filters.outcome} onChange={e => setFilters(f => ({ ...f, outcome: e.target.value }))}>
                <option value="">Outcome (all)</option>
                <option value="Success">Success</option>
                <option value="Failure">Failure</option>
              </select>

              <select value={filters.channel} onChange={e => setFilters(f => ({ ...f, channel: e.target.value }))}>
                <option value="">Channel (all)</option>
                <option value="WebApp">WebApp</option>
                <option value="Android">Android</option>
                <option value="API">API</option>
              </select>

              <input
                type="text"
                placeholder="Search summary/details"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />


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


            {/* Pagination (no. 5) goes here */}
            <div className="history-pagination">
              <div>Page {page} of {totalPages} • {totalItems} items</div>
              <div className="pager">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {/* Report sub-tabs go here */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['appointments','referrals','notes','forms'].map(rt => (
                <button
                  key={rt}
                  className={`filter-button ${reportTab === rt ? 'active' : ''}`}
                  onClick={() => setReportTab(rt)}
                  style={{ 
                    background: reportTab === rt ? '#0477BF' : 'white', 
                    color: reportTab === rt ? 'white' : '#374151',
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  {rt.charAt(0).toUpperCase() + rt.slice(1)}
                </button>
              ))}
            </div>

            {/* Existing date inputs stay below */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '24px',
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
              }}
              >
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
) : !reportsData ? (
  <div className="empty-state">
    <TrendingUp size={48} className="empty-icon" />
    <p>No reports data available.</p>
  </div>
) : (
  <>
    {/* Appointments (keep your existing UI) */}
    {reportsData?.type === 'appointments' && (
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
    )}

    {/* Referrals */}
    {reportsData?.type === 'referrals' && (
      <div className="cards-row">
        <div className="kpi-card">
          <h3 className="card-title">Total Referrals</h3>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.total}</div>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">By Priority</h3>
          {reportsData.byPriority?.map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>{x.priority}</span><strong>{x.count}</strong>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">By Category</h3>
          {reportsData.byCategory?.map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>{x.category}</span><strong>{x.count}</strong>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Notes */}
    {reportsData?.type === 'notes' && (
      <div className="cards-row">
        <div className="kpi-card">
          <h3 className="card-title">Total Notes</h3>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.total}</div>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">By Nature</h3>
          {reportsData.byNature?.map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>{x.type}</span><strong>{x.count}</strong>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Forms */}
    {reportsData?.type === 'forms' && (
      <div className="cards-row">
        <div className="kpi-card"><h3 className="card-title">Total Students</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.totalStudents}</div></div>
        <div className="kpi-card"><h3 className="card-title">Consent Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.consentForms}</div><div>{reportsData.consentCompletionRate.toFixed(1)}%</div></div>
        <div className="kpi-card"><h3 className="card-title">Inventory Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.inventoryForms}</div><div>{reportsData.inventoryCompletionRate.toFixed(1)}%</div></div>
        <div className="kpi-card"><h3 className="card-title">Career Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.careerForms}</div><div>{reportsData.careerCompletionRate.toFixed(1)}%</div></div>
      </div>
    )}

    {/* Moods
    {reportsData?.type === 'moods' && (
      <div>
        <div className="cards-row">
          <div className="card">
            <h3 className="card-title">Distribution</h3>
            {reportsData.distribution?.map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>{x.mood}</span><strong>{x.count}</strong>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="card-title">Last 7 Days</h3>
            {reportsData.daily?.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>{d.date}</span>
                <span>Mild {d.mild} • Moderate {d.moderate} • High {d.high}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">Monthly (by week)</h3>
          {reportsData.monthly?.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{w.week} ({w.weekStart}–{w.weekEnd})</span>
              <span>Mild {w.mild} • Moderate {w.moderate} • High {w.high} • Total {w.totalEntries}</span>
            </div>
          ))}
        </div>
      </div>
    )}*/}
  </>
)}
      </div>
        )}
    </div>
  </div>
  );
};

export default HistoryReportsView;