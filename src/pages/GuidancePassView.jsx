import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Clock, User, CheckCircle, X } from 'lucide-react';
import '../styles/Dashboard.css';
import axios from 'axios';

const GuidancePassView = () => {
  const [guidancePasses, setGuidancePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [passToDeactivate, setPassToDeactivate] = useState(null);

  useEffect(() => {
    fetchGuidancePasses();
  }, []);

  const fetchGuidancePasses = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('authToken');
    const { data } = await axios.get(
      `https://guidanceofficeapi-production.up.railway.app/api/guidancepass`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setGuidancePasses(Array.isArray(data) ? data : []); // <- changed
  } catch (err) {
    console.error('Error fetching guidance passes:', err);
    setError(err?.response?.data || err.message || 'Failed to fetch guidance passes');
    setGuidancePasses([]); // <- changed
  } finally {
    setLoading(false);
  }
};

  const handleViewPass = (pass) => {
    setSelectedPass(pass);
    setShowPassModal(true);
  };

  const handleDeactivateSlot = (pass) => {
    setPassToDeactivate(pass);
    setShowDeactivateModal(true);
  };

  const confirmDeactivateSlot = async () => {
    if (!passToDeactivate) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://guidanceofficeapi-production.up.railway.app/api/guidancepass/deactivate-slot/${passToDeactivate.appointmentId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      alert('Time slot deactivated successfully. Student can now make new appointments.');
      setGuidancePasses(prev => prev.filter(p => p.appointmentId !== passToDeactivate.appointmentId));
      setShowDeactivateModal(false);
      setPassToDeactivate(null);
      fetchGuidancePasses(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating slot:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const generateGuidancePassPDF = (pass) => {
    // Create a simple HTML preview that can be printed
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Guidance Pass - ${pass.appointment.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0477BF; }
          .pass-title { font-size: 20px; margin: 10px 0; }
          .pass-content { border: 2px solid #0477BF; padding: 20px; margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; border-bottom: 1px solid #000; padding: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">STI</div>
          <div>STI Guidance and Counseling Office</div>
          <div class="pass-title">Guidance Pass</div>
        </div>
        
        <div class="pass-content">
          <div class="field">
            <span class="label">Date:</span> ${new Date(pass.issuedDate).toLocaleDateString()}
          </div>
          <div class="field">
            <span class="label">Student's Name:</span> ${pass.appointment.studentName}
          </div>
          <div class="field">
            <span class="label">Program and Section:</span> ${pass.appointment.programSection}
          </div>
          <div class="field">
            <span class="label">Room Number:</span> ________________
          </div>
          <div class="field">
            <span class="label">Time Started:</span> ${pass.appointment.time}
          </div>
          <div class="field">
            <span class="label">Time Ended:</span> ________________
          </div>
          <div class="field">
            <span class="label">Prepared by:</span> ${pass.counselor.name}
          </div>
          ${pass.notes ? `<div class="field"><span class="label">Notes:</span> ${pass.notes}</div>` : ''}
        </div>
        
        <div class="signature-section">
          <div>
            <div class="signature-box"></div>
            <div>Name and Signature of Guidance Counselor/Associate</div>
          </div>
          <div>
            <div class="signature-box"></div>
            <div>Name and Signature of Teacher/Professor</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="page-title">STI Guidance and Counseling Office Guidance Pass</h2>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Loading guidance passes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Guidance Pass</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchGuidancePasses}
            className="filter-button"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Issued Guidance Passes ({guidancePasses.length})</h3>
        
        {guidancePasses.length > 0 ? (
          <div className="appointments-scroll-container">
            {guidancePasses.map((pass) => (
              <div key={pass.passId} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {pass.appointment.studentName}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {pass.appointment.programSection}
                    </p>
                  </div>
                  <div style={{ 
                    background: '#ecfdf5', 
                    color: '#065f46', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    PASS ISSUED
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Calendar size={14} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {formatDate(pass.appointment.date)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={14} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {pass.appointment.time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      Issued by: {pass.counselor.name}
                    </span>
                  </div>
                </div>

                {pass.notes && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6b7280', 
                    marginBottom: '12px',
                    fontStyle: 'italic'
                  }}>
                    Notes: {pass.notes}
                  </div>
                )}

                <div style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af', 
                  marginBottom: '12px'
                }}>
                  Issued: {formatDate(pass.issuedDate)}
                </div>

                <div className="appointment-actions">
                  <button
                    onClick={() => handleViewPass(pass)}
                    className="filter-button"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => generateGuidancePassPDF(pass)}
                    className="primary-button"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Download size={14} />
                    Print
                  </button>
                  <button
                    onClick={() => handleDeactivateSlot(pass)}
                    className="reject-button"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <X size={14} />
                    Deactivate Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p>No guidance passes issued yet</p>
          </div>
        )}
      </div>

      {/* Add modals for viewing and deactivating passes */}
      {showPassModal && selectedPass && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '480px', textAlign: 'left' }}>
              <h3 style={{ marginTop: 0 }}>Guidance Pass</h3>
              <div style={{ fontSize: 14, color: '#374151' }}>
                <div style={{ marginBottom: 8 }}><strong>Student:</strong> {selectedPass.appointment?.studentName}</div>
                <div style={{ marginBottom: 8 }}><strong>Program/Section:</strong> {selectedPass.appointment?.programSection}</div>
                <div style={{ marginBottom: 8 }}><strong>Appointment Date:</strong> {formatDate(selectedPass.appointment?.date)}</div>
                <div style={{ marginBottom: 8 }}><strong>Appointment Time:</strong> {selectedPass.appointment?.time}</div>
                <div style={{ marginBottom: 8 }}><strong>Issued:</strong> {formatDate(selectedPass.issuedDate)}</div>
                <div style={{ marginBottom: 8 }}><strong>Issued By:</strong> {selectedPass.counselor?.name}</div>
                {selectedPass.notes && (<div style={{ marginBottom: 8 }}><strong>Notes:</strong> {selectedPass.notes}</div>)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="primary-button full-width" onClick={() => setShowPassModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showDeactivateModal && passToDeactivate && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '420px', textAlign: 'left' }}>
              <h3 style={{ marginTop: 0, color: '#f59e0b' }}>Deactivate Slot</h3>
              <p>Deactivate the time slot for {passToDeactivate.appointment?.studentName}?</p>
              <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', padding: 12, borderRadius: 6, fontSize: 14, color: '#92400e' }}>
                This will mark the appointment as completed and free the student to book again.
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="primary-button full-width" onClick={confirmDeactivateSlot} style={{ backgroundColor: '#f59e0b' }}>
                  Deactivate
                </button>
                <button className="filter-button full-width" onClick={() => { setShowDeactivateModal(false); setPassToDeactivate(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

            </div>
          );
        };

export default GuidancePassView;