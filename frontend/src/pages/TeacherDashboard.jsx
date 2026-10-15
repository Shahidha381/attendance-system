// src/pages/TeacherDashboard.jsx

import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // AUTH + LOAD
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    if (!data) {
      navigate("/login");
      return;
    }

    setUser(data);

    fetchDashboardData();
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────
  // FETCH DASHBOARD DATA
  // ─────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      // STUDENTS
      const studentsRes = await fetch(
        `${API_BASE}/api/users/students/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // REPORTS
      const reportsRes = await fetch(
        `${API_BASE}/api/attendance/teacher-reports/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let studentsData = [];
      let reportsData = { records: [] };

      try {
        studentsData = await studentsRes.json();
      } catch {
        studentsData = [];
      }

      try {
        reportsData = await reportsRes.json();
      } catch {
        reportsData = { records: [] };
      }

      const records = reportsData.records || [];

      // TODAY RECORDS
      const today = new Date().toDateString();

      const todayRecords = records.filter((r) => {
        return (
          new Date(r.raw_date).toDateString() === today
        );
      });

      const presentToday = todayRecords.filter(
        (r) => r.status === "Present"
      ).length;

      const absentToday = todayRecords.filter(
        (r) => r.status === "Absent"
      ).length;

      const attendanceRate =
        todayRecords.length > 0
          ? Math.round(
              (presentToday / todayRecords.length) * 100
            )
          : 0;

      setStats({
        totalStudents: studentsData.length || 0,
        presentToday,
        absentToday,
        attendanceRate,
      });

      // RECENT ACTIVITY
      const recent = records
        .slice(0, 5)
        .map((r) => ({
          student: r.student_name,
          status: r.status,
          date: r.date,
          time: r.time_in || "—",
          confidence: r.confidence || "—",
        }));

      setRecentActivity(recent);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────
  const handleViewProfile = () => {
    navigate("/teacher/profile");
  };

  const handleManageStudents = () => {
    navigate("/teacher/students");
  };

  const handleViewAnalytics = () => {
    navigate("/teacher/reports");
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>

          <p className="mt-4 text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAT CARD
  // ─────────────────────────────────────────────────────────────
  const StatCard = ({
    title,
    value,
    color,
    icon: Icon,
  }) => (
    <div className="bg-[#111111] rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400 font-medium">
            {title}
          </p>

          <p className={`text-3xl font-bold mt-2 ${color}`}>
            {value}
          </p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-3">
          <Icon className={`w-6 h-6 ${color}`} />
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
      <div className="bg-[#0d0d0d] border-b border-gray-800 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-white">
              Teacher Dashboard
            </h1>

            <p className="text-gray-400 mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-white">
                {user.name || "Teacher"}
              </span>
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Monitor attendance and manage students
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* USER */}
            <div className="hidden md:flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {user.name || "Teacher"}
                </p>

                <p className="text-xs text-gray-500">
                  Teacher
                </p>
              </div>

            </div>

            {/* REFRESH */}
            <button
              onClick={fetchDashboardData}
              className="p-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />

              <span className="hidden sm:inline text-sm font-medium">
                Logout
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <StatCard
            title="Students"
            value={stats.totalStudents}
            color="text-blue-400"
            icon={Users}
          />

          <StatCard
            title="Present Today"
            value={stats.presentToday}
            color="text-green-400"
            icon={CheckCircle}
          />

          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            color="text-red-400"
            icon={XCircle}
          />

          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            color="text-purple-400"
            icon={Activity}
          />

        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* RECENT ACTIVITY */}
          <div className="lg:col-span-2 bg-[#111111] rounded-2xl border border-gray-800 overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Recent Activity
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest attendance updates
                </p>
              </div>

              <Activity className="w-5 h-5 text-gray-600" />

            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />

                <p className="text-gray-500">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">

                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-5 hover:bg-[#1a1a1a] transition"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">

                        <div
                          className={`w-3 h-3 rounded-full ${
                            activity.status === "Present"
                              ? "bg-green-500"
                              : activity.status === "Late"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />

                        <div>
                          <p className="font-medium text-white">
                            {activity.student}
                          </p>

                          <p className="text-sm text-gray-500">
                            {activity.date} • {activity.time}
                          </p>
                        </div>

                      </div>

                      <div className="text-right">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            activity.status === "Present"
                              ? "bg-green-500/20 text-green-400"
                              : activity.status === "Late"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {activity.status}
                        </span>

                        <p className="text-xs text-gray-600 mt-1">
                          {activity.confidence}
                        </p>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-5">

            <h2 className="text-xl font-semibold text-white">
              Quick Actions
            </h2>

            {/* PROFILE */}
            <button
              onClick={handleViewProfile}
              className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-5 hover:bg-[#1a1a1a] transition text-left"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-purple-400" />

                    <p className="font-semibold text-white">
                      My Profile
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    View and update your profile
                  </p>
                </div>

                <div className="bg-purple-500/10 rounded-full p-2">
                  <User className="w-5 h-5 text-purple-400" />
                </div>

              </div>
            </button>

            {/* STUDENTS */}
            <button
              onClick={handleManageStudents}
              className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-5 hover:bg-[#1a1a1a] transition text-left"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-indigo-400" />

                    <p className="font-semibold text-white">
                      Student Management
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    Manage students and attendance
                  </p>
                </div>

                <div className="bg-indigo-500/10 rounded-full p-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>

              </div>
            </button>

            {/* REPORTS */}
            <button
              onClick={handleViewAnalytics}
              className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-5 hover:bg-[#1a1a1a] transition text-left"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />

                    <p className="font-semibold text-white">
                      Attendance Reports
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    View attendance analytics
                  </p>
                </div>

                <div className="bg-blue-500/10 rounded-full p-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>

              </div>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;