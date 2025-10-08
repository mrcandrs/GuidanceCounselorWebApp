import { useState, useEffect, useCallback, useRef } from 'react';

const useSessionTimeout = (timeoutMinutes = 30, warningMinutes = 5) => {
  const [isWarning, setIsWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(true);
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Reset the session timeout
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarning(false);
    setTimeLeft(null);
    setIsActive(true);

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarning(true);
      setTimeLeft(warningMinutes * 60); // Convert to seconds for display
      
      // Start countdown interval
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - warningMs);

    // Set final timeout
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, timeoutMs);
  }, [timeoutMinutes, warningMinutes]);

  // Extend session (called when user is active)
  const extendSession = useCallback(() => {
    if (isActive) {
      resetTimeout();
    }
  }, [isActive, resetTimeout]);

  // Force logout
  const forceLogout = useCallback(() => {
    setIsActive(false);
    setIsWarning(false);
    setTimeLeft(null);
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      // Don't extend session if warning modal is visible
      if (isActive && !isWarning) {
        extendSession();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isWarning, extendSession, resetTimeout]);

  // Format time left for display
  const formatTimeLeft = useCallback((seconds) => {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    isWarning,
    timeLeft: timeLeft ? formatTimeLeft(timeLeft) : null,
    isActive,
    extendSession,
    forceLogout,
    resetTimeout
  };
};

export default useSessionTimeout;