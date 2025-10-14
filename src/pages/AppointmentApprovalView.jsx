import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Check, X, Clock, FileText, Plus, Trash2, History, Eye, AlertCircle, Hash } from 'lucide-react';
import '../styles/Dashboard.css';
import axios from 'axios';

const AppointmentApprovalView = ({ pendingAppointments, onAppointmentUpdate }) => {
  const location = useLocation();
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [maxAppointments, setMaxAppointments] = useState(3);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [approvedForSlot, setApprovedForSlot] = useState([]);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [slotToDeactivate, setSlotToDeactivate] = useState(null);
  const [slotDetails, setSlotDetails] = useState(null);
  const [rejectedAppointments, setRejectedAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [rejectedExpanded, setRejectedExpanded] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});

  // Fetch available time slots
  useEffect(() => {
    fetchAvailableSlots();
    fetchRejectedAppointments();
    fetchRecentActivity();
  }, []);

  // Handle URL parameters for highlighting
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlightId');
    if (highlightId) {
      setHighlightedId(parseInt(highlightId));
      // Clear highlight after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  // Add this useEffect after your existing fetchAvailableSlots useEffect
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsRefreshing(true);

      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }
      await fetchAvailableSlots();
      await fetchRejectedAppointments();
      await fetchRecentActivity();

      setIsRefreshing(false);
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, [onAppointmentUpdate]);

  const fetchAvailableSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/admin/all-slots',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  // New function to fetch rejected appointments
  const fetchRejectedAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/rejected-appointments',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setRejectedAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching rejected appointments:', error);
    }
  };

  // New function to fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/recent-activity',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setRecentActivity(response.data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleSetAvailableTimes = () => {
    setShowTimeSlotModal(true);
    setSelectedDate('');
    setSelectedTimes([]);
    setMaxAppointments(3);
  };

const handleSaveTimeSlots = async () => {
  if (!selectedDate || selectedTimes.length === 0) {
    alert('Please select a date and at least one time slot');
    return;
  }

  // Check if selected date is today
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;
  
  let validTimes = selectedTimes;
  
  if (isToday) {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Filter out past times
    validTimes = selectedTimes.filter(time => {
      const [timeStr, period] = time.split(' ');
      const [hour, minute] = timeStr.split(':').map(Number);
      
      let hour24 = hour;
      if (period === 'PM' && hour !== 12) hour24 += 12;
      if (period === 'AM' && hour === 12) hour24 = 0;
      
      const timeInMinutes = hour24 * 60 + minute;
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      return timeInMinutes > currentTimeInMinutes;
    });
    
    if (validTimes.length === 0) {
      alert('All selected times have already passed for today. Please select future times.');
      return;
    }
    
    if (validTimes.length < selectedTimes.length) {
      const skippedTimes = selectedTimes.filter(time => !validTimes.includes(time));
      alert(`Skipped past times: ${skippedTimes.join(', ')}. Creating slots for remaining times.`);
    }
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      'https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/bulk',
      {
        date: selectedDate,
        times: validTimes, // Use filtered times
        maxAppointments: maxAppointments
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    alert(`Successfully created ${response.data.createdSlots.length} time slots`);
    setShowTimeSlotModal(false);
    fetchAvailableSlots();
  } catch (error) {
    console.error('Error creating time slots:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
};

  // Add these functions to your component
const fetchSlotDetails = async (slotId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/${slotId}/details`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSlotDetails(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching slot details:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

const handleDeleteClick = async (slot) => {
  const details = await fetchSlotDetails(slot.slotId);
  if (details) {
    setSlotToDelete(slot);
    setShowDeleteModal(true);
  }
};

const handleDeactivateClick = async (slot) => {
  const details = await fetchSlotDetails(slot.slotId);
  if (details) {
    setSlotToDeactivate(slot);
    setShowDeactivateModal(true);
  }
};

  // Replace your existing handleDeleteTimeSlot function
const handleDeleteTimeSlot = async () => {
  if (!slotToDelete) return;

  try {
    setLoading(prev => ({ ...prev, [`delete-${slotToDelete.slotId}`]: true }));
    
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(
      `https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/${slotToDelete.slotId}/safe-delete`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert('Time slot deleted successfully');
    setShowDeleteModal(false);
    setSlotToDelete(null);
    setSlotDetails(null);
    fetchAvailableSlots();
  } catch (error) {
    console.error('Error deleting time slot:', error);
    const errorMessage = error.response?.data?.message || error.message;
    alert(`Error: ${errorMessage}`);
  } finally {
    setLoading(prev => ({ ...prev, [`delete-${slotToDelete.slotId}`]: false }));
  }
};

  // Replace your existing handleToggleTimeSlot function
const handleToggleTimeSlot = async () => {
  if (!slotToDeactivate) return;

  try {
    setLoading(prev => ({ ...prev, [`toggle-${slotToDeactivate.slotId}`]: true }));
    
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
      `https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/${slotToDeactivate.slotId}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const action = slotToDeactivate.isActive ? 'deactivated' : 'activated';
    alert(`Time slot ${action} successfully`);
    
    setShowDeactivateModal(false);
    setSlotToDeactivate(null);
    setSlotDetails(null);
    fetchAvailableSlots();
  } catch (error) {
    console.error('Error toggling time slot:', error);
    const errorMessage = error.response?.data?.message || error.message;
    alert(`Error: ${errorMessage}`);
  } finally {
    setLoading(prev => ({ ...prev, [`toggle-${slotToDeactivate.slotId}`]: false }));
  }
};

  const fetchApprovedForSlot = async (slot) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await axios.get(
      `https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/approved-by-slot/${slot.slotId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setApprovedForSlot(res.data || []);
    setActiveSlot(slot);
    setShowApprovedModal(true);
  } catch (err) {
    console.error('Error fetching approved for slot:', err);
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};

  // Group slots by date
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toLocaleDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  // Update the reject button click handler
  const handleRejectClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  //Approval method
  const handleApprove = async (appointmentId) => {
    setLoading(prev => ({ ...prev, [appointmentId]: 'approving' }));
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/${appointmentId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Approved appointment:', response.data);

      // Automatically create Guidance Pass for approved appointment
      try {
        const counselorId = localStorage.getItem('counselorId') || 1; // Default counselor ID
        const guidancePassResponse = await axios.post(
          `https://guidanceofficeapi-production.up.railway.app/api/guidancepass`,
          {
            appointmentId: appointmentId,
            notes: `Guidance pass issued for approved appointment`
            + (response.data?.appointment?.date ? ` on ${response.data.appointment.date}` : '')
            + (response.data?.appointment?.time ? ` at ${response.data.appointment.time}` : ''),
            counselorId: counselorId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        console.log('Guidance pass created:', guidancePassResponse.data);
      } catch (passError) {
        console.error('Error creating guidance pass:', passError);
        // Don't fail the approval if guidance pass creation fails
      }

      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }

      // Refresh available slots to update counts
      fetchAvailableSlots();

      alert(`Appointment approved successfully for ${response.data.appointment.studentName}. Guidance pass has been issued.`);

    } catch (error) {
      console.error('Error approving appointment:', error);

      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message;
      console.log('Detailed error:', error.response?.data);

      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, [appointmentId]: null }));
    }
  };

  //Rejection method
  const handleReject = async () => {
    if (!selectedAppointmentId) return;

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(prev => ({ ...prev, [selectedAppointmentId]: 'rejecting' }));
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/${selectedAppointmentId}/reject`,
        { rejectionReason: rejectionReason.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Rejected appointment:', response.data);

      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }

      fetchAvailableSlots();
      setShowRejectModal(false);
      setSelectedAppointmentId(null);
      setRejectionReason('');

      alert(`Appointment rejected successfully for ${response.data.appointment.studentName}`);

    } catch (error) {
      console.error('Error rejecting appointment:', error);
      setError(error.response?.data?.message || error.message);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [selectedAppointmentId]: null }));
    }
  };

  // Helper function to format the createdAt date
  const formatSubmissionDate = (createdAt) => {
    if (!createdAt) return 'Unknown';
    
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If today, show time
      if (diffDays === 1) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      // If yesterday
      else if (diffDays === 2) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      // If within a week, show day name
      else if (diffDays <= 7) {
        return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      // Otherwise show full date
      else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="page-container dashboard-scrollable-form">
      <div className="page-header">
        <h2 className="page-title">
          Appointment Approval
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="/dashboard/history-reports?tab=history&entityType=appointment"
            className="filter-button"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            <History size={16} />
            View All Appointments
          </a>
          <button
            onClick={() => setShowActivityModal(true)}
            className="filter-button"
            type="button"
            style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            <History size={20} />
            Recent Activity
          </button>
          {/*<button
            onClick={handleSetAvailableTimes}
            className="primary-button"
            type="button"
            style={{
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
          >
            <Calendar size={20} />
            Set Available Times
          </button>*/}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Pending Appointments */}
      <div className="card">
        <h3 className="card-title">Pending Appointments ({pendingAppointments?.length || 0})</h3>
              
        <div className="appointments-scroll-container">
          {pendingAppointments && pendingAppointments.length > 0 ? (
            pendingAppointments.map((appointment) => (
              <div 
                key={appointment.appointmentId} 
                className={`appointment-card ${highlightedId === appointment.appointmentId ? 'highlighted-appointment' : ''}`}
                style={{
                  backgroundColor: highlightedId === appointment.appointmentId ? '#fef3c7' : 'white',
                  border: highlightedId === appointment.appointmentId ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  animation: highlightedId === appointment.appointmentId ? 'pulse 2s ease-in-out' : 'none'
                }}
              >
                <div className="appointment-header">
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {appointment.studentName}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {appointment.programSection}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      marginTop: '4px',
                      fontSize: '11px',
                      color: highlightedId === appointment.appointmentId ? '#d97706' : '#6b7280',
                      fontWeight: highlightedId === appointment.appointmentId ? '600' : '500'
                    }}>
                      <Hash size={10} />
                      ID: {appointment.appointmentId}
                      {highlightedId === appointment.appointmentId && (
                        <span style={{ 
                          background: '#f59e0b', 
                          color: 'white', 
                          padding: '1px 4px', 
                          borderRadius: '3px',
                          fontSize: '9px',
                          marginLeft: '4px'
                        }}>
                          HIGHLIGHTED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button 
                      className="approve-button"
                      onClick={() => handleApprove(appointment.appointmentId)}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleRejectClick(appointment.appointmentId)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0', textTransform: 'capitalize' }}>
                  {appointment.reason}
                </p>
                
                {/* Submission Date */}
                <div style={{ 
                  fontSize: '13px', 
                  color: '#9ca3af', 
                  margin: '0 0 8px 0',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FileText size={12} />
                  Submitted: {formatSubmissionDate(appointment.createdAt)}
                </div>
                
                <div className="appointment-meta">
                  <span className="appointment-meta-item">
                    <Calendar size={14} />
                    {appointment.date}
                  </span>
                  <span className="appointment-meta-item">
                    <Clock size={14} />
                    {appointment.time}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={48} className="empty-icon" />
              <p>No pending appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Available Time Slots */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title">Available Time Slots</h3>
          <button
            onClick={handleSetAvailableTimes}
            className="primary-button"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Plus size={14} />
            Add Slots
          </button>
        </div>

        <div className="time-slots-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {Object.keys(groupedSlots).length > 0 ? (
            Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} style={{ marginBottom: '20px' }}>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    margin: '0 0 12px 0',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                  onClick={() => setExpandedDates(prev => ({
                    ...prev,
                    [date]: !prev[date]
                  }))}
                >
                  <span>{date}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {expandedDates[date] ? '▼' : '▶'} {slots.length} slots
                  </span>
                </div>
                
                {expandedDates[date] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                    {slots.map((slot) => (
                      <div key={slot.slotId} className="time-slot-item" style={{
                        border: `2px solid ${slot.isActive ? '#d1d5db' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: slot.isActive ? 'white' : '#f9fafb',
                        opacity: slot.isActive ? 1 : 0.7,
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              fontWeight: '600', 
                              fontSize: '14px',
                              color: slot.isActive ? '#1f2937' : '#6b7280'
                            }}>
                              {slot.time}
                            </span>
                            {slot.isActive ? (
                              <span style={{ 
                                fontSize: '10px', 
                                background: '#10b981', 
                                color: 'white', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                fontWeight: '500'
                              }}>
                                ACTIVE
                              </span>
                            ) : (
                              <span style={{ 
                                fontSize: '10px', 
                                background: '#6b7280', 
                                color: 'white', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                fontWeight: '500'
                              }}>
                                INACTIVE
                              </span>
                            )}
                          </div>
                          
                          {/* Compact action buttons */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => fetchApprovedForSlot(slot)}
                              style={{
                                padding: '4px 6px',
                                border: 'none',
                                background: '#0477BF',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                              title="View approved students"
                            >
                              View
                            </button>
                            
                            <button
                              onClick={() => handleDeactivateClick(slot)}
                              disabled={loading[`toggle-${slot.slotId}`]}
                              style={{
                                padding: '4px 6px',
                                border: 'none',
                                background: slot.isActive ? '#f59e0b' : '#10b981',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: loading[`toggle-${slot.slotId}`] ? 'not-allowed' : 'pointer',
                                opacity: loading[`toggle-${slot.slotId}`] ? 0.6 : 1
                              }}
                              title={slot.isActive ? 'Deactivate slot' : 'Activate slot'}
                            >
                              {loading[`toggle-${slot.slotId}`] ? '⏳' : (slot.isActive ? '⏸️' : '▶️')}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteClick(slot)}
                              disabled={loading[`delete-${slot.slotId}`]}
                              style={{
                                padding: '4px 6px',
                                border: 'none',
                                background: '#ef4444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: loading[`delete-${slot.slotId}`] ? 'not-allowed' : 'pointer',
                                opacity: loading[`delete-${slot.slotId}`] ? 0.6 : 1
                              }}
                              title="Delete slot"
                            >
                              {loading[`delete-${slot.slotId}`] ? '⏳' : <Trash2 size={10} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ 
                          fontSize: '12px', 
                          color: slot.isActive ? '#6b7280' : '#9ca3af',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>
                            ({slot.currentAppointmentCount}/{slot.maxAppointments} booked)
                          </span>
                          {slot.currentAppointmentCount < slot.maxAppointments && slot.isActive && (
                            <span style={{ color: '#10b981', fontWeight: '500' }}>
                              {slot.maxAppointments - slot.currentAppointmentCount} available
                            </span>
                          )}
                          {!slot.isActive && (
                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                              Hidden from students
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Clock size={48} className="empty-icon" />
              <p>No available time slots set</p>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Recently Rejected Section - Full Width at Bottom */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              Recently Rejected ({rejectedAppointments?.length || 0})
            </h3>
            <button
              onClick={() => setRejectedExpanded(!rejectedExpanded)}
              className="filter-button"
              style={{ 
                padding: '4px 8px', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {rejectedExpanded ? 'Collapse' : 'Expand'}
              {rejectedExpanded ? '▲' : '▼'}
            </button>
          </div>
            
          {rejectedAppointments && rejectedAppointments.length > 0 && (
            <button
              onClick={() => setShowRejectedModal(true)}
              className="filter-button"
              style={{ 
                padding: '4px 8px', 
                fontSize: '12px',
                position: 'relative',
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              <Eye size={14} />
              View All
            </button>
          )}
        </div>
        
        {rejectedExpanded && (
          <div className="appointments-scroll-container">
            {rejectedAppointments && rejectedAppointments.length > 0 ? (
              rejectedAppointments.map((appointment) => (
                <div key={appointment.appointmentId} className="appointment-card rejected-card">
                  <div className="appointment-header">
                    <div>
                      <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {appointment.studentName}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {appointment.programSection}
                      </p>
                    </div>
                    <div style={{ 
                      background: '#fef2f2', 
                      color: '#dc2626', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      REJECTED
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0', textTransform: 'capitalize' }}>
                    {appointment.reason}
                  </p>
                  
                  {/* Rejection Reason */}
                  {appointment.rejectionReason && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#dc2626', 
                      margin: '0 0 8px 0',
                      background: '#fef2f2',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fecaca'
                    }}>
                      <strong>Reason:</strong> {appointment.rejectionReason}
                    </div>
                  )}

                  {/* Submission Date */}
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#9ca3af', 
                    margin: '0 0 8px 0',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FileText size={12} />
                    Rejected: {formatSubmissionDate(appointment.updatedAt)}
                  </div>
                
                  <div className="appointment-meta">
                    <span className="appointment-meta-item">
                      <Calendar size={14} />
                      {appointment.date}
                    </span>
                    <span className="appointment-meta-item">
                      <Clock size={14} />
                      {appointment.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} className="empty-icon" />
                <p>No rejected appointments</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showApprovedModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '420px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0 }}>
              Approved Students — {activeSlot ? new Date(activeSlot.date).toLocaleDateString() : ''} {activeSlot?.time}
            </h3>

            {approvedForSlot.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No approved students for this slot.</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {approvedForSlot.map(s => (
                  <div key={s.appointmentId} style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 0' }}>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{s.studentName}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{s.programSection}</div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>Reason: {s.reason}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      Approved at: {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="primary-button full-width" onClick={() => setShowApprovedModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px' }}>
            <h3>Set Available Time Slots</h3>
            
            <div className="form-group">
              <label className="label">Date</label>
              <input 
                type="date" 
                className="input" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="label">Max Appointments per Slot</label>
              <select 
                className="input"
                value={maxAppointments}
                onChange={(e) => setMaxAppointments(parseInt(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Time Slots</label>
              <div className="time-slot-grid">
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => {
                  // Check if this time has passed for today
                  const isToday = selectedDate === new Date().toISOString().split('T')[0];
                  let isPastTime = false;

                  if (isToday) {
                    const currentTime = new Date();
                    const currentHour = currentTime.getHours();
                    const currentMinute = currentTime.getMinutes();

                    const [timeStr, period] = time.split(' ');
                    const [hour, minute] = timeStr.split(':').map(Number);

                    let hour24 = hour;
                    if (period === 'PM' && hour !== 12) hour24 += 12;
                    if (period === 'AM' && hour === 12) hour24 = 0;

                    const timeInMinutes = hour24 * 60 + minute;
                    const currentTimeInMinutes = currentHour * 60 + currentMinute;

                    isPastTime = timeInMinutes <= currentTimeInMinutes;
                  }

                  return (
                    <button 
                      key={time} 
                      className={`time-slot-button ${selectedTimes.includes(time) ? 'selected' : ''} ${isPastTime ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isPastTime) return; // Don't allow selection of past times

                        if (selectedTimes.includes(time)) {
                          setSelectedTimes(selectedTimes.filter(t => t !== time));
                        } else {
                          setSelectedTimes([...selectedTimes, time]);
                        }
                      }}
                      disabled={isPastTime}
                      style={{
                        backgroundColor: selectedTimes.includes(time) ? '#0477BF' : 'white',
                        color: selectedTimes.includes(time) ? 'white' : '#374151',
                        opacity: isPastTime ? 0.5 : 1,
                        cursor: isPastTime ? 'not-allowed' : 'pointer'
                      }}
                      title={isPastTime ? 'This time has already passed' : ''}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                className="primary-button full-width"
                onClick={handleSaveTimeSlots}
              >
                Save Time Slots
              </button>
              <button 
                className="filter-button full-width"
                onClick={() => setShowTimeSlotModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD THE REJECTION MODAL HERE - right after the time slot modal */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '400px' }}>
              <h3>Reject Appointment</h3>

              <div className="form-group">
                <label className="label">Rejection Reason *</label>
                <textarea 
                  className="input" 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
        
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  className="primary-button full-width"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Appointment
                </button>
                <button 
                  className="filter-button full-width"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedAppointmentId(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      {showDeleteModal && slotToDelete && slotDetails && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '450px' }}>
            <h3 style={{ color: '#ef4444', marginTop: 0 }}>
              Delete Time Slot
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px' }}>
                Are you sure you want to <strong>permanently delete</strong> this time slot?
              </p>
              
              <div style={{ 
                background: '#f9fafb', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '12px'
              }}>
                <strong>Date:</strong> {new Date(slotToDelete.date).toLocaleDateString()}<br/>
                <strong>Time:</strong> {slotToDelete.time}<br/>
                <strong>Max Appointments:</strong> {slotToDelete.maxAppointments}
              </div>

              {slotDetails.appointmentCount > 0 ? (
                <div style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #f87171',
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
                    ❌ <strong>Cannot Delete:</strong> This slot has {slotDetails.appointmentCount} existing appointment(s).
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    <strong>Existing Appointments:</strong>
                    {slotDetails.appointments.map(app => (
                      <div key={app.appointmentId} style={{ marginLeft: '8px' }}>
                        • {app.studentName} ({app.status})
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b',
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                    ⚠️ <strong>Warning:</strong> This action cannot be undone. The time slot will be permanently removed.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="primary-button full-width"
                onClick={handleDeleteTimeSlot}
                disabled={!slotDetails.canDelete || loading[`delete-${slotToDelete.slotId}`]}
                style={{ 
                  backgroundColor: slotDetails.canDelete ? '#ef4444' : '#9ca3af',
                  cursor: slotDetails.canDelete ? 'pointer' : 'not-allowed'
                }}
              >
                {loading[`delete-${slotToDelete.slotId}`] ? 'Deleting...' : 'Delete Permanently'}
              </button>
              <button 
                className="filter-button full-width"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSlotToDelete(null);
                  setSlotDetails(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD THE DEACTIVATE CONFIRMATION MODAL HERE - right after the delete modal */}
      {showDeactivateModal && slotToDeactivate && slotDetails && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '450px' }}>
            <h3 style={{ color: slotToDeactivate.isActive ? '#f59e0b' : '#10b981', marginTop: 0 }}>
              {slotToDeactivate.isActive ? '⏸️ Deactivate' : '▶️ Activate'} Time Slot
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px' }}>
                {slotToDeactivate.isActive 
                  ? 'Are you sure you want to deactivate this time slot?' 
                  : 'Are you sure you want to activate this time slot?'
                }
              </p>
              
              <div style={{ 
                background: '#f9fafb', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '12px'
              }}>
                <strong>Date:</strong> {new Date(slotToDeactivate.date).toLocaleDateString()}<br/>
                <strong>Time:</strong> {slotToDeactivate.time}<br/>
                <strong>Current Status:</strong> {slotToDeactivate.isActive ? 'Active' : 'Inactive'}<br/>
                <strong>Existing Appointments:</strong> {slotDetails.appointmentCount}
              </div>

              {slotToDeactivate.isActive ? (
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b',
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                    ℹ️ <strong>Note:</strong> Deactivating will hide this slot from students, 
                    but existing appointments will remain unchanged. You can reactivate it later.
                  </p>
                </div>
              ) : (
                <div style={{ 
                  background: '#ecfdf5', 
                  border: '1px solid #10b981',
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#065f46' }}>
                    ✅ <strong>Note:</strong> Activating will make this slot available for new student bookings.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="primary-button full-width"
                onClick={handleToggleTimeSlot}
                disabled={loading[`toggle-${slotToDeactivate.slotId}`]}
                style={{ 
                  backgroundColor: slotToDeactivate.isActive ? '#f59e0b' : '#10b981'
                }}
              >
                {loading[`toggle-${slotToDeactivate.slotId}`] 
                  ? 'Processing...' 
                  : (slotToDeactivate.isActive ? 'Deactivate Slot' : 'Activate Slot')
                }
              </button>
              <button 
                className="filter-button full-width"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSlotToDeactivate(null);
                  setSlotDetails(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '700px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0 }}>
              Recent Appointment Activity
            </h3>
      
            {recentActivity.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No recent activity found.</p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={{ 
                    borderBottom: '1px solid #e5e7eb', 
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: activity.status === 'approved' ? '#10b981' : 
                                      activity.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      marginTop: '6px',
                      flexShrink: 0
                    }}></div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>
                            {activity.studentName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {activity.programSection}
                          </div>
                        </div>
                        <div style={{ 
                          background: activity.status === 'approved' ? '#ecfdf5' : 
                                     activity.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                          color: activity.status === 'approved' ? '#065f46' : 
                                 activity.status === 'rejected' ? '#991b1b' : '#92400e',
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}>
                          {activity.status}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                        <strong>Reason:</strong> {activity.reason}
                      </div>
                      
                      {activity.rejectionReason && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#dc2626', 
                          marginBottom: '8px',
                          background: '#fef2f2',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca'
                        }}>
                          <strong>Rejection Reason:</strong> {activity.rejectionReason}
                        </div>
                      )}

                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        <div>Appointment: {activity.date} at {activity.time}</div>
                        <div>Submitted: {formatSubmissionDate(activity.createdAt)}</div>
                        {activity.updatedAt && activity.updatedAt !== activity.createdAt && (
                          <div>Updated: {formatSubmissionDate(activity.updatedAt)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="primary-button full-width" onClick={() => setShowActivityModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Appointments Modal */}
{showRejectedModal && (
  <div className="modal-overlay">
    <div className="modal" style={{ width: '600px', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0 }}>
        All Rejected Appointments ({rejectedAppointments.length})
      </h3>

      {rejectedAppointments.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No rejected appointments found.</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {rejectedAppointments.map(appointment => (
            <div key={appointment.appointmentId} style={{ 
              borderBottom: '1px solid #e5e7eb', 
              padding: '16px 0' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>
                    {appointment.studentName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {appointment.programSection}
                  </div>
                </div>
                <div style={{ 
                  background: '#fef2f2', 
                  color: '#dc2626', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  REJECTED
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                <strong>Reason:</strong> {appointment.reason}
              </div>
              
              {appointment.rejectionReason && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#dc2626', 
                  marginBottom: '8px',
                  background: '#fef2f2',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <strong>Rejection Reason:</strong> {appointment.rejectionReason}
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                <div>Appointment: {appointment.date} at {appointment.time}</div>
                <div>Rejected: {formatSubmissionDate(appointment.updatedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button className="primary-button full-width" onClick={() => setShowRejectedModal(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default AppointmentApprovalView;