import React, { useState } from 'react';
import { Users, TrendingUp, FileText, Calendar, ClipboardList, CheckSquare, UserCheck, Plus, Search, Filter, Bell, Settings, LogOut, Eye, Edit, Trash2, Check, X, Clock } from 'lucide-react';

const GuidanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('students'); //similar to onCreate 
  const [searchTerm, setSearchTerm] = useState(''); //for search

  // Sample data
  const students = [
    { id: 1, name: 'John Doe', grade: '12', section: 'A', status: 'Active', lastMood: 'Happy', consultations: 3 },
    { id: 2, name: 'Jane Smith', grade: '11', section: 'B', status: 'Active', lastMood: 'Stressed', consultations: 1 },
    { id: 3, name: 'Mike Johnson', grade: '10', section: 'C', status: 'Active', lastMood: 'Neutral', consultations: 5 },
    { id: 4, name: 'Sarah Wilson', grade: '12', section: 'A', status: 'Active', lastMood: 'Anxious', consultations: 2 },
  ];

  const pendingAppointments = [
    { id: 1, student: 'John Doe', grade: '12-A', reason: 'Academic counseling', date: '2024-08-10', time: '10:00 AM', status: 'pending' },
    { id: 2, student: 'Jane Smith', grade: '11-B', reason: 'Career guidance', date: '2024-08-11', time: '2:00 PM', status: 'pending' },
    { id: 3, student: 'Mike Johnson', grade: '10-C', reason: 'Personal issues', date: '2024-08-12', time: '9:00 AM', status: 'pending' },
  ];

  const moodData = [
    { mood: 'Mild', count: 45, color: '#22c55e' },
    { mood: 'Moderate', count: 32, color: '#64748b' },
    { mood: 'High', count: 28, color: '#f59e0b' },
  ];

  const sidebarItems = [
    { id: 'students', icon: Users, label: 'Students List' },
    { id: 'appointments', icon: Calendar, label: 'Appointment Approval' },
    { id: 'endorsement', icon: FileText, label: 'Endorsement Forms' },
    { id: 'consultation', icon: ClipboardList, label: 'Consultation Forms' },
    { id: 'notes', icon: Edit, label: 'Counseling Notes' },
    { id: 'pass', icon: UserCheck, label: 'Guidance Pass' },
    { id: 'mood', icon: TrendingUp, label: 'Mood Insights' },
  ];

  const renderStudentsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Students List</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} />
          Add Student
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <Filter size={20} />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade & Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Mood</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">Grade {student.grade} - {student.section}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.lastMood === 'Happy' ? 'bg-green-100 text-green-800' :
                      student.lastMood === 'Stressed' ? 'bg-yellow-100 text-yellow-800' :
                      student.lastMood === 'Anxious' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.lastMood}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.consultations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAppointmentApproval = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Appointment Approval</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Calendar size={20} />
          Set Available Times
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Appointments</h3>
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{appointment.student}</h4>
                    <p className="text-sm text-gray-600">{appointment.grade}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">
                      <Check size={16} />
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{appointment.reason}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {appointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {appointment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
              <div className="grid grid-cols-2 gap-2">
                {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button key={time} className="border border-gray-300 hover:bg-blue-50 hover:border-blue-500 px-3 py-2 rounded text-sm">
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
              Update Available Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGenericForm = (title, description) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={20} />
              Create New
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>
        
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No {title.toLowerCase()} found. Click "Create New" to get started.</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return renderStudentsList();
      case 'mood':
        return renderMoodInsights();
      case 'appointments':
        return renderAppointmentApproval();
      case 'endorsement':
        return renderGenericForm('Endorsement Forms', 'Manage custody and endorsement forms for students.');
      case 'consultation':
        return renderGenericForm('Consultation Forms', 'Create and manage consultation and conference forms.');
      case 'notes':
        return renderGenericForm('Counseling Notes', 'Keep track of guidance and counseling session notes.');
      case 'pass':
        return renderGenericForm('Guidance Pass', 'Generate guidance passes for approved students.');
      default:
        return renderStudentsList();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold text-white">Guidance Portal</h1>
          <p className="text-blue-100 text-sm">Counselor Dashboard</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              GC
            </div>
            <div>
              <p className="font-medium text-gray-800">Guidance Counselor</p>
              <p className="text-sm text-gray-500">counselor@school.edu</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 p-2 rounded flex items-center justify-center">
              <Settings size={16} />
            </button>
            <button className="flex-1 bg-red-100 hover:bg-red-200 p-2 rounded flex items-center justify-center text-red-600">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">Manage student guidance and counseling</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 font-semibold">
                GC
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default GuidanceDashboard;