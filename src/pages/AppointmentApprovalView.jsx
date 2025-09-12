import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, FileText, Plus, Trash2, Edit } from 'lucide-react';
import '../styles/Dashboard.css';
import axios from 'axios';

const AppointmentApprovalView = ({ pendingAppointments, onAppointmentUpdate }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [maxAppointments, setMaxAppointments] = useState(3);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [approvedForSlot, setApprovedForSlot] = useState([]);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch available time slots
  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  // Add this useEffect after your existing fetchAvailableSlots useEffect
useEffect(() => {
  const interval = setInterval(async () => {
    setIsRefreshing(true);
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate();
    }
    await fetchAvailableSlots();
    
    setIsRefreshing(false);
  }, 2000); //2 seconds

  return () => clearInterval(interval);
}, [onAppointmentUpdate]);

  const fetchAvailableSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot',
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

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/bulk',
        {
          date: selectedDate,
          times: selectedTimes,
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

  const handleDeleteTimeSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/${slotId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      alert('Time slot deleted successfully');
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };


  
  const handleToggleTimeSlot = async (slotId, isActive) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `https://guidanceofficeapi-production.up.railway.app/api/availabletimeslot/${slotId}/toggle`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      alert(`Time slot ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error toggling time slot:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
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
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate();
    }

    // Refresh available slots to update counts
    fetchAvailableSlots();

    alert(`Appointment approved successfully for ${response.data.appointment.studentName}`);
    
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
const handleReject = async (appointmentId) => {
  setLoading(prev => ({ ...prev, [appointmentId]: 'rejecting' }));
  setError(null);

  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
      `https://guidanceofficeapi-production.up.railway.app/api/guidanceappointment/${appointmentId}/reject`,
      {},
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

    // Refresh available slots to update counts
    fetchAvailableSlots();

    alert(`Appointment rejected successfully for ${response.data.appointment.studentName}`);
    
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    setError(error.response?.data?.message || error.message);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    setLoading(prev => ({ ...prev, [appointmentId]: null }));
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
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          Appointment Approval
          {isRefreshing && <span style={{ fontSize: '12px', color: '#6b7280' }}> (refreshing...)</span>}
          </h2>
        <button
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
        </button>
      </div>
      
      <div className="grid grid-cols-2">
        {/* Pending Appointments with Scroll */}
        <div className="card">
          <h3 className="card-title">Pending Appointments ({pendingAppointments?.length || 0})</h3>
          
          <div className="appointments-scroll-container">
            {pendingAppointments && pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment) => (
                <div key={appointment.appointmentId} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {appointment.studentName}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {appointment.programSection}
                      </p>
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
                        onClick={() => handleReject(appointment.appointmentId)}
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
        
        {/* Available Time Slots */}
        <div className="card">
          <h3 className="card-title">Available Time Slots</h3>
          <div className="time-slots-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {Object.keys(groupedSlots).length > 0 ? (
              Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date} style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                    {date}
                  </h4>
                  <div className="time-slot-grid">
                    {slots.map((slot) => (
                      <div key={slot.slotId} className="time-slot-item" style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: slot.isActive ? 'white' : '#f9fafb',
                        opacity: slot.isActive ? 1 : 0.6
                      }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{slot.time}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                            ({slot.currentAppointmentCount}/{slot.maxAppointments})
                          </span>
                          {slot.currentAppointmentCount < slot.maxAppointments && (
                          <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '8px' }}>
                          ({slot.maxAppointments - slot.currentAppointmentCount} available)
                          </span>
                        )}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => fetchApprovedForSlot(slot)}
                            style={{
                              padding: '4px',
                              border: 'none',
                              background: '#0477BF',
                              color: 'white',
                              borderRadius: '4px',
                              position: 'relative',
                              zIndex: 9999,
                              pointerEvents: 'auto',
                              cursor: 'pointer'
                            }}
                            title="View approved students"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleTimeSlot(slot.slotId, slot.isActive)}
                            style={{
                              padding: '4px',
                              border: 'none',
                              background: slot.isActive ? '#fbbf24' : '#10b981',
                              color: 'white',
                              borderRadius: '4px',
                              position: 'relative',
                              zIndex: 9999,
                              pointerEvents: 'auto',
                              cursor: 'pointer'
                            }}
                            title={slot.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {slot.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDeleteTimeSlot(slot.slotId)}
                            style={{
                              padding: '4px',
                              border: 'none',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '4px',
                              position: 'relative',
                              zIndex: 9999,
                              pointerEvents: 'auto',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button 
                    key={time} 
                    className={`time-slot-button ${selectedTimes.includes(time) ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedTimes.includes(time)) {
                        setSelectedTimes(selectedTimes.filter(t => t !== time));
                      } else {
                        setSelectedTimes([...selectedTimes, time]);
                      }
                    }}
                    style={{
                      backgroundColor: selectedTimes.includes(time) ? '#0477BF' : 'white',
                      color: selectedTimes.includes(time) ? 'white' : '#374151'
                    }}
                  >
                    {time}
                  </button>
                ))}
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
    </div>
  );
};

export default AppointmentApprovalView;