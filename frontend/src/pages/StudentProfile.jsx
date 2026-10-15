import { useEffect, useState } from "react";
import {
  User,
  Mail,
  IdCard,
  Calendar as CalendarIcon,
  Camera,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const [user, setUser] = useState(null);

  const [isUpdatingFace, setIsUpdatingFace] = useState(false);

  const [faceImage, setFaceImage] = useState(null);

  const [uploadStatus, setUploadStatus] = useState(null);

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
    navigate("/student-dashboard");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser(user);
    }

    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setSaveStatus({
      type: "loading",
      message: "Saving changes...",
    });

    try {
      localStorage.setItem(
        "user",
        JSON.stringify(editedUser)
      );

      setUser(editedUser);

      setTimeout(() => {
        setSaveStatus({
          type: "success",
          message: "Profile updated successfully!",
        });

        setIsEditing(false);

        setTimeout(() => setSaveStatus(null), 3000);
      }, 1000);

    } catch (error) {
      setSaveStatus({
        type: "error",
        message:
          "Failed to update profile. Please try again.",
      });

      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleUpdateFace = () => {
    document.getElementById("faceImageInput").click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadStatus({
          type: "error",
          message: "Please upload an image file",
        });

        setTimeout(() => setUploadStatus(null), 3000);

        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({
          type: "error",
          message:
            "Image size should be less than 5MB",
        });

        setTimeout(() => setUploadStatus(null), 3000);

        return;
      }

      setIsUpdatingFace(true);

      const reader = new FileReader();

      reader.onloadend = () => {
        setFaceImage(reader.result);
      };

      reader.readAsDataURL(file);

      setTimeout(() => {
        setUploadStatus({
          type: "success",
          message: "Face registered successfully!",
        });

        setTimeout(() => setUploadStatus(null), 3000);

        setIsUpdatingFace(false);
      }, 1500);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>

          <p className="mt-4 text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );

  const userProfile = {
    name: user.name || "John Doe",
    role: "Student",
    email: user.email || "john.doe@university.edu",
    studentId: user.studentId || "STU2024001",
    phone: user.phone || "+1 234 567 8900",
    department:
      user.department || "Computer Science",
    semester: user.semester || "6th Semester",
    status: "Active",
    memberSince:
      user.memberSince || "January 15, 2024",
    faceRegistered:
      user.faceRegistered || true,
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-center justify-between">

            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >

              <ArrowLeft className="w-5 h-5" />

              <span>Back to Dashboard</span>

            </button>

            {!isEditing ? (

              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >

                <Edit2 className="w-4 h-4" />

                <span>Edit Profile</span>

              </button>

            ) : (

              <div className="flex items-center space-x-3">

                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >

                  <X className="w-4 h-4" />

                  <span>Cancel</span>

                </button>

                <button
                  onClick={handleSaveChanges}
                  className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors"
                  disabled={saveStatus?.type === "loading"}
                >

                  <Save className="w-4 h-4" />

                  <span>Save Changes</span>

                </button>

              </div>

            )}

          </div>

          <div className="mt-4">

            <h1 className="text-3xl font-bold text-white">
              FaceAttend
            </h1>

            <p className="text-gray-400 mt-1">
              Your Profile Information
            </p>

          </div>

        </div>

      </div>

      {/* STATUS */}
      {saveStatus && (

        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            saveStatus.type === "success"
              ? "bg-green-900/30 border border-green-700"
              : saveStatus.type === "error"
              ? "bg-red-900/30 border border-red-700"
              : "bg-zinc-900 border border-zinc-700"
          }`}
        >

          <div className="flex items-center space-x-2">

            {saveStatus.type === "success" && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}

            {saveStatus.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}

            {saveStatus.type === "loading" && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}

            <p className="text-sm text-white">
              {saveStatus.message}
            </p>

          </div>

        </div>

      )}

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PROFILE */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mb-6">

          <div className="flex items-center space-x-4">

            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">

              <User className="w-10 h-10 text-white" />

            </div>

            <div className="flex-1">

              {isEditing ? (

                <input
                  type="text"
                  name="name"
                  value={
                    editedUser.name || userProfile.name
                  }
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-white bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 focus:outline-none"
                  placeholder="Full Name"
                />

              ) : (

                <h2 className="text-2xl font-bold text-white">
                  {userProfile.name}
                </h2>

              )}

              <p className="text-gray-400 mt-1">
                {userProfile.role}
              </p>

            </div>

          </div>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* DETAILS */}
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800">

            <div className="border-b border-zinc-800 p-6">

              <h3 className="text-xl font-semibold text-white">
                Account Details
              </h3>

            </div>

            <div className="p-6 space-y-5">

              {/* EMAIL */}
              <div className="flex items-start space-x-3">

                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-400">
                    Email Address
                  </p>

                  {isEditing ? (

                    <input
                      type="email"
                      name="email"
                      value={
                        editedUser.email ||
                        userProfile.email
                      }
                      onChange={handleInputChange}
                      className="w-full text-white bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 mt-1"
                    />

                  ) : (

                    <p className="text-white mt-1">
                      {userProfile.email}
                    </p>

                  )}

                </div>

              </div>

              {/* STUDENT ID */}
              <div className="flex items-start space-x-3">

                <IdCard className="w-5 h-5 text-gray-400 mt-0.5" />

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-400">
                    Student ID
                  </p>

                  <p className="text-white mt-1">
                    {userProfile.studentId}
                  </p>

                </div>

              </div>

              {/* PHONE */}
              <div className="flex items-start space-x-3">

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-400">
                    Phone Number
                  </p>

                  <p className="text-white mt-1">
                    {userProfile.phone}
                  </p>

                </div>

              </div>

              {/* DEPARTMENT */}
              <div className="flex items-start space-x-3">

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-400">
                    Department
                  </p>

                  <p className="text-white mt-1">
                    {userProfile.department}
                  </p>

                </div>

              </div>

              {/* SEMESTER */}
              <div className="flex items-start space-x-3">

                <div className="flex-1">

                  <p className="text-sm font-medium text-gray-400">
                    Semester
                  </p>

                  <p className="text-white mt-1">
                    {userProfile.semester}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;