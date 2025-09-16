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

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/api/referral/latest-per-student`);
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
  }, []);

  const saveFeedback = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await axios.put(`${API_BASE}/api/referral/${selected.referralId}/feedback`, {
        counselorFeedbackStudentName: selected.counselorFeedbackStudentName || '',
        counselorFeedbackDateReferred: selected.counselorFeedbackDateReferred || null,
        counselorSessionDate: selected.counselorSessionDate || null,
        counselorActionsTaken: selected.counselorActionsTaken || '',
        counselorName: selected.counselorName || ''
      });
      await fetchList();
      alert('Feedback saved.');
    } catch (e) {
      setError('Failed to save feedback.');
      console.error(e);
    } finally {
      setSaving(false);
    }
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
                    onClick={() => setSelected(r)}
                    title="Open Feedback"
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
              <div className="referral-field">
                <label className="label">Student Name</label>
                <input
                  className="input"
                  value={selected.counselorFeedbackStudentName || ''}
                  onChange={e => setSelected({ ...selected, counselorFeedbackStudentName: e.target.value })}
                />
              </div>

              <div className="referral-row-2">
                <div className="referral-field">
                  <label className="label">Date Referred (YYYY-MM-DD)</label>
                  <input
                    className="input"
                    value={selected.counselorFeedbackDateReferred || ''}
                    onChange={e => setSelected({ ...selected, counselorFeedbackDateReferred: e.target.value })}
                  />
                </div>
                <div className="referral-field">
                  <label className="label">Date of Session (YYYY-MM-DD)</label>
                  <input
                    className="input"
                    value={selected.counselorSessionDate || ''}
                    onChange={e => setSelected({ ...selected, counselorSessionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="referral-field">
                <label className="label">Action/s Taken</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Counseling, Classroom Observation, Evaluation/Assessment, Others: ..."
                  value={selected.counselorActionsTaken || ''}
                  onChange={e => setSelected({ ...selected, counselorActionsTaken: e.target.value })}
                />
              </div>

              <div className="referral-field">
                <label className="label">Counselor Name</label>
                <input
                  className="input"
                  value={selected.counselorName || ''}
                  onChange={e => setSelected({ ...selected, counselorName: e.target.value })}
                />
              </div>

              <div className="referral-actions">
                <button className="primary-button" onClick={saveFeedback} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Feedback'}
                </button>
                <button className="filter-button" onClick={() => setSelected(null)}>
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