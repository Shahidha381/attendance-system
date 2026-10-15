// TeacherProfile.jsx
import { useEffect, useState } from "react";
import { User, Mail, IdCard, Calendar as CalendarIcon, ArrowLeft, Edit2, Save, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data) {
      navigate("/login");
      return;
    }
    setUser(data);
    setEditedUser(data);
  }, [navigate]);

  const handleGoBack = () => {
    navigate("/teacher-dashboard");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    setSaveStatus({ type: 'loading', message: 'Saving changes...' });
    
    try {
      localStorage.setItem("user", JSON.stringify(editedUser));
      setUser(editedUser);
      
      setTimeout(() => {
        setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setSaveStatus(null), 3000);
      }, 1000);
      
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to update profile.' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  const teacherProfile = {
    name: user.name || "Dr. Sarah Williams",
    role: "Teacher",
    email: user.email || "prof.williams@university.edu",
    teacherId: user.teacherId || "TCH2024001",
    status: "Active",
    memberSince: user.memberSince || "January 10, 2024"
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="bg-[#0d0d0d] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={saveStatus?.type === 'loading'}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500 mt-1">My Profile</p>
          </div>
        </div>
      </div>

      {/* Save Status Notification */}
      {saveStatus && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          saveStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 
          saveStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {saveStatus.type === 'error' && <X className="w-5 h-5 text-red-400" />}
            {saveStatus.type === 'loading' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            <p className={`text-sm ${
              saveStatus.type === 'success' ? 'text-green-400' : 
              saveStatus.type === 'error' ? 'text-red-400' :
              'text-blue-400'
            }`}>{saveStatus.message}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header */}
        <div className="bg-[#111111] rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser.name || teacherProfile.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-white bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                  placeholder="Full Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{teacherProfile.name}</h2>
              )}
              <p className="text-gray-500 mt-1">{teacherProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-[#111111] rounded-xl border border-gray-800">
          <div className="border-b border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white">Account Details</h3>
          </div>
          <div className="p-6 space-y-5">

            {/* Email Address */}
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email || teacherProfile.email}
                    onChange={handleInputChange}
                    className="w-full text-white bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-white mt-1">{teacherProfile.email}</p>
                )}
              </div>
            </div>

            {/* Teacher ID */}
            <div className="flex items-start space-x-3">
              <IdCard className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Teacher ID</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="teacherId"
                    value={editedUser.teacherId || teacherProfile.teacherId}
                    onChange={handleInputChange}
                    className="w-full text-white bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-white mt-1">{teacherProfile.teacherId}</p>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    {teacherProfile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-white mt-1">{teacherProfile.memberSince}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;