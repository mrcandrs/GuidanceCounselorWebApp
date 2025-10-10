// src/utils/sessionManager.js

// Generate a unique device ID
const generateDeviceId = () => {
  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // Generate a new device ID using browser fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash of the fingerprint
    deviceId = btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

// Get current session info
const getCurrentSession = () => {
  const token = localStorage.getItem('authToken');
  const deviceId = generateDeviceId();
  const sessionId = localStorage.getItem('sessionId');
  
  return {
    token,
    deviceId,
    sessionId: sessionId || generateSessionId()
  };
};

// Generate a unique session ID
const generateSessionId = () => {
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  localStorage.setItem('sessionId', sessionId);
  return sessionId;
};

// Store session info in localStorage
const storeSessionInfo = (sessionData) => {
  localStorage.setItem('sessionId', sessionData.sessionId);
  localStorage.setItem('deviceId', sessionData.deviceId);
  localStorage.setItem('sessionTimestamp', Date.now().toString());
};

// Clear session info
const clearSessionInfo = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('sessionId');
  localStorage.removeItem('sessionTimestamp');
  // Keep deviceId for future logins
};

// Check if session is expired (older than 30 minutes)
const isSessionExpired = () => {
  const timestamp = localStorage.getItem('sessionTimestamp');
  if (!timestamp) return true;
  
  const sessionAge = Date.now() - parseInt(timestamp);
  const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  return sessionAge > thirtyMinutes;
};

// Session validation checker
class SessionValidator {
  constructor() {
    this.checkInterval = null;
    this.isChecking = false;
    this.onSessionInvalidated = null;
  }

  // Start periodic session validation
  startValidation(intervalMs = 30000, onInvalidated) { // Check every 30 seconds
    this.onSessionInvalidated = onInvalidated;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      this.validateSession();
    }, intervalMs);
    
    // Also check immediately
    this.validateSession();
  }

  // Stop session validation
  stopValidation() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Validate current session
  async validateSession() {
    if (this.isChecking) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    this.isChecking = true;
    
    try {
      const sessionInfo = getCurrentSession();
      
      // Call API to validate session
      const response = await fetch('https://guidanceofficeapi-production.up.railway.app/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionInfo.sessionId,
          deviceId: sessionInfo.deviceId
        })
      });
      
      if (!response.ok) {
        throw new Error('Session validation failed');
      }
      
      const result = await response.json();
      
      if (!result.isValid) {
        // Session is invalid, trigger logout
        this.handleSessionInvalidated(result.reason || 'Session invalidated');
      }
      
    } catch (error) {
      console.error('Session validation error:', error);
      // On network error, don't logout immediately, but log the error
    } finally {
      this.isChecking = false;
    }
  }

  // Handle session invalidation
  handleSessionInvalidated(reason) {
    this.stopValidation();
    
    if (this.onSessionInvalidated) {
      this.onSessionInvalidated(reason);
    }
  }
}

export {
  generateDeviceId,
  getCurrentSession,
  generateSessionId,
  storeSessionInfo,
  clearSessionInfo,
  isSessionExpired,
  SessionValidator
};
