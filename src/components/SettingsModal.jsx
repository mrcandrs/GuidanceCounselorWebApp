import React, { useState, useRef } from 'react';
import { X, User, Mail, Lock, Camera, Save, Eye, EyeOff, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../styles/ModalStyles.css';

const SettingsModal = ({ isOpen, onClose, counselor, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [profileData, setProfileData] = useState({
    name: counselor?.name || '',
    email: counselor?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE = 'https://guidanceofficeapi-production.up.railway.app';

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_BASE}/api/counselor/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Profile updated successfully!');
      onUpdate(response.data);
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Profile update failed:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_BASE}/api/counselor/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Password update failed:', error);
      if (error.response?.status === 400) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        setErrors({ general: 'Failed to update password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ photo: 'File size must be less than 5MB' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ photo: 'Please select an image file' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_BASE}/api/counselor/photo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Photo updated successfully!');
      onUpdate(response.data);
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Photo update failed:', error);
      setErrors({ photo: 'Failed to update photo. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`${API_BASE}/api/counselor/photo`, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage('Photo deleted successfully!');
      onUpdate(response.data);
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Photo delete failed:', error);
      setErrors({ photo: 'Failed to delete photo. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProfileData({ name: counselor?.name || '', email: counselor?.email || '' });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={handleClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={16} />
            Password
          </button>
          <button 
            className={`tab-button ${activeTab === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveTab('photo')}
          >
            <Camera size={16} />
            Photo
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <button 
                onClick={handleProfileUpdate}
                disabled={loading}
                className="save-button"
              >
                <Save size={16} />
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className={errors.currentPassword ? 'error' : ''}
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={errors.newPassword ? 'error' : ''}
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="password-toggle"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm new password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button 
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="save-button"
              >
                <Save size={16} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="settings-form">
              <div className="photo-upload">
                <div className="current-photo">
                  {counselor?.profileImage ? (
                    <img 
                      src={`data:image/jpeg;base64,${counselor.profileImage}`} 
                      alt="Current profile" 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-placeholder">
                      <User size={48} />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />

                <div className="photo-actions">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="upload-button"
                  >
                    <Camera size={16} />
                    {loading ? 'Uploading...' : 'Choose New Photo'}
                  </button>

                  {counselor?.profileImage && (
                    <button 
                      onClick={handlePhotoDelete}
                      disabled={loading}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                      Delete Photo
                    </button>
                  )}
                </div>

                {errors.photo && <span className="error-text">{errors.photo}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
