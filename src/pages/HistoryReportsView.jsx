import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Filter, Download, Calendar, TrendingUp, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Search, X, BarChart3, PieChart, LineChart, Activity, Target, Zap, Eye, Share2, Settings, RefreshCw, AlertTriangle, LogOut, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

// Toast Notification Component
const Toast = ({ message, type, onClose, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose, duration]);

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0477BF',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: 'rgba(255, 255, 255, 0.3)',
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}
      />
      
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <AlertTriangle size={20} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';

const HistoryReportsView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');
  const [historyData, setHistoryData] = useState([]);
  const [allHistoryData, setAllHistoryData] = useState([]); // Store all data for client-side search
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [highlightedApptId, setHighlightedApptId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);
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
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reportTab, setReportTab] = useState('appointments');
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Ref for the filter panel to detect clicks outside
  const filterPanelRef = useRef(null);

  // Client-side search function
  const searchHistoryData = useCallback((data, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return data;
    }

    const term = searchTerm.toLowerCase().trim();
    console.log('🔍 Client-side search for:', term);

    return data.filter(item => {
      // Search in EntityType (Record Type column)
      if (item.entityType?.toLowerCase().includes(term)) return true;
      
      // Search in Action (Action column)
      if (item.action?.toLowerCase().includes(term)) return true;
      
      // Search in ActorType (Performed By column)
      if (item.actorType?.toLowerCase().includes(term)) return true;
      
      // Search in EntityId (Record Type column - ID numbers)
      if (item.entityId && item.entityId.toString().includes(term)) return true;
      
      // Search in ActorId (Performed By column - ID numbers)
      if (item.actorId && item.actorId.toString().includes(term)) return true;
      
      // Search in formatted date/time (Date/Time column)
      const dateStr = new Date(item.createdAt).toLocaleString();
      if (dateStr.toLowerCase().includes(term)) return true;
      
      // Search in DetailsJson (Student names, titles, descriptions)
      if (item.detailsJson) {
        try {
          const details = JSON.parse(item.detailsJson);
          
          // Search student names
          if (details.studentName && details.studentName.toLowerCase().includes(term)) return true;
          
          // Search titles
          if (details.title && details.title.toLowerCase().includes(term)) return true;
          
          // Search descriptions
          if (details.description && details.description.toLowerCase().includes(term)) return true;
          
          // Raw JSON search as fallback
          if (item.detailsJson.toLowerCase().includes(term)) return true;
        } catch (e) {
          // If JSON parsing fails, do raw string search
          if (item.detailsJson.toLowerCase().includes(term)) return true;
        }
      }
      
      return false;
    });
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        console.log('Debounced search triggered:', searchInput);
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 300); // Reduced to 300ms for better responsiveness

    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

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
        // Remove search from backend call - we'll do client-side search
        page: 1, // Always fetch all data for client-side search
        pageSize: 1000 // Fetch more data for client-side filtering
      };
      console.log('Fetching history with params:', params);
      const res = await axios.get(`${API_BASE}/api/history`, { params, headers: { Authorization: `Bearer ${token}` } });
      console.log('History response:', res.data);
      
      // Store all data for client-side search
      setAllHistoryData(res.data.items || []);
      
      // Apply client-side search and pagination
      applyClientSideFilters();
      
    } catch (e) {
      console.error('history fetch failed', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters and pagination
  const applyClientSideFilters = useCallback(() => {
    let filteredData = [...allHistoryData];
    
    // Apply search filter
    if (filters.search) {
      filteredData = searchHistoryData(filteredData, filters.search);
    }
    
    // Apply other filters
    if (filters.entityType) {
      filteredData = filteredData.filter(item => item.entityType === filters.entityType);
    }
    
    if (filters.action) {
      filteredData = filteredData.filter(item => item.action === filters.action);
    }
    
    if (filters.actorType) {
      filteredData = filteredData.filter(item => item.actorType === filters.actorType);
    }
    
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filteredData = filteredData.filter(item => new Date(item.createdAt) >= fromDate);
    }
    
    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredData = filteredData.filter(item => new Date(item.createdAt) <= toDate);
    }
    
    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    
    console.log(`Client-side filtering: ${allHistoryData.length} → ${filteredData.length} → ${paginatedData.length} (page ${page}/${totalPages})`);
    
    setHistoryData(paginatedData);
    setTotalItems(totalItems);
    setTotalPages(totalPages);
  }, [allHistoryData, filters, page, pageSize, searchHistoryData]);


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
      } else if (reportTab === 'consultations') {
        const { data } = await axios.get(`${API_BASE}/api/reports/consultations`, common);
        setReportsData({ type: 'consultations', ...data });
      } else if (reportTab === 'endorsements') {
        const { data } = await axios.get(`${API_BASE}/api/reports/endorsements`, common);
        setReportsData({ type: 'endorsements', ...data });
      } else if (reportTab === 'timeslots') {
        const { data } = await axios.get(`${API_BASE}/api/reports/timeslots`, common);
        setReportsData({ type: 'timeslots', ...data });
      } else if (reportTab === 'guidancepasses') {
        const { data } = await axios.get(`${API_BASE}/api/reports/guidancepasses`, common);
        setReportsData({ type: 'guidancepasses', ...data });
      } else if (reportTab === 'forms') {
        const { data } = await axios.get(`${API_BASE}/api/reports/forms-completion`, common);
        setReportsData({ type: 'forms', ...data });
      } else if (reportTab === 'mood') {
        const { data } = await axios.get(`${API_BASE}/api/reports/mood-insights`, common);
        setReportsData({ type: 'mood', ...data });
      } else if (reportTab === 'filemaintenance') {
        const { data } = await axios.get(`${API_BASE}/api/reports/file-maintenance`, common);
        setReportsData({ type: 'filemaintenance', ...data });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or filters change (except search)
  useEffect(() => {
    if (activeTab !== 'history') return;
    fetchHistory();
  }, [
    activeTab,
    filters.entityType,
    filters.action,
    filters.actorType,
    filters.from,
    filters.to
  ]);

  // Initialize tab and filters from URL query params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initTab = params.get('tab');
      const initEntity = params.get('entityType');
      const highlightIdParam = params.get('highlightId');
      if (initTab === 'history' || initTab === 'reports') setActiveTab(initTab);
      if (initEntity) setFilters(prev => ({ ...prev, entityType: initEntity }));
      if (highlightIdParam) setHighlightedApptId(parseInt(highlightIdParam));
    } catch (e) {
      // ignore malformed query
    }
  }, []);

  // Apply client-side filters when search or pagination changes
  useEffect(() => {
    if (activeTab !== 'history' || allHistoryData.length === 0) return;
    applyClientSideFilters();
  }, [
    activeTab,
    filters.search,
    page,
    pageSize,
    allHistoryData,
    applyClientSideFilters
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
    console.log(`Filter changed: ${key} = "${value}"`);
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
        format: 'csv'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Report scheduled successfully!');
    } catch (error) {
      console.error('Schedule report failed:', error);
      showToast('Failed to schedule report. Please try again.', 'error');
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
      case 'consent': return <FileText size={16} />;
      case 'inventory': return <FileText size={16} />;
      case 'career': return <Target size={16} />;
      case 'exitinterview': return <LogOut size={16} />;
      case 'mood': return <TrendingUp size={16} />;
      case 'filemaintenance': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created': return <CheckCircle size={16} className="text-green-500" />;
      case 'updated': return <AlertCircle size={16} className="text-orange-500" />;
      case 'deleted': return <XCircle size={16} className="text-red-500" />;
       case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      case 'activated': return <CheckCircle size={16} className="text-green-500" />;
      case 'deactivated': return <XCircle size={16} className="text-red-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  // Quick view modal for appointments
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptModalData, setApptModalData] = useState(null);

  const openAppointmentQuickView = (item) => {
    try {
      const details = item?.detailsJson ? JSON.parse(item.detailsJson) : {};
      setApptModalData({
        id: item.entityId,
        action: item.action,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        ...details
      });
      setShowApptModal(true);
    } catch (e) {
      setApptModalData({ id: item.entityId, action: item.action, createdAt: item.createdAt });
      setShowApptModal(true);
    }
  };

  // Helper function to determine navigation path based on entity type and ID
  const getNavigationPath = (entityType, entityId, detailsJson, action) => {
    try {
      const details = detailsJson ? JSON.parse(detailsJson) : {};
      
      switch (entityType) {
        case 'appointment':
          return `/dashboard/appointment-approval?highlightId=${entityId}&tab=all`;
        case 'referral':
          return `/dashboard/referral?highlightId=${entityId}`;
        case 'note':
          return `/dashboard/counseling-notes?highlightId=${entityId}`;
        case 'consultation':
          return `/dashboard/consultation-conference-forms?highlightId=${entityId}`;
        case 'endorsement':
          return `/dashboard/endorsement-custody?highlightId=${entityId}`;
        case 'timeslot':
          return `/dashboard/appointment-approval?highlightId=${entityId}`;
        case 'guidancepass':
          // Route to history tab when the action is completed; otherwise default to active
          {
            const tab = action === 'completed' ? 'history' : 'active';
            return `/dashboard/guidance-pass?tab=${tab}&highlightId=${entityId}`;
          }
        case 'consent':
        case 'inventory':
        case 'career':
        case 'exitinterview':
        case 'filemaintenance':
          // These forms are typically viewed through student details
          if (details.studentId) {
            return `/dashboard/students-list?viewStudent=${details.studentId}&highlightForm=${entityType}&highlightId=${entityId}`;
          }
          return `/dashboard/students-list?highlightForm=${entityType}&highlightId=${entityId}`;
        default:
          return '/dashboard/students-list';
      }
    } catch (error) {
      console.error('Error parsing details for navigation:', error);
      return '/dashboard/students-list';
    }
  };

  // Handle navigation to specific record
  const handleViewDetails = (item) => {
    if (item.entityType === 'appointment') {
      setActiveTab('history');
      setFilters(prev => ({ ...prev, entityType: 'appointment' }));
      setHighlightedApptId(item.entityId);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'history');
      url.searchParams.set('entityType', 'appointment');
      url.searchParams.set('highlightId', String(item.entityId));
      navigate(`${url.pathname}?${url.searchParams.toString()}`, { replace: true });
      return;
    }
    const path = getNavigationPath(item.entityType, item.entityId, item.detailsJson, item.action);
    navigate(path);
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
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ paddingLeft: '48px'}}
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setFilters(prev => ({ ...prev, search: '', page: 1 }));
                      }}
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
                            <option value="consent">📋 Consent Forms</option>
                            <option value="inventory">📊 Inventory Forms</option>
                            <option value="career">🎯 Career Forms</option>
                            <option value="exitinterview">🚪 Exit Interview Forms</option>
                            <option value="mood">💭 Mood Entries</option>
                            <option value="filemaintenance">📁 File Maintenance</option>
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
                            <option value="completed">✔️ Completed</option>
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
                            <div>
                              <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                                {item.entityType}
                                {item.entityId && ` #${item.entityId}`}
                              </span>
                              {item.detailsJson && (() => {
                                try {
                                  const details = JSON.parse(item.detailsJson);
                                  if (details.studentName) {
                                    return (
                                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                        Student: {details.studentName}
                                      </div>
                                    );
                                  }
                                  if (details.title) {
                                    return (
                                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                        {details.title}
                                      </div>
                                    );
                                  }
                                  if (details.description) {
                                    return (
                                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                        {details.description.length > 30 ? details.description.substring(0, 30) + '...' : details.description}
                                      </div>
                                    );
                                  }
                                } catch (e) {
                                  return null;
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getActionIcon(item.action)}
                            <span style={{ 
                              textTransform: 'capitalize',
                              color: item.action === 'created' ? '#10b981' : 
                                     item.action === 'updated' ? '#f59e0b' : 
                                     item.action === 'deleted' ? '#ef4444' : 
                                     item.action === 'completed' ? '#059669' : 
                                     item.action === 'approved' ? '#10b981' : 
                                     item.action === 'rejected' ? '#ef4444' : 
                                     item.action === 'activated' ? '#10b981' : 
                                     item.action === 'deactivated' ? '#ef4444' : '#6b7280',
                              fontWeight: '500'
                            }}>{item.action}</span>
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
                          {item.action === 'deleted' ? (
                            <span style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <XCircle size={12} />
                              Record Deleted
                            </span>
                          ) : (
                            <button
                              onClick={() => item.entityType === 'appointment' ? openAppointmentQuickView(item) : handleViewDetails(item)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0477BF',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f0f9ff';
                                e.target.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.textDecoration = 'none';
                              }}
                            >
                              <ExternalLink size={12} />
                              View Details
                            </button>
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
              {['appointments','referrals','notes','consultations','endorsements','timeslots','guidancepasses','forms','mood','filemaintenance'].map(rt => (
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
                  {rt === 'appointments' && <Calendar size={16} />}
                  {rt === 'referrals' && <Users size={16} />}
                  {rt === 'notes' && <FileText size={16} />}
                  {rt === 'consultations' && <FileText size={16} />}
                  {rt === 'endorsements' && <FileText size={16} />}
                  {rt === 'timeslots' && <Clock size={16} />}
                  {rt === 'guidancepasses' && <CheckCircle size={16} />}
                  {rt === 'forms' && <FileText size={16} />}
                  {rt === 'mood' && <TrendingUp size={16} />}
                  {rt === 'filemaintenance' && <FileText size={16} />}
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
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Date Range Controls */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="filter-group">
                  <label className="filter-label">Date From</label>
                  <input 
                    type="date" 
                    value={filters.from} 
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                    className="filter-input"
                    style={{
                      position: 'relative',
                      zIndex: 999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Date To</label>
                  <input 
                    type="date" 
                    value={filters.to} 
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                    className="filter-input"
                    style={{
                      position: 'relative',
                      zIndex: 999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
              
              {/* Export controls - Only CSV */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={exportToCSV} 
                  className="primary-button"
                  title="Export to CSV"
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

                {/* Referrals Report */}
                {reportsData?.type === 'referrals' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'referral' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Users size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Referrals</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Referrals by Priority</h3>
                      {reportsData.byPriority && reportsData.byPriority.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byPriority.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byPriority.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'referral' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} referrals with ${item.priority} priority`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.priority}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <Users size={48} className="empty-icon" />
                          <p>No referral data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Report */}
                {reportsData?.type === 'notes' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'note' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Notes</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Notes by Nature</h3>
                      {reportsData.byNature && reportsData.byNature.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byNature.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byNature.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'note' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} notes of ${item.type} nature`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.type}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FileText size={48} className="empty-icon" />
                          <p>No notes data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Consultations Report */}
                {reportsData?.type === 'consultations' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'consultation' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Consultations</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Consultations by Status</h3>
                      {reportsData.byStatus && reportsData.byStatus.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byStatus.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byStatus.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'consultation' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} consultations with ${item.status} status`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.status}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FileText size={48} className="empty-icon" />
                          <p>No consultation data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Endorsements Report */}
                {reportsData?.type === 'endorsements' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'endorsement' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Endorsements</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Endorsements by Type</h3>
                      {reportsData.byType && reportsData.byType.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byType.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byType.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'endorsement' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} endorsements of ${item.type} type`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.type}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FileText size={48} className="empty-icon" />
                          <p>No endorsement data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Slots Report */}
                {reportsData?.type === 'timeslots' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'timeslot' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Clock size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Time Slots</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Time Slots by Status</h3>
                      {reportsData.byStatus && reportsData.byStatus.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byStatus.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byStatus.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'timeslot' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} time slots with ${item.status} status`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.status}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <Clock size={48} className="empty-icon" />
                          <p>No time slot data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guidance Passes Report */}
                {reportsData?.type === 'guidancepasses' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'guidancepass' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <CheckCircle size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Guidance Passes</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Guidance Passes by Status</h3>
                      {reportsData.byStatus && reportsData.byStatus.length > 0 ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          gap: '12px', 
                          height: '200px', 
                          padding: '20px 0',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {reportsData.byStatus.map((item, index) => {
                            const maxCount = Math.max(...reportsData.byStatus.map(d => d.count));
                            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div
                                  onClick={() => goToHistoryWith({ entityType: 'guidancepass' })}
                                  style={{ width:'100%', background:'#0477BF', borderRadius:'4px 4px 0 0', minHeight:'4px', height: `${height}%`, transition:'all 0.3s', cursor:'pointer' }}
                                  title={`${item.count} guidance passes with ${item.status} status`}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                                  {item.status}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', marginTop: '4px' }}>
                                  {item.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <CheckCircle size={48} className="empty-icon" />
                          <p>No guidance pass data available for the selected period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Forms Report */}
                {reportsData?.type === 'forms' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Users size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Students</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.totalStudents}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'consent' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <CheckCircle size={20} style={{ color: '#3b82f6' }} />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Consent Completed</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                          {reportsData.consentForms}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                          {reportsData.consentCompletionRate.toFixed(1)}%
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'inventory' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} style={{ color: '#10b981' }} />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Inventory Completed</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                          {reportsData.inventoryForms}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                          {reportsData.inventoryCompletionRate.toFixed(1)}%
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'career' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Target size={20} style={{ color: '#8b5cf6' }} />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Career Completed</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
                          {reportsData.careerForms}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                          {reportsData.careerCompletionRate.toFixed(1)}%
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'exitinterview' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <LogOut size={20} style={{ color: '#f59e0b' }} />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Exit Interview Completed</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {reportsData.exitInterviewForms || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                          {reportsData.exitInterviewCompletionRate ? reportsData.exitInterviewCompletionRate.toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood Insights Report */}
                {reportsData?.type === 'mood' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'mood' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <TrendingUp size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Mood Entries</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total || 0}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'mood' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <TrendingUp size={20} className="text-green-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Average Mood Score</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                          {reportsData.averageScore ? reportsData.averageScore.toFixed(1) : '0.0'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Maintenance Report */}
                {reportsData?.type === 'filemaintenance' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px', 
                      marginBottom: '32px' 
                    }}>
                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'filemaintenance' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-blue-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Files Managed</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0477BF' }}>
                          {reportsData.total || 0}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'filemaintenance' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-green-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Files Archived</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                          {reportsData.archived || 0}
                        </div>
                      </div>

                      <div className="kpi-card" onClick={() => goToHistoryWith({ entityType: 'filemaintenance' })} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FileText size={20} className="text-orange-500" />
                          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Files Updated</h3>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {reportsData.updated || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        )}

        {/* Appointment Quick View Modal */}
        {showApptModal && apptModalData && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '520px', textAlign: 'left' }}>
              <h3 style={{ marginTop: 0 }}>Appointment Details</h3>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {apptModalData.studentName && (
                  <div style={{ marginBottom: 8 }}><strong>Student:</strong> {apptModalData.studentName}</div>
                )}
                {apptModalData.programSection && (
                  <div style={{ marginBottom: 8 }}><strong>Program/Section:</strong> {apptModalData.programSection}</div>
                )}
                {apptModalData.reason && (
                  <div style={{ marginBottom: 8 }}><strong>Reason:</strong> {apptModalData.reason}</div>
                )}
                {apptModalData.date && apptModalData.time && (
                  <div style={{ marginBottom: 8 }}><strong>Appointment:</strong> {apptModalData.date} at {apptModalData.time}</div>
                )}
                <div style={{ marginBottom: 8 }}><strong>Action:</strong> {apptModalData.action}</div>
                <div style={{ marginBottom: 8 }}><strong>Recorded:</strong> {new Date(apptModalData.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="primary-button" onClick={() => navigate(`/dashboard/appointment-approval?highlightId=${apptModalData.id}`)}>Open in Appointment Approval</button>
                <button className="filter-button" onClick={() => setShowApptModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default HistoryReportsView;