import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ReferralView.css';

const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';

const ReferralView = () => {
  const [referrals, setReferrals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentCounselor, setCurrentCounselor] = useState(null);

  // Fetch current counselor details
  const fetchCurrentCounselor = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_BASE}/api/counselor/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCurrentCounselor(response.data);
    } catch (error) {
      console.error('Error fetching counselor details:', error);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const url = API_BASE
        ? `${API_BASE}/api/referral/latest-per-student`
        : '/proxy/api/referral/latest-per-student';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferrals(res.data || []);
    } catch (e) {
      setError('Failed to load referrals.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    fetchCurrentCounselor(); // Fetch counselor on mount
  }, []);

  // Auto-fill counselor name when selecting a referral
  const handleSelectReferral = (referral) => {
    setSelected({
      ...referral,
      counselorName: currentCounselor ? currentCounselor.name : referral.counselorName || ''
    });
  };

  const saveFeedback = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const url = API_BASE
        ? `${API_BASE}/api/referral/${selected.referralId}/feedback`
        : `/proxy/api/referral/${selected.referralId}/feedback`;

      await axios.put(
        url,
        {
          counselorFeedbackStudentName: selected.counselorFeedbackStudentName || '',
          counselorFeedbackDateReferred: selected.counselorFeedbackDateReferred || null,
          counselorSessionDate: selected.counselorSessionDate || null,
          counselorActionsTaken: selected.counselorActionsTaken || '',
          counselorName: selected.counselorName || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchList();
      alert('Feedback saved.');
    } catch (e) {
      setError('Failed to save feedback.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

// put near top (inside component file, above return)
const ACTIONS = [
  'Counseling',
  'Classroom Observation',
  'Evaluation/Assessment'
];

const parseActions = (val) => {
  if (!val) return { set: new Set(), others: '' };
  const parts = val.split(',').map(s => s.trim()).filter(Boolean);
  const set = new Set();
  let others = '';
  parts.forEach(p => {
    const base = ACTIONS.find(a => a.toLowerCase() === p.toLowerCase());
    if (base) set.add(base);
    else if (p.toLowerCase().startsWith('others')) {
      const idx = p.indexOf(':');
      others = idx >= 0 ? p.slice(idx + 1).trim() : '';
    }
  });
  return { set, others };
};

const actionsToString = (set, others) => {
  const arr = Array.from(set);
  if (others && others.trim()) arr.push(`Others: ${others.trim()}`);
  return arr.join(', ');
};

  return (
    <div className="page-container referral-page">
      <h2 className="page-title">Referral</h2>

      {error && (
        <div className="alert-card alert-red referral-alert">
          <p className="alert-text-red">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 referral-grid">
        <div className="card referral-list-card">
          <div className="card-title">Submitted Referrals</div>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : referrals.length === 0 ? (
            <div className="empty-state">No referrals found.</div>
          ) : (
            <div className="referral-list">
              {referrals.map(r => {
                const isActive = selected?.referralId === r.referralId;
                return (
                  <button
                    key={r.referralId}
                    className={`referral-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectReferral(r)} // Use new handler
                    title="Open Feedback"
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="referral-item-header">
                      <span className="referral-student">{r.fullName}</span>
                      <span className="referral-date">
                        {r.submissionDate ? new Date(r.submissionDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="referral-item-sub">
                      <span>Student No.: {r.studentNumber}</span>
                      <span>Program: {r.program}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card referral-editor-card">
          <div className="card-title">Feedback Slip</div>
          {!selected ? (
            <div className="empty-state">Select a referral to add feedback.</div>
          ) : (
            <div className="referral-editor">
              {/* Header row: matches slip */}
              <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Student's Name</label>
                  <input className="input" value={selected.fullName || ''} readOnly />
                </div>
                <div className="referral-field">
                  <label className="label">Program & Section</label>
                  <input className="input" value={selected.program || ''} readOnly />
                </div>
              </div>

              <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Date Referred</label>
                  <input
                    className="input"
                    value={(selected.dateReferred || '').slice(0, 10)}
                    readOnly
                  />
                </div>
                <div className="referral-field">
                  <label className="label">Date of Session</label>
                  <input
                    type="date" // Changed to date picker
                    className="input"
                    value={selected.counselorSessionDate || ''}
                    onChange={e => setSelected({ ...selected, counselorSessionDate: e.target.value })}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

            <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Feedback Date</label>
                  <input
                    type="date" // Changed to date picker
                    className="input"
                    value={selected.counselorFeedbackDateReferred || ''}
                    onChange={e => setSelected({ ...selected, counselorFeedbackDateReferred: e.target.value })}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div className="referral-field">
                  <label className="label">Counselor Name (Prepared by)</label>
                  <input
                    className="input"
                    value={selected.counselorName || ''}
                    onChange={e => setSelected({ ...selected, counselorName: e.target.value })}
                    placeholder={currentCounselor ? currentCounselor.name : 'Enter counselor name'}
                  />
                </div>
              </div>

      {/* Action/s Taken (checkboxes + Others) */}
      {(() => {
        const { set, others } = parseActions(selected.counselorActionsTaken);
        const toggle = (a) => {
          const next = new Set(set);
          next.has(a) ? next.delete(a) : next.add(a);
          setSelected({
            ...selected,
            counselorActionsTaken: actionsToString(next, others)
          });
        };
        const setOthers = (v) => {
          setSelected({
            ...selected,
            counselorActionsTaken: actionsToString(set, v)
          });
        };
        return (
          <div className="referral-field">
            <label 
                className="label"
                >
                Action/s Taken
            </label>
            <div 
                style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 8,
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    cursor: 'pointer' 
                }}>
              {ACTIONS.map(a => (
                <label key={a} className="time-slot-button" style={{ userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={set.has(a)}
                    onChange={() => toggle(a)}
                    style={{ 
                        marginRight: 6,
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                    }}
                  />
                  {a}
                </label>
              ))}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                <label className="time-slot-button" style={{ userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={others && others.length > 0}
                    onChange={(e) => setOthers(e.target.checked ? others : '')}
                    style={{ 
                        marginRight: 6,
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto',
                        cursor: 'pointer' 
                    }}
                  />
                  Others
                </label>
                <input
                  className="input"
                  placeholder="Specify others"
                  value={others}
                  onChange={e => setOthers(e.target.value)}
                  style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Received by (read-only from person who referred on form) */}
              <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Received by (Person who referred)</label>
                  <input className="input" value={selected.personWhoReferred || ''} readOnly />
                </div>
                <div className="referral-field">
                  <label className="label">Received Date</label>
                  <input className="input" value={(selected.dateReferred || '').slice(0, 10)} readOnly />
                </div>
              </div>

              <div className="referral-actions">
                <button 
                    className="primary-button" 
                    onClick={saveFeedback} 
                    disabled={saving}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                    >
                  {saving ? 'Saving...' : 'Save Feedback'}
                </button>
                <button 
                    className="filter-button" 
                    onClick={() => setSelected(null)}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                    >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralView;