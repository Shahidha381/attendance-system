import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api/attendance/mark/";

const MarkAttendance = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const retryTimer = useRef(null);
  const retryCount = useRef(0);
  const modelsReady = useRef(false);

  const [status, setStatus] = useState("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // ─────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    loadModels();
    return () => cleanup();
  }, [cleanup]);

  // ─────────────────────────────────────────
  // LOAD FACE-API MODELS
  // ─────────────────────────────────────────
  const loadModels = async () => {
    try {
      setStatus("initializing");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      modelsReady.current = true;
      startCamera();
    } catch (error) {
      console.error("Model loading failed:", error);
      modelsReady.current = false;
      setStatus("error");
      setErrorMessage("Face model failed to load. Please refresh the page.");
    }
  };

  // ─────────────────────────────────────────
  // START CAMERA
  // ─────────────────────────────────────────
  const startCamera = async () => {
    try {
      setStatus("initializing");
      setErrorMessage("");
      cleanup();

      await new Promise((r) => setTimeout(r, 500));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setCameraReady(true);
            setStatus("ready");
            retryCount.current = 0;
            startFaceDetection();
          } catch (err) {
            console.error("Video play error:", err);
          }
        };
      }
    } catch (error) {
      console.error("Camera start error:", error);
      handleCameraError(error);
    }
  };

  // ─────────────────────────────────────────
  // CAMERA ERROR
  // ─────────────────────────────────────────
  const handleCameraError = useCallback(
    (err) => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1500;

      if (
        (err.name === "AbortError" || err.name === "NotReadableError") &&
        retryCount.current < MAX_RETRIES
      ) {
        retryCount.current += 1;
        cleanup();
        retryTimer.current = setTimeout(() => startCamera(), RETRY_DELAY);
        return;
      }

      setStatus("error");
      setErrorMessage(
        retryCount.current >= MAX_RETRIES
          ? "Camera could not start.\n\n1. Close Zoom/Teams/Meet\n2. Refresh browser\n3. Allow camera permissions"
          : "Unable to access camera. Please allow camera permissions."
      );
    },
    [cleanup]
  );

  // ─────────────────────────────────────────
  // FACE DETECTION LOOP
  // ─────────────────────────────────────────
  const startFaceDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;
        if (!modelsReady.current) return;

        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        setFaceDetected(!!detection);
      } catch {
        // skip frame
      }
    }, 500);
  };

  // ─────────────────────────────────────────
  // COUNTDOWN → CAPTURE
  // ─────────────────────────────────────────
  const startCountdown = () => {
    let counter = 3;
    setCountdown(counter);

    const timer = setInterval(() => {
      counter--;
      if (counter > 0) {
        setCountdown(counter);
      } else {
        clearInterval(timer);
        setCountdown(null);
        captureAndSubmit();
      }
    }, 1000);
  };

  // ─────────────────────────────────────────
  // CAPTURE & SUBMIT TO BACKEND
  // ─────────────────────────────────────────
  const captureAndSubmit = async () => {
    try {
      setStatus("processing");
      setErrorMessage("");

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) throw new Error("Camera not ready");

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg");
      const blob = await fetch(imageData).then((r) => r.blob());

      // Use "token" — Login.jsx stores as both "token" and "access"
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("face_image", blob, "attendance.jpg");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let result;
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Server error ${response.status} — check Django logs`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error(result.message || `Error ${response.status}`);
      }

      // SUCCESS — save record locally then navigate
      const now = new Date();
      const newRecord = {
        id: Date.now(),
        date: now.toLocaleDateString("en-IN"),
        timeIn: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        timeOut: "—",
        status: "present",
        confidence: result.match_percentage
          ? result.match_percentage + "%"
          : "—",
      };

      const old =
        JSON.parse(localStorage.getItem("attendanceRecords")) || [];
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify([newRecord, ...old])
      );

      setSuccessData(result);
      setStatus("success");
      cleanup();

      // Navigate after 2 s
      setTimeout(() => navigate("/attendance-reports"), 2000);
    } catch (error) {
      console.error("captureAndSubmit error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Attendance failed. Please try again.");
    }
  };

  // ─────────────────────────────────────────
  // MARK BUTTON HANDLER
  // ─────────────────────────────────────────
  const handleMarkAttendance = () => {
    if (status === "processing" || status === "success") return;

    if (!faceDetected) {
      setErrorMessage("No face detected. Position your face properly.");
      return;
    }

    setErrorMessage("");
    startCountdown();
  };

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">

      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { cleanup(); navigate("/student-dashboard"); }}
            className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-white">Mark Attendance</h1>
          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto py-8 px-6">

        {/* DATE / TIME */}
        <div className="flex items-center justify-center gap-6 text-slate-300 text-sm mb-8">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
            <Calendar className="w-4 h-4 text-cyan-400" />
            {new Date().toDateString()}
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
            <Clock3 className="w-4 h-4 text-cyan-400" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* CAMERA BOX */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden relative h-[420px] shadow-2xl">

          {/* STATUS BADGE */}
          <div className="absolute top-4 left-4 z-10 bg-cyan-500/20 border border-cyan-400/40 px-4 py-2 rounded-xl text-cyan-300 text-sm backdrop-blur-md">
            {status === "initializing" && "Initializing..."}
            {status === "ready" && "Face Detection Active"}
            {status === "processing" && "Processing Attendance..."}
            {status === "success" && "✓ Attendance Marked"}
            {status === "error" && "Error — Try Again"}
          </div>

          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />

          {/* HIDDEN CANVAS */}
          <canvas ref={canvasRef} className="hidden" />

          {/* LOADING OVERLAY */}
          {!cameraReady && status !== "success" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* FACE FRAME */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
            </div>
          </div>

          {/* FACE DETECTED PILL */}
          {status !== "success" && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div
                className={`px-5 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  faceDetected
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {faceDetected ? "✓ Face Detected" : "No Face Detected"}
              </div>
            </div>
          )}

          {/* COUNTDOWN OVERLAY */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
              <div className="w-24 h-24 rounded-full bg-cyan-500/20 border border-cyan-400 backdrop-blur-md flex items-center justify-center">
                <span className="text-white text-5xl font-bold">{countdown}</span>
              </div>
            </div>
          )}

          {/* SUCCESS OVERLAY */}
          {status === "success" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">
                  {successData?.student_name
                    ? `Welcome, ${successData.student_name}!`
                    : "Attendance Marked!"}
                </p>
                {successData?.attendance_time && (
                  <p className="text-emerald-300 text-sm mt-1">
                    Marked at {successData.attendance_time} · {successData.status}
                  </p>
                )}
                <p className="text-slate-400 text-sm mt-2">
                  Redirecting to reports...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MARK BUTTON */}
        <button
          onClick={handleMarkAttendance}
          disabled={
            !faceDetected ||
            status === "processing" ||
            status === "success" ||
            !cameraReady
          }
          className={`w-full mt-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg ${
            faceDetected &&
            status !== "processing" &&
            status !== "success" &&
            cameraReady
              ? "bg-cyan-500 hover:bg-cyan-600 active:scale-95"
              : "bg-slate-700 cursor-not-allowed opacity-60"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            {status === "processing" ? "Processing..." : "Mark Attendance"}
          </div>
        </button>

        {/* ERROR */}
        {errorMessage && status !== "success" && (
          <div className="mt-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-rose-300 text-sm whitespace-pre-line">
              {errorMessage}
            </p>
          </div>
        )}

        {/* INSTRUCTIONS */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl mt-8 p-6 shadow-xl">
          <h2 className="font-semibold text-white mb-4">Instructions</h2>
          <div className="space-y-3 text-slate-300 text-sm">
            <div>✓ Position your face within the circle</div>
            <div>✓ Ensure good lighting</div>
            <div>✓ Look directly at the camera</div>
            <div>✕ Avoid sunglasses or masks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
