// src/pages/TeacherAttendanceReports.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Search,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const TeacherAttendanceReports = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    rate: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState("All Time");
  const [studentFilter, setStudentFilter] = useState("All Students");

  const [showTimeDrop, setShowTimeDrop] = useState(false);
  const [showStudentDrop, setShowStudentDrop] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const timeOptions = [
    "All Time",
    "Today",
    "This Week",
    "This Month",
  ];

  // ─────────────────────────────────────────────────────────────
  // AUTH CHECK + LOAD
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    fetchReports();
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────
  // FETCH REPORTS
  // ─────────────────────────────────────────────────────────────
  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/attendance/teacher-reports/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non JSON response:", text);
        throw new Error("Server error");
      }

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        throw new Error(data.message || "Failed to load reports");
      }

      const safeRecords = data.records || [];

      setRecords(safeRecords);

      setSummary(
        data.summary || {
          rate: 0,
          present: 0,
          late: 0,
          absent: 0,
        }
      );

      const uniqueStudents = [
        "All Students",
        ...new Set(
          safeRecords
            .map((r) => r.student_name)
            .filter(Boolean)
        ),
      ];

      setStudents(uniqueStudents);

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FILTER LOGIC
  // ─────────────────────────────────────────────────────────────
  const filtered = records.filter((r) => {
    const matchStudent =
      studentFilter === "All Students" ||
      r.student_name === studentFilter;

    if (!matchStudent) return false;

    const search = searchTerm.toLowerCase();

    const searchable =
      `${r.student_name} ${r.status} ${r.date}`
        .toLowerCase();

    if (!searchable.includes(search)) return false;

    if (timeFilter === "All Time") return true;

    const recordDate = new Date(r.raw_date);
    const now = new Date();

    if (timeFilter === "Today") {
      return (
        recordDate.toDateString() === now.toDateString()
      );
    }

    if (timeFilter === "This Week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return recordDate >= weekAgo;
    }

    if (timeFilter === "This Month") {
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  const filteredSummary = {
    present: filtered.filter((r) => r.status === "Present").length,
    late: filtered.filter((r) => r.status === "Late").length,
    absent: filtered.filter((r) => r.status === "Absent").length,
  };

  filteredSummary.rate = filtered.length
    ? Math.round((filteredSummary.present / filtered.length) * 100)
    : 0;

  // ─────────────────────────────────────────────────────────────
  // EXPORT CSV
  // ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ["Student", "Date", "Time In", "Time Out", "Status", "Confidence"];

    const rows = filtered.map((r) => [
      r.student_name,
      r.date,
      r.time_in || "-",
      r.time_out || "-",
      r.status,
      r.confidence || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─────────────────────────────────────────────────────────────
  // STATUS BADGE
  // ─────────────────────────────────────────────────────────────
  const badge = (status) => {
    const map = {
      Present: "bg-green-500/20 text-green-400",
      Late: "bg-orange-500/20 text-orange-400",
      Absent: "bg-red-500/20 text-red-400",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          map[status] || "bg-gray-800 text-gray-400"
        }`}
      >
        {status}
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4 text-gray-400">
            Loading attendance reports...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-[#0d0d0d] border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-white">
            Attendance Reports
          </h1>

          <div className="flex items-center gap-3">

            <button
              onClick={fetchReports}
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* SEARCH + FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

            <input
              type="text"
              placeholder="Search by student name, status or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-800 rounded-xl bg-[#111111] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* TIME FILTER */}
          <div className="relative">

            <button
              onClick={() => {
                setShowTimeDrop(!showTimeDrop);
                setShowStudentDrop(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-[#111111] border border-gray-800 rounded-xl text-sm text-gray-300 hover:bg-[#1a1a1a] min-w-[170px] transition"
            >
              <Clock className="w-4 h-4 text-gray-500" />
              {timeFilter}
              <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
            </button>

            {showTimeDrop && (
              <div className="absolute top-14 left-0 bg-[#111111] border border-gray-800 rounded-xl shadow-xl z-30 w-full overflow-hidden">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeFilter(opt);
                      setShowTimeDrop(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[#1a1a1a] transition ${
                      timeFilter === opt
                        ? "text-green-400 font-semibold"
                        : "text-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STUDENT FILTER */}
          <div className="relative">

            <button
              onClick={() => {
                setShowStudentDrop(!showStudentDrop);
                setShowTimeDrop(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-[#111111] border border-gray-800 rounded-xl text-sm text-gray-300 hover:bg-[#1a1a1a] min-w-[220px] transition"
            >
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="truncate">{studentFilter}</span>
              <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
            </button>

            {showStudentDrop && (
              <div className="absolute top-14 left-0 bg-[#111111] border border-gray-800 rounded-xl shadow-xl z-30 w-full max-h-64 overflow-y-auto">
                {students.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setStudentFilter(name);
                      setShowStudentDrop(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[#1a1a1a] transition ${
                      studentFilter === name
                        ? "text-green-400 font-semibold"
                        : "text-gray-300"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-[#111111] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Attendance Rate
            </div>
            <p className="text-4xl font-bold text-white">
              {filteredSummary.rate}%
            </p>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Present
            </div>
            <p className="text-4xl font-bold text-green-400">
              {filteredSummary.present}
            </p>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Late
            </div>
            <p className="text-4xl font-bold text-orange-400">
              {filteredSummary.late}
            </p>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Absent
            </div>
            <p className="text-4xl font-bold text-red-400">
              {filteredSummary.absent}
            </p>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-[#111111] rounded-2xl border border-gray-800 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Attendance Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filtered.length} records found
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">
                No attendance records found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="bg-[#0d0d0d] border-b border-gray-800">
                    {[
                      "Student",
                      "Date",
                      "Time In",
                      "Time Out",
                      "Status",
                      "Confidence",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800">

                  {filtered.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#1a1a1a] transition"
                    >

                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {r.student_name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.date}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.time_in || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.time_out || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {badge(r.status)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                        {r.confidence || "—"}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendanceReports;