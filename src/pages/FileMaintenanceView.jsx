import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../styles/Dashboard.css';

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
      style={{ pointerEvents: 'auto', zIndex: 999 }}
      title="Edit"
      disabled={busy}
    >
      <Edit size={16} />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="action-button delete-button"
      style={{ pointerEvents: 'auto', zIndex: 999 }}
      title="Delete"
      disabled={busy}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

// A reusable manager for simple dictionary-like resources
const ResourceManager = ({
  title,
  endpoint,         // e.g. '/api/maintenance/programs'
  columns,          // [{key:'code', label:'Code'}, {key:'name', label:'Name'}, ...]
  defaults = {},    // default values for new item
  transformIn,      // optional map API -> form
  transformOut      // optional map form -> API
}) => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [error, setError] = useState('');

  const headers = fetchAuthHeaders();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(item =>
      columns.some(c => String(item[c.key] ?? '').toLowerCase().includes(q))
    );
  }, [search, list, columns]);

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
    try {
      const payload = transformOut ? transformOut(form) : form;
      if (editing?.id ?? editing?.[`${title.toLowerCase().replace(/\s+/g, '')}Id`]) {
        const id =
          editing.id ?? editing[`${title.toLowerCase().replace(/\s+/g, '')}Id`];
        await axios.put(`${apiBase}${endpoint}/${id}`, payload, { headers });
      } else {
        await axios.post(`${apiBase}${endpoint}`, payload, { headers });
      }
      setShowEditor(false);
      setEditing(null);
      setForm(defaults);
      await load();
      alert('Saved successfully.');
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
      alert('Deleted.');
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card dashboard-scrollable-form">
      <div className="page-header">
        <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-input-container">
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
        </div>
      </div>

      {error && (
        <div className="alert-card alert-red" style={{ marginBottom: 12 }}>
          <p className="alert-text-red">{error}</p>
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
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id ?? item.code ?? item.name ?? JSON.stringify(item)}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  <td>
                    <RowActions
                      onEdit={() => startEdit(item)}
                      onDelete={() => handleDelete(item)}
                      busy={busy}
                    />
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
                  <label className="label">{col.label}</label>
                  {col.type === 'select' ? (
                    <select
                      className="input"
                      value={form[col.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [col.key]: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {(col.options || []).map(opt => (
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
                  ) : (
                    <TextInput
                      value={form[col.key] ?? ''}
                      onChange={v => setForm(prev => ({ ...prev, [col.key]: v }))}
                      placeholder={col.placeholder}
                    />
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
    </div>
  );
};

const FileMaintenanceView = () => {
  // Define tabs/resources here. Adjust endpoints and fields to match your API.
  const tabs = [
    {
      id: 'programs',
      label: 'Programs',
      endpoint: '/api/maintenance/programs',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'BSIT' },
        { key: 'name', label: 'Name', placeholder: 'Information Technology' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', name: '', isActive: true }
    },
    {
      id: 'sections',
      label: 'Sections',
      endpoint: '/api/maintenance/sections',
      columns: [
        { key: 'programCode', label: 'Program Code', placeholder: 'BSIT' },
        { key: 'name', label: 'Section', placeholder: '4B' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { programCode: '', name: '', isActive: true }
    },
    {
      id: 'reasons',
      label: 'Appointment Reasons',
      endpoint: '/api/maintenance/appointment-reasons',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'ACAD' },
        { key: 'name', label: 'Reason', placeholder: 'Academic Concern' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', name: '', isActive: true }
    },
    {
      id: 'referrals',
      label: 'Referral Categories',
      endpoint: '/api/maintenance/referral-categories',
      columns: [
        { key: 'code', label: 'Code', placeholder: 'EMERGENCY' },
        { key: 'label', label: 'Label', placeholder: 'Emergency' },
        { key: 'defaultPriority', label: 'Default Priority', type: 'select', options: [
          { value: 'EMERGENCY', label: 'Emergency' },
          { value: 'ASAP', label: 'ASAP' },
          { value: 'BEFORE_DATE', label: 'Before Date' }
        ]},
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { code: '', label: '', defaultPriority: '', isActive: true }
    },
    {
      id: 'timeslot-defaults',
      label: 'Time Slot Defaults',
      endpoint: '/api/maintenance/timeslot-defaults',
      columns: [
        { key: 'maxAppointments', label: 'Max per Slot', placeholder: '3' },
        { key: 'defaultTimesCsv', label: 'Default Times (CSV)', placeholder: '9:00 AM, 10:00 AM, 1:00 PM' },
        { key: 'isActive', label: 'Active', type: 'checkbox' }
      ],
      defaults: { maxAppointments: 3, defaultTimesCsv: '9:00 AM, 10:00 AM, 1:00 PM', isActive: true },
      transformOut: (f) => ({
        ...f,
        maxAppointments: parseInt(f.maxAppointments || 0, 10),
      })
    },
    {
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
    }
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
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: active === t.id ? '#dbeafe' : undefined,
                borderColor: active === t.id ? '#bfdbfe' : undefined
              }}
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
        />
      )}
    </div>
  );
};

export default FileMaintenanceView;