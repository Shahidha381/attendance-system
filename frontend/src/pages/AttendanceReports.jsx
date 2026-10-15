import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AttendanceReports = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({
    attendanceRate: 0,
    present: 0,
    late: 0,
    absent: 0,
    totalDays: 0,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/attendance/reports/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reports");
      }

      setSummary(
        data.summary || {
          attendanceRate: 0,
          present: 0,
          late: 0,
          absent: 0,
          totalDays: 0,
        }
      );
      setAttendanceRecords(data.records || []);
    } catch (error) {
      console.error("Fetch reports error:", error);
    } finally {
      setLoading(false);
    }
  };

  // EXPORT CSV
  const handleExportReport = () => {
    const headers = ["Date", "Time In", "Time Out", "Status", "Confidence"];
    const csvRows = attendanceRecords.map((r) => [
      r.date,
      r.timeIn || "-",
      r.timeOut || "-",
      r.status,
      r.confidence || "-",
    ]);
    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // STATUS BADGE — handles both capitalised ("Present") and lowercase ("present")
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "present") {
      return (
        <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-semibold border border-green-700">
          Present
        </span>
      );
    }
    if (s === "late") {
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 text-xs font-semibold border border-yellow-700">
          Late
        </span>
      );
    }
    if (s === "absent") {
      return (
        <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-semibold border border-red-700">
          Absent
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold border border-gray-700">
        -
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4 text-gray-400">Loading attendance reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-zinc-950 border-b border-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student-dashboard")}
              className="p-2 hover:bg-zinc-800 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Attendance Reports
              </h1>
              <p className="text-sm text-gray-400">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-semibold transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-6">

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Attendance Rate</p>
                <h2 className="text-4xl font-bold text-white mt-2">
                  {summary.attendanceRate}%
                </h2>
              </div>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="mt-4 w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.attendanceRate}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Present</p>
                <h2 className="text-3xl font-bold text-green-400">
                  {summary.present}
                </h2>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Late</p>
                <h2 className="text-3xl font-bold text-yellow-400">
                  {summary.late}
                </h2>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Absent</p>
                <h2 className="text-3xl font-bold text-red-400">
                  {summary.absent}
                </h2>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">
              Attendance Records
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Complete attendance history
            </p>
          </div>

          {attendanceRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-gray-400">Date</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400">Time In</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400">Time Out</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      className="border-b border-zinc-800 hover:bg-zinc-900 transition"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {record.timeIn || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {record.timeOut || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {record.confidence || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No attendance records found</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Current Academic Year
          </div>
          <div>Total Records: {attendanceRecords.length}</div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;