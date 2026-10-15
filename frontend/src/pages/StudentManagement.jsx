// src/pages/StudentManagement.jsx
import { useEffect, useState } from "react";
import {
  ArrowLeft, Search, Users, TrendingUp,
  Mail, IdCard, CheckCircle, Clock, XCircle,
  Calendar, ChevronDown, ChevronUp, UserCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../api/userApi";

const StudentManagement = () => {
  const navigate  = useNavigate();

  const [students,         setStudents]         = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [loading,          setLoading]          = useState(true);
  const [selectedStudent,  setSelectedStudent]  = useState(null);
  const [activeToday,      setActiveToday]      = useState(0);

  // ─── LOAD ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { navigate("/login"); return; }
    fetchStudents();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
      // count students present today
      const today = new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
      const active = data.filter(s =>
        s.recentAttendance?.[0]?.status === "present" &&
        s.recentAttendance?.[0]?.date === today
      ).length;
      setActiveToday(active);
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // ─── SEARCH ───────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredStudents(
      students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.studentId?.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      )
    );
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const avgAttendance = filteredStudents.length
    ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / filteredStudents.length)
    : 0;

  const getBarColor = (rate) => {
    if (rate >= 75) return "bg-green-500";
    if (rate >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRateColor = (rate) => {
    if (rate >= 75) return "text-green-400";
    if (rate >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusBadge = (status) => {
    const map = {
      present: "bg-green-500/20 text-green-400",
      late:    "bg-yellow-500/20 text-yellow-400",
      absent:  "bg-red-500/20 text-red-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-gray-800 text-gray-400"}`}>
        {status}
      </span>
    );
  };

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
        <p className="mt-4 text-gray-400">Loading students...</p>
      </div>
    </div>
  );

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-[#0d0d0d] border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* SEARCH */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 bg-[#111111] text-white placeholder-gray-600"
          />
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#111111] rounded-xl border border-gray-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" /> Total Students
              </p>
              <p className="text-4xl font-bold text-white mt-1">{filteredStudents.length}</p>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl border border-gray-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Avg Attendance
              </p>
              <p className="text-4xl font-bold text-blue-400 mt-1">{avgAttendance}%</p>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl border border-gray-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-purple-400" /> Active Today
              </p>
              <p className="text-4xl font-bold text-white mt-1">{activeToday}</p>
            </div>
          </div>
        </div>

        {/* STUDENT CARDS GRID */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((student) => {
              const isOpen = selectedStudent?.id === student.id;
              return (
                <div key={student.id} className="bg-[#111111] rounded-2xl border border-gray-800 overflow-hidden">

                  {/* CARD TOP */}
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      {/* AVATAR */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {student.face_image ? (
                          <img
                            src={`http://127.0.0.1:8000${student.face_image}`}
                            alt={student.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {student.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* NAME + ID + EMAIL */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{student.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <IdCard className="w-3 h-3" />
                          {student.studentId}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </p>
                      </div>
                    </div>

                    {/* ATTENDANCE BAR */}
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Attendance</span>
                      <span className={`font-semibold ${getRateColor(student.attendanceRate)}`}>
                        {student.attendanceRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getBarColor(student.attendanceRate)}`}
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>

                    {/* STATS ROW */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Records</p>
                        <p className="font-bold text-white">{student.totalDays}</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-semibold text-green-400 text-xs">{student.status}</p>
                      </div>
                    </div>

                    {/* EXPAND BUTTON */}
                    <button
                      onClick={() => setSelectedStudent(isOpen ? null : student)}
                      className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-white border border-gray-700 rounded-lg py-2 transition"
                    >
                      {isOpen ? (
                        <><ChevronUp className="w-4 h-4" /> Hide Details</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> View Details</>
                      )}
                    </button>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isOpen && (
                    <div className="border-t border-gray-800 bg-[#0d0d0d] p-5">

                      {/* PRESENT / LATE / ABSENT */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-[#111111] rounded-lg p-2 text-center border border-gray-800">
                          <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Present</p>
                          <p className="font-bold text-green-400">{student.present}</p>
                        </div>
                        <div className="bg-[#111111] rounded-lg p-2 text-center border border-gray-800">
                          <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Late</p>
                          <p className="font-bold text-yellow-400">{student.late}</p>
                        </div>
                        <div className="bg-[#111111] rounded-lg p-2 text-center border border-gray-800">
                          <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Absent</p>
                          <p className="font-bold text-red-400">{student.absent}</p>
                        </div>
                      </div>

                      {/* RECENT ATTENDANCE */}
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Recent Attendance
                      </h4>
                      <div className="space-y-2">
                        {student.recentAttendance?.length > 0 ? (
                          student.recentAttendance.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[#111111] rounded-lg p-2 border border-gray-800">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs text-gray-400">{att.date}</span>
                                {getStatusBadge(att.status)}
                              </div>
                              <div className="text-right">
                                {att.timeIn && (
                                  <p className="text-xs text-gray-500">{att.timeIn}</p>
                                )}
                                {att.confidence && (
                                  <p className="text-xs text-gray-600">{att.confidence}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-600 text-center py-2">No recent records</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;