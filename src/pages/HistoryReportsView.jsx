import React, { useState, useEffect, useRef } from 'react';
import { Filter, Download, Calendar, TrendingUp, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Search, X, BarChart3, PieChart, LineChart, Activity, Target, Zap, Brain, Eye, Share2, Settings, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../styles/Dashboard.css';

const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';

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
  const [reportTab, setReportTab] = useState('appointments');
  const [showFilters, setShowFilters] = useState(false);
  
  // Enhanced analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [trends, setTrends] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('bar');
  const [exportFormat, setExportFormat] = useState('csv');

  // Ref for the filter panel to detect clicks outside
  const filterPanelRef = useRef(null);

  // Fetch history data
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = {
        entityType: filters.entityType || undefined,
        action: filters.action || undefined,
        actorType: filters.actorType || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        search: filters.search || undefined,
        page,
        pageSize
      };
      const res = await axios.get(`${API_BASE}/api/history`, { params, headers: { Authorization: `Bearer ${token}` } });
      setHistoryData(res.data.items || []);
      setTotalItems(res.data.totalItems || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.error('history fetch failed', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced analytics functions
  const fetchAdvancedAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      const params = { 
        from: filters.from, 
        to: filters.to,
        timeRange: selectedTimeRange 
      };

      const [analytics, insights, trends, performance] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/overview`, { headers, params }),
        axios.get(`${API_BASE}/api/analytics/insights`, { headers, params }),
        axios.get(`${API_BASE}/api/analytics/trends`, { headers, params }),
        axios.get(`${API_BASE}/api/analytics/performance`, { headers, params })
      ]);

      setAnalyticsData(analytics.data);
      setInsights(insights.data);
      setTrends(trends.data);
      setPerformanceMetrics(performance.data);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
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
          axios.get(`${API_BASE}/api/moodtracker/monthly-reports`, { headers: { Authorization: `Bearer ${token}` }, params: { month: new Date().getMonth()+1, year: new Date().getFullYear() } }),
        ]);
        setReportsData({ type: 'moods', distribution: distribution.data, daily: daily.data, monthly: monthly.data });
      } else if (reportTab === 'analytics') {
        await fetchAdvancedAnalytics();
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'history') return;
    fetchHistory();
  }, [
    activeTab,
    page,
    pageSize,
    filters.entityType,
    filters.action,
    filters.actorType,
    filters.from,
    filters.to,
    filters.search
  ]);

  useEffect(() => {
    if (activeTab !== 'reports') return;
    fetchReports();
  }, [activeTab, reportTab, filters.from, filters.to]);

  // Effect to handle clicks outside the filter panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Enhanced export functionality
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

  const exportToPDF = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE}/api/reports/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: activeTab,
          from: filters.from,
          to: filters.to,
          format: 'pdf'
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE}/api/reports/export/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: activeTab,
          from: filters.from,
          to: filters.to,
          format: 'excel'
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  const scheduleReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_BASE}/api/reports/schedule`, {
        reportType: activeTab,
        frequency: 'weekly',
        email: 'admin@example.com',
        format: exportFormat
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Report scheduled successfully!');
    } catch (error) {
      console.error('Schedule report failed:', error);
    }
  };

  const resetFilters = () => {
    setFilters({ entityType:'', action:'', actorType:'', outcome:'', channel:'', from:'', to:'', search:'' });
    setPage(1);
    setShowFilters(false); // Close filter panel on reset
  };

  const exportAllHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      let p = 1, all = [], totalPagesLocal = 1;
      do {
        const { data } = await axios.get(`${API_BASE}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            entityType: filters.entityType || undefined,
            action: filters.action || undefined,
            actorType: filters.actorType || undefined,
            from: filters.from || undefined,
            to: filters.to || undefined,
            search: filters.search || undefined,
            page: p,
            pageSize: 1000
          }
        });
        all = all.concat(data.items || []);
        totalPagesLocal = data.totalPages || 1;
        p += 1;
      } while (p <= totalPagesLocal);

      const csv = [
        ['Date','Entity','Action','Actor','Details'].join(','),
        ...all.map(item => [
          new Date(item.createdAt).toLocaleString(),
          `${item.entityType}${item.entityId ? ` #${item.entityId}` : ''}`,
          item.action,
          `${item.actorType}${item.actorId ? ` #${item.actorId}` : ''}`,
          `"${item.detailsJson || ''}"`
        ].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `history_all_${Date.now()}.csv`; a.click();
    } catch (e) {
      console.error('export all failed', e);
    }
  };

  const goToHistoryWith = (next) => {
    setFilters(f => ({ ...f, ...next }));
    setActiveTab('history');
    setPage(1);
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

  const activeFilterCount = [
  filters.entityType,
  filters.action,
  filters.actorType,
  filters.outcome,
  filters.channel,
  filters.from,
  filters.to,
  filters.search
].filter(value => value !== '' && value !== 'all' && value !== undefined).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Add this to see what's being counted
  console.log('All filter values:', filters);
  console.log('Active filter count:', activeFilterCount);

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
            {/* Fixed Filter Interface - All elements on same line */}
            <div className="history-toolbar" style={{ 
              marginBottom: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Left side: Search and Filter Button */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div className="search-input-container" style={{ maxWidth: '400px' }}>
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Search history records..."
                    className="search-input"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    style={{ paddingLeft: '48px'}}
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="search-clear"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {/* Filter button and dropdown wrapper */}
                <div style={{ position: 'relative' }} ref={filterPanelRef}>
                  <button
                    className={`filter-button ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    <Filter size={16} />
                    Filters {hasActiveFilters ? '•' : ''}
                  </button>

                  {/* Filter Panel Dropdown - Now absolutely positioned */}
                  {showFilters && (
                    <div className="filter-panel-dropdown">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {/* Entity Type Filter */}
                        <div className="filter-group">
                          <label className="filter-label">Record Type</label>
                          <select 
                            value={filters.entityType} 
                            onChange={(e) => handleFilterChange('entityType', e.target.value)}
                            className="filter-select"
                          >
                            <option value="">All Record Types</option>
                            <option value="appointment">📅 Appointments</option>
                            <option value="referral">👥 Referrals</option>
                            <option value="note">📝 Notes</option>
                            <option value="consultation">💬 Consultations</option>
                            <option value="endorsement">📋 Endorsements</option>
                            <option value="timeslot">⏰ Time Slots</option>
                            <option value="guidancepass">🎫 Guidance Passes</option>
                          </select>
                        </div>

                        {/* Action Filter */}
                        <div className="filter-group">
                          <label className="filter-label">Action Performed</label>
                          <select 
                            value={filters.action} 
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="filter-select"
                          >
                            <option value="">All Actions</option>
                            <option value="created">✅ Created</option>
                            <option value="updated">✏️ Updated</option>
                            <option value="deleted">🗑️ Deleted</option>
                            <option value="approved">👍 Approved</option>
                            <option value="rejected">👎 Rejected</option>
                            <option value="activated">🟢 Activated</option>
                            <option value="deactivated">🔴 Deactivated</option>
                          </select>
                        </div>

                        {/* Actor Type Filter */}
                        <div className="filter-group">
                          <label className="filter-label">Who Performed Action</label>
                          <select 
                            value={filters.actorType}
                            onChange={e => handleFilterChange('actorType', e.target.value)}
                            className="filter-select"
                          >
                            <option value="">All Users</option>
                            <option value="counselor">👨‍💼 Counselor</option>
                            <option value="student">🎓 Student</option>
                            <option value="system">🤖 System</option>
                            <option value="admin">👑 Admin</option>
                          </select>
                        </div>

                        {/* Date Range Filters */}
                        <div className="filter-group">
                          <label className="filter-label">From Date</label>
                          <input 
                            type="date" 
                            value={filters.from} 
                            onChange={(e) => handleFilterChange('from', e.target.value)}
                            className="filter-input"
                          />
                        </div>

                        <div className="filter-group">
                          <label className="filter-label">To Date</label>
                          <input 
                            type="date" 
                            value={filters.to} 
                            onChange={(e) => handleFilterChange('to', e.target.value)}
                            className="filter-input"
                          />
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {activeFilterCount > 0 ? `${activeFilterCount} filter(s) applied` : 'No filters applied'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={resetFilters} 
                            className="filter-button"
                            style={{ fontSize: '14px' }}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Export Buttons - Now aligned with search and filter */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
                  Export Current Page
                </button>

                <button 
                  onClick={exportAllHistory} 
                  className="primary-button"
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    background: '#10b981'
                  }}
                >
                  <Download size={16} />
                  Export All Records
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="table-container">
              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner"></div>
                  <p>Loading history records...</p>
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
                      <th>Record Type</th>
                      <th>Action</th>
                      <th>Performed By</th>
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
                              <summary style={{ 
                                color: '#0477BF', 
                                fontSize: '12px',
                                position: 'relative',
                                zIndex: 9999,
                                pointerEvents: 'auto',
                                cursor: 'pointer'
                              }}>
                                View Details
                              </summary>
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

            {/* Pagination */}
            <div className="history-pagination">
              <div>Page {page} of {totalPages} • {totalItems} records</div>
              <div className="pager">
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
                <select 
                  value={pageSize} 
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Reports section remains the same */}
        {activeTab === 'reports' && (
          <div>
            {/* Report sub-tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['appointments','referrals','notes','forms','analytics'].map(rt => (
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {rt === 'analytics' && <Brain size={16} />}
                  {rt === 'appointments' && <Calendar size={16} />}
                  {rt === 'referrals' && <Users size={16} />}
                  {rt === 'notes' && <FileText size={16} />}
                  {rt === 'forms' && <FileText size={16} />}
                  {rt.charAt(0).toUpperCase() + rt.slice(1)}
                </button>
              ))}
            </div>

            {/* Enhanced controls for reports */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                {reportTab === 'analytics' && (
                  <select 
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="filter-input"
                    style={{ minWidth: '120px' }}
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                )}
              </div>
              
              {/* Export controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={exportToCSV} 
                  className="filter-button"
                  title="Export to CSV"
                >
                  <Download size={16} />
                  CSV
                </button>
                <button 
                  onClick={exportToExcel} 
                  className="filter-button"
                  title="Export to Excel"
                >
                  <Download size={16} />
                  Excel
                </button>
                <button 
                  onClick={exportToPDF} 
                  className="filter-button"
                  title="Export to PDF"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button 
                  onClick={scheduleReport} 
                  className="primary-button"
                  title="Schedule Report"
                >
                  <Settings size={16} />
                  Schedule
                </button>
              </div>
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
                {/* Appointments Report */}
                {reportsData?.type === 'appointments' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'appointment' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Calendar size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Appointments</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'appointment' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Clock size={20} className="text-yellow-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Pending</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {reportsData.pending}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'appointment', action: 'approved' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <CheckCircle size={20} className="text-green-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Approved</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                          {reportsData.approved}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'appointment', action: 'rejected' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <XCircle size={20} className="text-red-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Rejected</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                          {reportsData.rejected}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'appointment' })} style={{ cursor: 'pointer' }}>
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
                                <div
                                  onClick={() => goToHistoryWith({
                                    entityType: 'appointment',
                                    from: new Date(day.date).toISOString().slice(0,10),
                                    to: new Date(day.date).toISOString().slice(0,10)
                                  })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${day.count} appointments on ${new Date(day.date).toLocaleDateString()}`}
                                />
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

                {/* Other report types remain the same */}
                {reportsData?.type === 'referrals' && (
                  <div className="cards-row">
                    <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'referral' })}>
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

                {reportsData?.type === 'notes' && (
                  <div className="cards-row">
                    <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'note' })}>
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

                {reportsData?.type === 'forms' && (
                  <div className="cards-row">
                    <div className="kpi-card"><h3 className="card-title">Total Students</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.totalStudents}</div></div>
                    <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'consent' })}><h3 className="card-title">Consent Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.consentForms}</div><div>{reportsData.consentCompletionRate.toFixed(1)}%</div></div>
                    <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'inventory' })}><h3 className="card-title">Inventory Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.inventoryForms}</div><div>{reportsData.inventoryCompletionRate.toFixed(1)}%</div></div>
                    <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'career' })}><h3 className="card-title">Career Completed</h3><div style={{ fontSize: 28, fontWeight: 700 }}>{reportsData.careerForms}</div><div>{reportsData.careerCompletionRate.toFixed(1)}%</div></div>
                  </div>
                )}

                {/* Advanced Analytics Section */}
                {reportTab === 'analytics' && (
                  <div>
                    {/* Key Performance Indicators */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Activity size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Activities</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {analyticsData?.totalActivities || 0}
                        </div>
                      </div>

                      <div className="kpi-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Target size={20} className="text-green-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Success Rate</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                          {analyticsData?.successRate || 0}%
                        </div>
                      </div>

                      <div className="kpi-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Zap size={20} className="text-yellow-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Efficiency Score</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {analyticsData?.efficiencyScore || 0}
                        </div>
                      </div>

                      <div className="kpi-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <TrendingUp size={20} className="text-purple-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Growth Rate</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
                          +{analyticsData?.growthRate || 0}%
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    {insights && insights.length > 0 && (
                      <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Brain size={20} />
                          AI-Powered Insights
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {insights.map((insight, index) => (
                            <div key={index} style={{ 
                              padding: '12px', 
                              background: '#f8fafc', 
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {insight.title}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '14px' }}>
                                {insight.description}
                              </div>
                              <div style={{ 
                                marginTop: '8px', 
                                fontSize: '12px', 
                                color: insight.confidence > 0.8 ? '#10b981' : insight.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                                fontWeight: '500'
                              }}>
                                Confidence: {Math.round(insight.confidence * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {performanceMetrics && (
                      <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Performance Metrics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Response Time</h4>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0477BF' }}>
                              {performanceMetrics.avgResponseTime || 0}ms
                            </div>
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Throughput</h4>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                              {performanceMetrics.throughput || 0}/hour
                            </div>
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Error Rate</h4>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                              {performanceMetrics.errorRate || 0}%
                            </div>
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>Uptime</h4>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                              {performanceMetrics.uptime || 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trends Chart */}
                    {trends && (
                      <div className="card">
                        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Trend Analysis</h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {trends.dataPoints && trends.dataPoints.map((point, index) => {
                            const maxValue = Math.max(...trends.dataPoints.map(p => p.value));
                            const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  style={{ 
                                    width: '100%', 
                                    background: '#0477BF', 
                                    borderRadius: '4px 4px 0 0', 
                                    minHeight: '4px', 
                                    height: `${height}%`, 
                                    transition: 'all 0.3s', 
                                    cursor: 'pointer' 
                                  }}
                                  title={`${point.value} on ${point.date}`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {new Date(point.date).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {point.value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryReportsView;