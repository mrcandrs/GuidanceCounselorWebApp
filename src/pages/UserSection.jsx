// UserSection.jsx
import React, { useEffect, useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import api from './api';

export default function UserSection() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/counselor/me') // // GET: api/counselor/me
      .then(res => {
        if (!mounted) return;
        setProfile(res.data);
      })
      .catch(err => {
        console.error('Failed to load counselor profile', err);
        // 401 is already handled by interceptor (will redirect)
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const initials = profile.name
    ? profile.name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase()
    : 'GC';

  return (
    <div className="user-section">
      <div className="user-info">
        <div className="user-avatar">{initials}</div>
        <div>
          <p className="user-name">{loading ? 'Loading...' : profile.name}</p>
          <p className="user-email">{loading ? 'Loading...' : profile.email}</p>
        </div>
      </div>
      <div className="user-actions">
        <button className="user-action-button settings-button" title="Settings">
          <Settings size={16} />
        </button>
        <button
          className="user-action-button logout-button"
          title="Logout"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
