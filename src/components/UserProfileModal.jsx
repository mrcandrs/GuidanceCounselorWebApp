import React from 'react';
import { X, User, Mail, Calendar, Shield, Clock } from 'lucide-react';
import '../styles/ModalStyles.css';

const UserProfileModal = ({ isOpen, onClose, counselor }) => {
  if (!isOpen || !counselor) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Counselor Profile</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {counselor.profileImage ? (
                <img 
                  src={`data:image/jpeg;base64,${counselor.profileImage}`} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <User size={48} />
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{counselor.name}</h3>
              <p className="profile-role">Guidance Counselor</p>
              <div className="profile-status">
                <div className="status-indicator active"></div>
                <span>Active</span>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h4>Personal Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <User size={16} />
                  </div>
                  <div className="detail-content">
                    <label>Full Name</label>
                    <span>{counselor.name}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Mail size={16} />
                  </div>
                  <div className="detail-content">
                    <label>Email Address</label>
                    <span>{counselor.email}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Shield size={16} />
                  </div>
                  <div className="detail-content">
                    <label>Counselor ID</label>
                    <span>#{counselor.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Account Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="detail-content">
                    <label>Account Created</label>
                    <span>{formatDate(counselor.createdAt)}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <Clock size={16} />
                  </div>
                  <div className="detail-content">
                    <label>Last Login</label>
                    <span>{formatDateTime(counselor.lastLogin)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>System Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-content">
                    <label>Session Status</label>
                    <span className="status-badge active">Active Session</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-content">
                    <label>Access Level</label>
                    <span className="access-level">Full Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
