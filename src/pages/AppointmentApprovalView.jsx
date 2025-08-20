import React from 'react';
import { Calendar, Check, X, Clock, FileText } from 'lucide-react';
import '../styles/Dashboard.css';

const AppointmentApprovalView = ({ pendingAppointments }) => {
  const handleApprove = (appointmentId) => {
    console.log('Approved appointment:', appointmentId);
    //Approval logic
  };

  const handleReject = (appointmentId) => {
    console.log('Rejected appointment:', appointmentId);
    //Rejection logic
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
        <h2 className="page-title">Appointment Approval</h2>
        <button className="primary-button">
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
          <div>
            <div className="form-group">
              <label className="label">Date</label>
              <input type="date" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Time Slots</label>
              <div className="time-slot-grid">
                {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button key={time} className="time-slot-button">
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-button full-width">
              Update Available Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentApprovalView;