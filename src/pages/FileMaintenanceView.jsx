import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Filter, RefreshCw, Upload, Download, Copy, AlertTriangle, CheckCircle, Eye, Search, SortAsc, SortDesc } from 'lucide-react';
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
        position: 'relative',
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

const apiBase = 'https://guidanceofficeapi-production.up.railway.app';

const fetchAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TextInput = ({ value, onChange, placeholder }) => (
  <input
    className="input"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

const Modal = ({ title, children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal" style={{ width: 520, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 0 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="filter-button" onClick={onClose} title="Close">
          <X size={16} />
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);

const RowActions = ({ onEdit, onDelete, busy }) => (
  <div className="action-buttons">
    <button
      type="button"
      onClick={onEdit}
      className="action-button edit-button"
      title="Edit"
      disabled={busy}
    >
      <Edit size={16} />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="action-button delete-button"
      title="Delete"
      disabled={busy}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

// Enhanced reusable manager for dictionary-like resources
const ResourceManager = ({
  title,
  endpoint,         // e.g. '/api/maintenance/programs'
  columns,          // [{key:'code', label:'Code'}, {key:'name', label:'Name'}, ...]
  defaults = {},    // default values for new item
  transformIn,      // optional map API -> form
  transformOut,     // optional map form -> API
  validation = {},  // validation rules
  bulkImport = false, // enable bulk import
  relationships = [], // related data for dropdowns
  onShowToast       // global toast function
}) => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [relationshipData, setRelationshipData] = useState({});

  const headers = fetchAuthHeaders();

  // Toast helper function
  const showToast = (message, type = 'success') => {
    if (onShowToast) {
      onShowToast(message, type);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${apiBase}${endpoint}`, { headers });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadRelationships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // Load relationship data for dropdowns
  const loadRelationships = async () => {
    if (!relationships || relationships.length === 0) return;
    
    try {
      const relationshipPromises = relationships.map(async (rel) => {
        const { data } = await axios.get(`${apiBase}${rel.endpoint}`, { headers });
        return {
          key: rel.key,
          options: data.map(item => ({
            value: item[rel.valueField],
            label: `${item[rel.valueField]} - ${item[rel.labelField]}`
          }))
        };
      });
      
      const results = await Promise.all(relationshipPromises);
      const relationshipMap = {};
      results.forEach(result => {
        relationshipMap[result.key] = result.options;
      });
      setRelationshipData(relationshipMap);
    } catch (error) {
      console.error('Failed to load relationships:', error);
    }
  };

  // Enhanced filtering and sorting
  const filtered = useMemo(() => {
    let result = list;
    
    // Apply search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        columns.some(c => String(item[c.key] ?? '').toLowerCase().includes(q))
      );
    }
    
    // Apply sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField] ?? '';
        const bVal = b[sortField] ?? '';
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return result;
  }, [search, list, columns, sortField, sortDirection]);

  // Validation function
  const validateForm = (formData) => {
    const errors = {};
    
    Object.keys(validation).forEach(field => {
      const rules = validation[field];
      const value = formData[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${rules.label || field} is required`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        errors[field] = `${rules.label || field} must be no more than ${rules.maxLength} characters`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${rules.label || field} format is invalid`;
      } else if (rules.unique && value) {
        const existing = list.find(item => 
          item[field] === value && item.id !== editing?.id
        );
        if (existing) {
          errors[field] = `${rules.label || field} must be unique`;
        }
      }
    });
    
    return errors;
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...defaults });
    setShowEditor(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    const base = transformIn ? transformIn(item) : item;
    setForm({ ...defaults, ...base });
    setShowEditor(true);
  };

  const handleSave = async () => {
    setBusy(true);
    setError('');
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setBusy(false);
      return;
    }
    
    try {
      const payload = transformOut ? transformOut(form) : form;
      if (editing?.id ?? editing?.[`${title.toLowerCase().replace(/\s+/g, '')}Id`]) {
        const id =
          editing.id ?? editing[`${title.toLowerCase().replace(/\s+/g, '')}Id`];
        await axios.put(`${apiBase}${endpoint}/${id}`, payload, { headers });
        showToast(`${title} updated successfully!`);
      } else {
        await axios.post(`${apiBase}${endpoint}`, payload, { headers });
        showToast(`${title} created successfully!`);
      }
      setShowEditor(false);
      setEditing(null);
      setForm(defaults);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this record?')) return;
    setBusy(true);
    setError('');
    try {
      const id = item.id ?? item[`${title.toLowerCase().replace(/\s+/g, '')}Id`];
      await axios.delete(`${apiBase}${endpoint}/${id}`, { headers });
      await load();
      showToast(`${title} deleted successfully!`);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} selected records?`)) return;
    setBusy(true);
    setError('');
    try {
      await Promise.all(
        selectedItems.map(item => {
          const id = item.id ?? item[`${title.toLowerCase().replace(/\s+/g, '')}Id`];
          return axios.delete(`${apiBase}${endpoint}/${id}`, { headers });
        })
      );
      setSelectedItems([]);
      await load();
      showToast(`${selectedItems.length} ${title} records deleted successfully!`);
    } catch (e) {
      console.error(e);
      setError('Bulk delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkToggle = async (field, value) => {
    setBusy(true);
    setError('');
    try {
      await Promise.all(
        selectedItems.map(item => {
          const id = item.id ?? item[`${title.toLowerCase().replace(/\s+/g, '')}Id`];
          return axios.put(`${apiBase}${endpoint}/${id}`, { [field]: value }, { headers });
        })
      );
      setSelectedItems([]);
      await load();
      showToast(`${selectedItems.length} ${title} records updated successfully!`);
    } catch (e) {
      console.error(e);
      setError('Bulk update failed.');
    } finally {
      setBusy(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...filtered.map(item => 
        columns.map(col => `"${item[col.key] ?? ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Import functionality
  const handleImport = async () => {
    if (!importFile) return;
    
    setBusy(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      await axios.post(`${apiBase}${endpoint}/import`, formData, { 
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      
      setShowImportModal(false);
      setImportFile(null);
      await load();
      showToast(`${title} records imported successfully!`);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  // View functionality
  const handleView = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  // Sort functionality
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems([...filtered]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  return (
    <div className="card dashboard-scrollable-form">
      <div className="page-header">
        <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="filter-button" type="button" onClick={load} title="Refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="primary-button" type="button" onClick={startCreate}>
            <Plus size={16} />
            Create New
          </button>
          <button className="filter-button" type="button" onClick={handleExport} title="Export">
            <Download size={16} />
            Export
          </button>
          {bulkImport && (
            <button className="filter-button" type="button" onClick={() => setShowImportModal(true)} title="Import">
              <Upload size={16} />
              Import
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-card alert-red" style={{ marginBottom: 12 }}>
          <AlertTriangle size={16} />
          <p className="alert-text-red">{error}</p>
        </div>
      )}


      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bulk-actions" style={{ 
          background: '#f3f4f6', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>
            {selectedItems.length} item(s) selected
          </span>
          <button 
            className="filter-button" 
            onClick={handleBulkDelete}
            disabled={busy}
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
          <button 
            className="filter-button" 
            onClick={() => handleBulkToggle('isActive', true)}
            disabled={busy}
          >
            <CheckCircle size={16} />
            Activate Selected
          </button>
          <button 
            className="filter-button" 
            onClick={() => handleBulkToggle('isActive', false)}
            disabled={busy}
          >
            <X size={16} />
            Deactivate Selected
          </button>
          <button 
            className="filter-button" 
            onClick={() => setSelectedItems([])}
          >
            Clear Selection
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Filter size={48} className="empty-icon" />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="forms-table-container">
          <table className="forms-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filtered.length && filtered.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                {columns.map(col => (
                  <th 
                    key={col.key}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {sortField === col.key && (
                        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id ?? item.code ?? item.name ?? JSON.stringify(item)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.some(selected => selected.id === item.id)}
                      onChange={(e) => handleSelectItem(item, e.target.checked)}
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="action-button view-button"
                        title="View Details"
                        disabled={busy}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="action-button edit-button"
                        title="Edit"
                        disabled={busy}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="action-button delete-button"
                        title="Delete"
                        disabled={busy}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <Modal
          title={editing ? `Edit ${title}` : `Create ${title}`}
          onClose={() => setShowEditor(false)}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {columns
              .filter(c => !c.readonly)
              .map(col => (
                <div className="form-group" key={col.key}>
                  <label className="label">
                    {col.label}
                    {validation[col.key]?.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  {col.type === 'select' ? (
                    <select
                      className={`input ${validationErrors[col.key] ? 'error' : ''}`}
                      value={form[col.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [col.key]: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {(relationshipData[col.key] || col.options || []).map(opt => (
                        <option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : col.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!form[col.key]}
                        onChange={e => setForm(prev => ({ ...prev, [col.key]: e.target.checked }))}
                      />
                      Active
                    </label>
                  ) : col.type === 'textarea' ? (
                    <textarea
                      className={`input ${validationErrors[col.key] ? 'error' : ''}`}
                      value={form[col.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [col.key]: e.target.value }))}
                      placeholder={col.placeholder}
                      rows={3}
                    />
                  ) : (
                    <TextInput
                      value={form[col.key] ?? ''}
                      onChange={v => setForm(prev => ({ ...prev, [col.key]: v }))}
                      placeholder={col.placeholder}
                      className={validationErrors[col.key] ? 'error' : ''}
                    />
                  )}
                  {validationErrors[col.key] && (
                    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                      {validationErrors[col.key]}
                    </div>
                  )}
                </div>
              ))
            }
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="primary-button full-width" onClick={handleSave} disabled={busy}>
              <Save size={16} />
              {busy ? 'Saving...' : 'Save'}
            </button>
            <button className="filter-button full-width" onClick={() => setShowEditor(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <Modal
          title="Import Records"
          onClose={() => setShowImportModal(false)}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="form-group">
              <label className="label">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="input"
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Upload a CSV file with the same columns as the table. First row should contain headers.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button 
              className="primary-button full-width" 
              onClick={handleImport} 
              disabled={busy || !importFile}
            >
              <Upload size={16} />
              {busy ? 'Importing...' : 'Import'}
            </button>
            <button 
              className="filter-button full-width" 
              onClick={() => setShowImportModal(false)} 
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <Modal
          title={`View ${title} Details`}
          onClose={() => setShowViewModal(false)}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {columns.map(col => (
              <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontWeight: '500', color: '#374151' }}>{col.label}</label>
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#f9fafb', 
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  {col.render ? col.render(viewingItem[col.key], viewingItem) : String(viewingItem[col.key] ?? 'N/A')}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button 
              className="primary-button full-width" 
              onClick={() => {
                setShowViewModal(false);
                startEdit(viewingItem);
              }}
            >
              <Edit size={16} />
              Edit Record
            </button>
            <button 
              className="filter-button full-width" 
              onClick={() => setShowViewModal(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

const FileMaintenanceView = () => {
  const [globalToast, setGlobalToast] = useState(null);

  // Global toast helper function
  const showGlobalToast = (message, type = 'success') => {
    setGlobalToast({ message, type });
  };

  const hideGlobalToast = useCallback(() => {
    setGlobalToast(null);
  }, []);

  // Define tabs/resources here. Adjust endpoints and fields to match your API.
  const tabs = [
    {
      id: 'programs',
      label: 'Programs',
      endpoint: '/api/maintenance/programs',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'BSIT' },
        { key: 'name', label: 'Name', placeholder: 'Bachelor of Science in Information Technology' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', name: '', isActive: true },
      validation: {
        code: { required: true, minLength: 2, maxLength: 10, unique: true, label: 'Code' },
        name: { required: true, minLength: 5, maxLength: 100, label: 'Name' }
      },
      bulkImport: true
    },
    {
      id: 'sections',
      label: 'Sections',
      endpoint: '/api/maintenance/sections',
      columns: [
        { key: 'programCode', label: 'Program Code', placeholder: 'BSIT', type: 'select', options: [] },
        { key: 'name', label: 'Section', placeholder: '4B' },
        { key: 'yearLevel', label: 'Year Level', placeholder: '4', type: 'select', options: [
          { value: '1', label: '1st Year' },
          { value: '2', label: '2nd Year' },
          { value: '3', label: '3rd Year' },
          { value: '4', label: '4th Year' }
        ]},
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { programCode: '', name: '', yearLevel: '', isActive: true },
      validation: {
        programCode: { required: true, label: 'Program Code' },
        name: { required: true, minLength: 1, maxLength: 10, label: 'Section' },
        yearLevel: { required: true, label: 'Year Level' }
      },
      bulkImport: true,
      relationships: [
        {
          key: 'programCode',
          endpoint: '/api/maintenance/programs',
          valueField: 'code',
          labelField: 'name'
        }
      ]
    },
    {
      id: 'reasons',
      label: 'Appointment Reasons',
      endpoint: '/api/maintenance/appointment-reasons',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'ACAD' },
        { key: 'name', label: 'Reason', placeholder: 'Academic Concern' },
        { key: 'description', label: 'Description', placeholder: 'Detailed description', type: 'textarea' },
        { key: 'category', label: 'Category', placeholder: 'Academic', type: 'select', options: [
          { value: 'ACADEMIC', label: 'Academic' },
          { value: 'PERSONAL', label: 'Personal' },
          { value: 'CAREER', label: 'Career' },
          { value: 'EMERGENCY', label: 'Emergency' }
        ]},
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', name: '', description: '', category: '', isActive: true },
      validation: {
        code: { required: true, minLength: 2, maxLength: 10, unique: true, label: 'Code' },
        name: { required: true, minLength: 3, maxLength: 50, label: 'Reason' },
        category: { required: true, label: 'Category' }
      },
      bulkImport: true
    },
    {
      id: 'referrals',
      label: 'Referral Categories',
      endpoint: '/api/maintenance/referral-categories',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'EMERGENCY' },
        { key: 'label', label: 'Label', placeholder: 'Emergency' },
        { key: 'description', label: 'Description', placeholder: 'Category description', type: 'textarea' },
        { key: 'defaultPriority', label: 'Default Priority', type: 'select', options: [
          { value: 'EMERGENCY', label: 'Emergency' },
          { value: 'ASAP', label: 'ASAP' },
          { value: 'BEFORE_DATE', label: 'Before Date' }
        ]},
        { key: 'color', label: 'Color', placeholder: '#ff0000' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', label: '', description: '', defaultPriority: '', color: '#0477BF', isActive: true },
      validation: {
        code: { required: true, minLength: 2, maxLength: 20, unique: true, label: 'Code' },
        label: { required: true, minLength: 2, maxLength: 50, label: 'Label' },
        defaultPriority: { required: true, label: 'Default Priority' }
      },
      bulkImport: true
    },
    {
      id: 'timeslot-defaults',
      label: 'Time Slot Defaults',
      endpoint: '/api/maintenance/timeslot-defaults',
      columns: [
        { key: 'maxAppointments', label: 'Max per Slot', placeholder: '3' },
        { key: 'defaultTimesCsv', label: 'Default Times (CSV)', placeholder: '9:00 AM, 10:00 AM, 1:00 PM', type: 'textarea' },
        { key: 'slotDuration', label: 'Slot Duration (minutes)', placeholder: '30' },
        { key: 'breakTime', label: 'Break Time (minutes)', placeholder: '15' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { 
        maxAppointments: 3, 
        defaultTimesCsv: '9:00 AM, 10:00 AM, 1:00 PM', 
        slotDuration: 30,
        breakTime: 15,
        isActive: true 
      },
      validation: {
        maxAppointments: { required: true, minLength: 1, maxLength: 2, label: 'Max per Slot' },
        defaultTimesCsv: { required: true, label: 'Default Times' },
        slotDuration: { required: true, label: 'Slot Duration' }
      },
      transformOut: (f) => ({
        ...f,
        maxAppointments: parseInt(f.maxAppointments || 0, 10),
        slotDuration: parseInt(f.slotDuration || 30, 10),
        breakTime: parseInt(f.breakTime || 15, 10),
      }),
      bulkImport: false
    },
    /*{
      id: 'mood-thresholds',
      label: 'Mood Alert Thresholds',
      endpoint: '/api/maintenance/mood-thresholds',
      columns: [
        { key: 'mildMax', label: 'Mild Max', placeholder: '3' },
        { key: 'moderateMax', label: 'Moderate Max', placeholder: '6' },
        { key: 'highMin', label: 'High Min', placeholder: '7' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { mildMax: 3, moderateMax: 6, highMin: 7, isActive: true },
      transformOut: (f) => ({
        ...f,
        mildMax: parseInt(f.mildMax || 0, 10),
        moderateMax: parseInt(f.moderateMax || 0, 10),
        highMin: parseInt(f.highMin || 0, 10),
      })
    }*/
  ];

  const [active, setActive] = useState(tabs[0].id);

  const tab = tabs.find(t => t.id === active);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">File Maintenance</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`filter-button ${active === t.id ? 'active' : ''}`}
              type="button"
              style={{
                position: 'relative',
                cursor: 'pointer',
              }}
              aria-pressed={active === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab && (
        <ResourceManager
          title={tab.label}
          endpoint={tab.endpoint}
          columns={tab.columns}
          defaults={tab.defaults}
          transformIn={tab.transformIn}
          transformOut={tab.transformOut}
          validation={tab.validation}
          bulkImport={tab.bulkImport}
          relationships={tab.relationships}
          onShowToast={showGlobalToast}
        />
      )}

      {/* Global Toast Notification */}
      {globalToast && (
        <Toast
          message={globalToast.message}
          type={globalToast.type}
          onClose={hideGlobalToast}
        />
      )}
    </div>
  );
};

export default FileMaintenanceView;