import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, CheckCircle, User, Home, Heart, GraduationCap, Briefcase } from 'lucide-react';
import '../styles/FormViews.css';

const InventoryFormView = ({ data, onBack }) => {
  const [activeSection, setActiveSection] = useState('basic');

  if (!data) {
    return (
      <div className="form-view-container">
        <div className="loading-container">
          <FileText size={48} className="empty-icon" />
          <h3 className="empty-title">No Inventory Form Data</h3>
          <p className="empty-description">Unable to load inventory form details.</p>
          <button onClick={onBack} className="primary-button" style={{ marginTop: '16px' }}>
            Back to Student Details
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'contact', label: 'Contact', icon: Home },
    { id: 'family', label: 'Family', icon: Heart },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'work', label: 'Work Experience', icon: Briefcase },
    { id: 'health', label: 'Health', icon: Heart }
  ];

  const renderBasicInfo = () => (
    <div className="form-sections-grid">
      <div className="form-section">
        <h3 className="form-section-title">Personal Information</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Full Name:</span>
            <span className="form-value">{data.fullName || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Nickname:</span>
            <span className="form-value">{data.nickname || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Student Number:</span>
            <span className="form-value">{data.studentNumber || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Program:</span>
            <span className="form-value">{data.program || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Gender:</span>
            <span className="form-value">{data.gender || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Birthday:</span>
            <span className="form-value">
              {data.birthday ? new Date(data.birthday).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Nationality:</span>
            <span className="form-value">{data.nationality || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Civil Status:</span>
            <span className="form-value">{data.civilStatus || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Religion:</span>
            <span className="form-value">{data.religion || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {data.civilStatus === 'Married' && (
        <div className="form-section">
          <h3 className="form-section-title">Spouse Information</h3>
          <div className="form-info-grid">
            <div className="form-info-item">
              <span className="form-label">Spouse Name:</span>
              <span className="form-value">{data.spouseName || 'N/A'}</span>
            </div>
            <div className="form-info-item">
              <span className="form-label">Spouse Age:</span>
              <span className="form-value">{data.spouseAge || 'N/A'}</span>
            </div>
            <div className="form-info-item">
              <span className="form-label">Spouse Occupation:</span>
              <span className="form-value">{data.spouseOccupation || 'N/A'}</span>
            </div>
            <div className="form-info-item">
              <span className="form-label">Spouse Contact:</span>
              <span className="form-value">{data.spouseContact || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContactInfo = () => (
    <div className="form-section">
      <h3 className="form-section-title">Contact Information</h3>
      <div className="form-info-grid">
        <div className="form-info-item">
          <span className="form-label">Phone Number:</span>
          <span className="form-value">{data.phoneNumber || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Primary Email:</span>
          <span className="form-value">{data.email1 || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Secondary Email:</span>
          <span className="form-value">{data.email2 || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Present Address:</span>
          <span className="form-value">{data.presentAddress || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Permanent Address:</span>
          <span className="form-value">{data.permanentAddress || 'N/A'}</span>
        </div>
        <div className="form-info-item full-width">
          <span className="form-label">Provincial Address:</span>
          <span className="form-value">{data.provincialAddress || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  const renderFamilyInfo = () => (
    <div className="form-sections-grid">
      <div className="form-section">
        <h3 className="form-section-title">Father's Information</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Name:</span>
            <span className="form-value">{data.fatherName || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Status:</span>
            <span className="form-value">{data.fatherStatus || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Occupation:</span>
            <span className="form-value">{data.fatherOccupation || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Contact:</span>
            <span className="form-value">{data.fatherContact || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Income:</span>
            <span className="form-value">{data.fatherIncome || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Mother's Information</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Name:</span>
            <span className="form-value">{data.motherName || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Status:</span>
            <span className="form-value">{data.motherStatus || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Occupation:</span>
            <span className="form-value">{data.motherOccupation || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Contact:</span>
            <span className="form-value">{data.motherContact || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Income:</span>
            <span className="form-value">{data.motherIncome || 'N/A'}</span>
          </div>
        </div>
      </div>

      {data.guardianName && (
        <div className="form-section">
          <h3 className="form-section-title">Guardian Information</h3>
          <div className="form-info-grid">
            <div className="form-info-item">
              <span className="form-label">Guardian Name:</span>
              <span className="form-value">{data.guardianName}</span>
            </div>
            <div className="form-info-item">
              <span className="form-label">Guardian Contact:</span>
              <span className="form-value">{data.guardianContact || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {data.siblings && data.siblings.length > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Siblings</h3>
          <div className="siblings-list">
            {data.siblings.map((sibling, index) => (
              <div key={index} className="sibling-item">
                <div className="sibling-info">
                  <span className="sibling-name">{sibling.name || 'N/A'}</span>
                  <span className="sibling-details">
                    Age: {sibling.age || 'N/A'} | Gender: {sibling.gender || 'N/A'}
                  </span>
                  <span className="sibling-occupation">
                    {sibling.programOrOccupation} at {sibling.schoolOrCompany}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEducationInfo = () => (
    <div className="form-section">
      <h3 className="form-section-title">Educational Background</h3>
      <div className="form-info-grid">
        <div className="form-info-item">
          <span className="form-label">Elementary:</span>
          <span className="form-value">{data.elementary || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Junior High School:</span>
          <span className="form-value">{data.juniorHigh || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">Senior High School:</span>
          <span className="form-value">{data.seniorHigh || 'N/A'}</span>
        </div>
        <div className="form-info-item">
          <span className="form-label">College:</span>
          <span className="form-value">{data.college || 'N/A'}</span>
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="form-section-title">Interests & Activities</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Sports:</span>
            <span className="form-value">{data.sports || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Hobbies:</span>
            <span className="form-value">{data.hobbies || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Talents:</span>
            <span className="form-value">{data.talents || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Socio-Civic Activities:</span>
            <span className="form-value">{data.socioCivic || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">School Organizations:</span>
            <span className="form-value">{data.schoolOrg || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkExperience = () => (
    <div className="form-section">
      <h3 className="form-section-title">Work Experience</h3>
      {data.workExperience && data.workExperience.length > 0 ? (
        <div className="work-experience-list">
          {data.workExperience.map((work, index) => (
            <div key={index} className="work-item">
              <div className="work-info">
                <span className="work-company">{work.company || 'N/A'}</span>
                <span className="work-position">{work.position || 'N/A'}</span>
                <span className="work-duration">{work.duration || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-description">No work experience recorded</p>
      )}
    </div>
  );

  const renderHealthInfo = () => (
    <div className="form-sections-grid">
      <div className="form-section">
        <h3 className="form-section-title">Health History</h3>
        <div className="form-info-grid">
          <div className="form-info-item">
            <span className="form-label">Ever been hospitalized:</span>
            <span className={`form-value ${data.wasHospitalized ? 'status-yes' : 'status-no'}`}>
              {data.wasHospitalized ? 'Yes' : 'No'}
            </span>
          </div>
          {data.wasHospitalized && (
            <div className="form-info-item full-width">
              <span className="form-label">Hospitalization reason:</span>
              <span className="form-value">{data.hospitalizedReason || 'N/A'}</span>
            </div>
          )}
          <div className="form-info-item">
            <span className="form-label">Had operation:</span>
            <span className={`form-value ${data.hadOperation ? 'status-yes' : 'status-no'}`}>
              {data.hadOperation ? 'Yes' : 'No'}
            </span>
          </div>
          {data.hadOperation && (
            <div className="form-info-item full-width">
              <span className="form-label">Operation reason:</span>
              <span className="form-value">{data.operationReason || 'N/A'}</span>
            </div>
          )}
          <div className="form-info-item">
            <span className="form-label">Has illness:</span>
            <span className={`form-value ${data.hasIllness ? 'status-yes' : 'status-no'}`}>
              {data.hasIllness ? 'Yes' : 'No'}
            </span>
          </div>
          {data.hasIllness && (
            <div className="form-info-item full-width">
              <span className="form-label">Illness details:</span>
              <span className="form-value">{data.illnessDetails || 'N/A'}</span>
            </div>
          )}
          <div className="form-info-item">
            <span className="form-label">Takes medication:</span>
            <span className={`form-value ${data.takesMedication ? 'status-yes' : 'status-no'}`}>
              {data.takesMedication ? 'Yes' : 'No'}
            </span>
          </div>
          {data.takesMedication && (
            <div className="form-info-item full-width">
              <span className="form-label">Medication details:</span>
              <span className="form-value">{data.medicationDetails || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Additional Health Information</h3>
        <div className="form-info-grid">
          <div className="form-info-item full-width">
            <span className="form-label">Family illness history:</span>
            <span className="form-value">{data.familyIllness || 'N/A'}</span>
          </div>
          <div className="form-info-item">
            <span className="form-label">Last doctor visit:</span>
            <span className="form-value">
              {data.lastDoctorVisit ? new Date(data.lastDoctorVisit).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Visit reason:</span>
            <span className="form-value">{data.visitReason || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Life Circumstances</h3>
        <div className="form-info-grid">
          <div className="form-info-item full-width">
            <span className="form-label">Loss experience:</span>
            <span className="form-value">{data.lossExperience || 'N/A'}</span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Problems:</span>
            <span className="form-value">{data.problems || 'N/A'}</span>
          </div>
          <div className="form-info-item full-width">
            <span className="form-label">Relationship concerns:</span>
            <span className="form-value">{data.relationshipConcerns || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'basic': return renderBasicInfo();
      case 'contact': return renderContactInfo();
      case 'family': return renderFamilyInfo();
      case 'education': return renderEducationInfo();
      case 'work': return renderWorkExperience();
      case 'health': return renderHealthInfo();
      default: return renderBasicInfo();
    }
  };

  return (
    <div className="form-view-container">
      {/* Header */}
      <div className="form-view-header">
        <div className="header-content">
          <div className="header-left">
              <button 
                onClick={onBack}
                className="student-back-button"
                type="button"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                Back to Student Details
              </button>
            <div className="header-divider"></div>
            <div className="form-title-section">
              <div className="form-title-with-icon">
                <FileText className="form-header-icon" size={24} />
                <div>
                  <h1 className="form-view-title">Individual Inventory Form</h1>
                  <p className="form-view-subtitle">Personal background information</p>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="form-status-indicator">
              <CheckCircle className="status-icon-success" size={16} />
              <span className="status-text">Submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="form-section-nav">
        <div className="section-nav-container">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
		            key={section.id} 
                onClick={() => setActiveSection(section.id)}
                className={`section-nav-button ${activeSection === section.id ? 'section-nav-active' : ''}`}
                type="button"
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="form-view-content">
        <div className="form-card">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default InventoryFormView;