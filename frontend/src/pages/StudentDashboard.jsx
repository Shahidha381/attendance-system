// frontend/src/pages/StudentDashboard.jsx

import { useEffect, useState } from "react";
import {
  Camera,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [attendanceData, setAttendanceData] = useState({
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendanceRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // LOAD USER + ATTENDANCE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    if (!data) {
      navigate("/login");
      return;
    }

    setUser(data);
    fetchAttendanceData();
  }, [navigate]);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/attendance/history/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.statistics);
        setRecentActivity(data.recentActivity);
      } else {
        console.error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.clear();

    navigate("/login");
  };

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────
  const handleMarkAttendance = () => {
    navigate("/mark-attendance");
  };

  const handleViewReports = () => {
    navigate("/attendance-reports");
  };

  const handleViewProfile = () => {
    navigate("/student/profile");
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>

          <p className="mt-4 text-gray-400">
            Loading your dashboard...
          </p>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAT CARD
  // ─────────────────────────────────────────────────────────────
  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-[#111111] rounded-2xl shadow-lg p-5 border border-gray-800">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-sm font-medium">
            {title}
          </p>

          <p className={`text-2xl font-bold ${color} mt-1`}>
            {value}
          </p>
        </div>

        <div
          className={`p-3 rounded-xl ${
            color === "text-green-500"
              ? "bg-green-500/10"
              : color === "text-yellow-500"
              ? "bg-yellow-500/10"
              : color === "text-red-500"
              ? "bg-red-500/10"
              : "bg-white/10"
          }`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>

      </div>

    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-[#0d0d0d] border-b border-gray-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold text-white">
                FaceAttend
              </h1>

              <p className="text-gray-400 mt-1">
                Welcome back,{" "}
                <span className="font-semibold text-white">
                  {user.name || "Student"}!
                </span>
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Mark your attendance using face recognition
              </p>

            </div>

            <div className="flex items-center space-x-4">

              {/* USER */}
              <div className="hidden md:flex items-center space-x-3">

                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">

                  <User className="w-5 h-5 text-black" />

                </div>

                <div className="text-right">

                  <p className="text-sm font-medium text-white">
                    {user.name || "Student"}
                  </p>

                  <p className="text-xs text-gray-500">
                    Student
                  </p>

                </div>

              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors duration-200 border border-red-500/20"
              >

                <LogOut className="w-4 h-4" />

                <span className="hidden sm:inline text-sm font-medium">
                  Logout
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <StatCard
            title="Total Days"
            value={attendanceData.totalDays}
            color="text-white"
            icon={Calendar}
          />

          <StatCard
            title="Present"
            value={attendanceData.present}
            color="text-green-500"
            icon={CheckCircle}
          />

          <StatCard
            title="Late"
            value={attendanceData.late}
            color="text-yellow-500"
            icon={Clock}
          />

          <StatCard
            title="Absent"
            value={attendanceData.absent}
            color="text-red-500"
            icon={XCircle}
          />

        </div>

        {/* ATTENDANCE RATE */}
        <div className="bg-[#111111] rounded-2xl shadow-lg border border-gray-800 p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-gray-400 text-sm font-medium">
                Attendance Rate
              </p>

              <p className="text-4xl font-bold text-white mt-1">
                {attendanceData.attendanceRate}%
              </p>

            </div>

            <div className="mt-4 md:mt-0">

              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-black">

                {attendanceData.attendanceRate >= 75
                  ? "Good attendance"
                  : "Needs improvement"}

              </span>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="mt-5">

            <div className="w-full bg-gray-800 rounded-full h-3">

              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${attendanceData.attendanceRate}%`,
                }}
              ></div>

            </div>

          </div>

        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* RECENT ACTIVITY */}
          <div className="bg-[#111111] rounded-2xl shadow-lg border border-gray-800">

            <div className="border-b border-gray-800 p-6">

              <h2 className="text-xl font-semibold text-white">
                Recent Activity
              </h2>

            </div>

            <div className="divide-y divide-gray-800">

              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-[#1a1a1a] transition-colors"
                  >

                    <div className="flex items-center justify-between mb-2">

                      <div className="flex items-center space-x-3">

                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.status === "Present"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>

                        <p
                          className={`font-semibold ${
                            activity.status === "Present"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {activity.status}
                        </p>

                      </div>

                      <p className="text-sm text-gray-500">
                        {activity.date}
                      </p>

                    </div>

                    <div>

                      {activity.time && (
                        <p className="text-sm text-gray-300">
                          {activity.time}
                        </p>
                      )}

                      {activity.match && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.match}
                        </p>
                      )}

                    </div>

                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No attendance records found
                </div>
              )}

            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-4">

            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>

            {/* MARK ATTENDANCE */}
            <button
              onClick={handleMarkAttendance}
              className="w-full bg-white hover:bg-gray-200 text-black rounded-2xl p-6 shadow-lg transition-all transform hover:scale-[1.02]"
            >

              <div className="flex items-center justify-between">

                <div className="text-left">

                  <div className="flex items-center space-x-2 mb-2">

                    <Camera className="w-5 h-5" />

                    <p className="font-semibold text-lg">
                      Mark Attendance
                    </p>

                  </div>

                  <p className="text-gray-700 text-sm">
                    Use face recognition
                  </p>

                </div>

                <div className="bg-black/10 rounded-full p-2">

                  <Camera className="w-6 h-6" />

                </div>

              </div>

            </button>

            {/* REPORTS */}
            <button
              onClick={handleViewReports}
              className="w-full bg-[#111111] border border-gray-800 hover:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg transition-all"
            >

              <div className="flex items-center justify-between">

                <div className="text-left">

                  <div className="flex items-center space-x-2 mb-2">

                    <FileText className="w-5 h-5 text-white" />

                    <p className="font-semibold text-lg text-white">
                      View Reports
                    </p>

                  </div>

                  <p className="text-gray-500 text-sm">
                    Attendance history
                  </p>

                </div>

                <div className="bg-white/10 rounded-full p-2">

                  <FileText className="w-6 h-6 text-white" />

                </div>

              </div>

            </button>

            {/* PROFILE */}
            <button
              onClick={handleViewProfile}
              className="w-full bg-[#111111] border border-gray-800 hover:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg transition-all"
            >

              <div className="flex items-center justify-between">

                <div className="text-left">

                  <div className="flex items-center space-x-2 mb-2">

                    <User className="w-5 h-5 text-white" />

                    <p className="font-semibold text-lg text-white">
                      My Profile
                    </p>

                  </div>

                  <p className="text-gray-500 text-sm">
                    Update your details
                  </p>

                </div>

                <div className="bg-white/10 rounded-full p-2">

                  <User className="w-6 h-6 text-white" />

                </div>

              </div>

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;