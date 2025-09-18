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
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = res.data || [];
    setReferrals(data);
    return data; // <-- return loaded list
  } catch (e) {
    setError('Failed to load referrals.');
    console.error(e);
    return []; // <-- safe fallback
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchList();
    fetchCurrentCounselor(); // Fetch counselor on mount
  }, []);

  const handleSelectReferral = async (referral) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `${API_BASE}/api/referral/${referral.referralId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Auto-populate counselor name if not already set
    const referralData = response.data;
    if (!referralData.counselorName && currentCounselor?.name) {
      referralData.counselorName = currentCounselor.name;
    }
    
    setSelected(referralData);
  } catch (error) {
    console.error('Error fetching referral details:', error);
    setSelected(referral); // fallback to list data
  }
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
          counselorFeedbackStudentName: selected.counselorFeedbackStudentName || selected.fullName || '',
          counselorFeedbackDateReferred: selected.counselorFeedbackDateReferred || null,
          counselorSessionDate: selected.counselorSessionDate || null,
          counselorActionsTaken: selected.counselorActionsTaken || '',
          counselorName: selected.counselorName || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const refreshed = await fetchList();
      //Ensure selection reflects the refreshed, completed item after save
      setSelected(prev => {
        if (!prev) return prev;
        const updated = refreshed.find(x => x.referralId === prev.referralId);
        return updated ? { ...updated } : prev;
      });
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

//Checking if the form has the counselor's feedback
const hasSavedFeedback = r =>
  !!(
    (r?.counselorActionsTaken && r.counselorActionsTaken.trim()) ||
    (r?.counselorFeedbackDateReferred && r.counselorFeedbackDateReferred.trim()) ||
    (r?.counselorSessionDate && r.counselorSessionDate.trim())
  );

//Compute completed from the refreshed list
const selectedFromList = selected
  ? referrals.find(x => x.referralId === selected.referralId)
  : null;
const completed = !!selectedFromList && hasSavedFeedback(selectedFromList);

const isEditing = !!selected && !completed;
const needs = {
  session: isEditing && !selected?.counselorSessionDate,
  feedbackDate: isEditing && !selected?.counselorFeedbackDateReferred,
  actions: isEditing && !(selected?.counselorActionsTaken && selected.counselorActionsTaken.trim()),
  counselorName: isEditing && !selected?.counselorName
};

//Date helper
const toDateInput = (iso) => {
  if (!iso) return '';
  const s = String(iso);
  if (s.length >= 10) return s.slice(0, 10); // handles "2025-09-17T00:00:00"
  return s;
};

const formatCardDate = (iso) => {
  if (!iso) return '-';
  const s = String(iso);
  const hasZ = s.endsWith('Z');
  const d = new Date(hasZ ? s : s + 'Z'); // treat as UTC then display Manila
  return d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
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
                const saved = hasSavedFeedback(r);
                const isActive = selected?.referralId === r.referralId;
                return (
                  <button
                    key={r.referralId}
                    className={`referral-item ${isActive ? 'active' : ''} ${saved ? 'completed' : ''}`}
                    title={saved ? 'Feedback saved' : 'Open Feedback'}
                    onClick={() => handleSelectReferral(r)} // Use new handler
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="referral-item-header">
                      <span className="referral-student">
                        {saved ? '✓ ' : ''}{r.studentFullName || r.fullName}
                      </span>
                      <span className="referral-date">
                        {formatCardDate(r.submissionDate)}
                      </span>
                    </div>
                    <div className="referral-item-sub">
                      <span>Student No.: {r.studentNumber || r.studentNumber /* same name in DTO */}</span>
                      <span>Program: {r.studentProgram}{r.section ? ` - ${r.section}` : ''}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/*Feedback Slip*/}
        <div className="card referral-editor-card referral-scrollable-form">
          {!selected ? (
            <div className="empty-state">Select a referral to add feedback.</div>
          ) : (
            <div className="referral-editor referral-scrollable-form">
              {/* Referral Form Details (read-only) */}
              <div className="card-subtitle" style={{ marginTop: 4, marginBottom: 8 }}>Referral Form Details</div>

              <div className="referral-editor">
                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Student's Name (submitted)</label>
                    <input className="input" value={selected.fullName || selected.studentFullName || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Program</label>
                    <input className="input" value={selected.program || selected.studentProgram || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Student No.</label>
                    <input className="input" value={selected.studentNumber || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Section</label>
                    <input className="input" value={selected.section || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Prepared by (Person who referred)</label>
                    <input className="input" value={selected.personWhoReferred || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Date Referred</label>
                    <input className="input" value={(selected.dateReferred || '').slice(0,10) || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Academic Level</label>
                    <input className="input" value={selected.academicLevel || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Referred By</label>
                    <input className="input" value={selected.referredBy || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Areas of Concern</label>
                    <input className="input" value={selected.areasOfConcern || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Action Requested</label>
                    <input className="input" value={selected.actionRequested || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-row-2">
                  <div className="referral-field">
                    <label className="label">Priority Level</label>
                    <input className="input" value={selected.priorityLevel || '-'} readOnly />
                  </div>
                  <div className="referral-field">
                    <label className="label">Priority Date</label>
                    <input className="input" value={(selected.priorityDate || '').slice(0,10) || '-'} readOnly />
                  </div>
                </div>

                <div className="referral-field">
                  <label className="label">Action/s Taken Before Referral</label>
                  <textarea className="input" value={selected.actionsTakenBefore || '-'} readOnly rows={3} />
                </div>

                <div className="referral-field">
                  <label className="label">Reasons for Referral / Comments</label>
                  <textarea className="input" value={selected.referralReasons || '-'} readOnly rows={3} />
                </div>

                <div className="referral-field">
                  <label className="label">Counselor's Initial Action</label>
                  <textarea className="input" value={selected.counselorInitialAction || '-'} readOnly rows={3} />
                </div>
              </div>

              <hr style={{ margin: '12px 0' }} />
              <div className="card-subtitle" style={{ marginTop: 4, marginBottom: 8 }}>Feedback Slip</div>

              {/* Header row: matches slip */}
              <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Student's Name</label>
                  <input className="input" value={selected.fullName || ''} readOnly />
                </div>
                <div className="referral-field">
                  <label className="label">Program</label>
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
                    className={`input ${needs.session ? 'input-error' : ''} ${selected?.counselorSessionDate ? 'prefilled' : ''}`}
                    value={toDateInput(selected.counselorSessionDate) || ''}
                    onChange={e => setSelected({ ...selected, counselorSessionDate: e.target.value })}
                    disabled={completed}
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
                    className={`input ${needs.feedbackDate ? 'input-error' : ''} ${selected?.counselorFeedbackDateReferred ? 'prefilled' : ''}`}
                    value={toDateInput(selected.counselorFeedbackDateReferred) || ''}
                    onChange={e => setSelected({ ...selected, counselorFeedbackDateReferred: e.target.value })}
                    disabled={completed}
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
                    disabled={completed}
                    readOnly={!!currentCounselor?.name} // Make read-only if auto-populated
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
          <div className={`referral-field ${needs.actions ? 'group-error' : ''}`}>
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
                    disabled={completed}
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
                    disabled={completed}
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
                  disabled={completed}
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
                    disabled={saving || completed}
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                    >
                  {completed ? 'Feedback Locked' : saving ? 'Saving...' : 'Save Feedback'}
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