// src/pages/Login.jsx

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { loginUser, faceLogin } from "../api/userApi";

const Login = () => {
  const navigate = useNavigate();

  const [role,      setRole]      = useState("student");
  const [loginType, setLoginType] = useState("password");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const [cameraOn,    setCameraOn]    = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [faceError,   setFaceError]   = useState("");

  const webcamRef  = useRef(null);
  const retryTimer = useRef(null);
  const retryCount = useRef(0);

  // ── CLEANUP ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (webcamRef.current?.video?.srcObject) {
        webcamRef.current.video.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
    retryCount.current = 0;
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach((t) => t.stop());
      webcamRef.current.video.srcObject = null;
    }
    setCameraReady(false);
    setCameraOn(false);
  }, []);

  const switchToPassword = useCallback(() => {
    stopCamera();
    setLoginType("password");
    setFaceError("");
  }, [stopCamera]);

  // ── PASSWORD LOGIN ────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    try {
      setLoading(true);
      const res = await loginUser({ email, password, role });

      // Store the token from PASSWORD step — this is the authoritative token.
      // It is tied to the exact user who entered credentials.
      // The face step only VERIFIES identity; it does NOT replace this token.
      if (res.tokens?.access) {
        localStorage.setItem("token", res.tokens.access);
      }

      // Store user data and their uuid so face verification targets the right person
      localStorage.setItem("tempUser", JSON.stringify(res.user));

      setLoginType("face");
      setFaceError("");
      setTimeout(() => setCameraOn(true), 300);

    } catch (err) {
      console.error(err);
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── FACE VERIFICATION (2nd factor) ───────────────────────────
  const handleFaceLogin = async () => {
    if (!cameraReady) { alert("Camera not ready yet"); return; }

    setFaceError("");
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) { alert("Failed to capture image"); return; }

      const blob = await fetch(imageSrc).then((r) => r.blob());
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });

      // Get the user from the password step
      const tempUser = JSON.parse(localStorage.getItem("tempUser"));
      if (!tempUser) { alert("Session expired. Please login again."); navigate("/login"); return; }

      // Send BOTH the image AND the specific user's uuid
      // so the backend verifies against THAT user's face only
      const res = await faceLogin(file, role, tempUser.id);

      // Face verified ✓ — finalise login using the password-step user (tempUser)
      // NEVER overwrite "token" — keep the one from password step
      // (backend token is for same user anyway since we verified by uuid,
      //  but we keep password token to be 100% safe)
      localStorage.setItem("user", JSON.stringify(tempUser));
      localStorage.removeItem("tempUser");

      stopCamera();
      await new Promise((r) => setTimeout(r, 500));

      navigate(tempUser.role === "student" ? "/student-dashboard" : "/teacher-dashboard");

    } catch (err) {
      console.error(err);
      // Show error inline instead of alert — lets user retry
      setFaceError(err.message || "Face verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── CAMERA ERROR ─────────────────────────────────────────────
  const handleCameraError = useCallback((err) => {
    console.error("Camera Error:", err);
    const MAX_RETRIES = 3;
    if (
      (err.name === "AbortError" || err.name === "NotReadableError") &&
      retryCount.current < MAX_RETRIES
    ) {
      retryCount.current += 1;
      stopCamera();
      retryTimer.current = setTimeout(() => setCameraOn(true), 1500);
      return;
    }
    alert("Camera could not start.\n\n1. Close Zoom/Teams/Meet\n2. Refresh page\n3. Allow browser camera permission");
    stopCamera();
  }, [stopCamera]);

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-[#111111] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* ROLE TOGGLE */}
        <div className="flex bg-[#1a1a1a] rounded-lg p-1 mb-5 border border-gray-800">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              role === "student" ? "bg-black border border-gray-700 text-white" : "text-gray-400"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("teacher")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              role === "teacher" ? "bg-black border border-gray-700 text-white" : "text-gray-400"
            }`}
          >
            Teacher
          </button>
        </div>

        {/* LOGIN TYPE TABS */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={switchToPassword}
            className={`flex-1 py-2 rounded-lg border transition ${
              loginType === "password"
                ? "bg-gray-900 border-gray-700 text-white"
                : "border-gray-700 text-gray-400"
            }`}
          >
            Password Login
          </button>
          <button
            onClick={() => { setLoginType("face"); setFaceError(""); }}
            className={`flex-1 py-2 rounded-lg border transition ${
              loginType === "face"
                ? "bg-gray-900 border-gray-700 text-white"
                : "border-gray-700 text-gray-400"
            }`}
          >
            Face Login
          </button>
        </div>

        {/* ── PASSWORD FORM ── */}
        {loginType === "password" ? (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
              className="w-full mb-4 p-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500"
            />
            <button
              onClick={handlePasswordLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </>

        ) : (
          /* ── FACE VERIFICATION ── */
          <div className="text-center">
            {!cameraOn ? (
              <button
                onClick={() => { setCameraReady(false); setCameraOn(true); }}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition"
              >
                Start Camera
              </button>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-gray-700 relative">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    audio={false}
                    mirrored={true}
                    className="w-full"
                    videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={handleCameraError}
                  />
                  {!cameraReady && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-white text-sm">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>

                <p className={`text-xs mt-2 ${cameraReady ? "text-green-400" : "text-gray-500"}`}>
                  {cameraReady ? "✓ Camera ready" : "Waiting for camera..."}
                </p>

                {/* Face error shown inline so user can retry */}
                {faceError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {faceError}
                  </div>
                )}

                <button
                  onClick={handleFaceLogin}
                  disabled={!cameraReady || loading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg mt-3 transition disabled:opacity-50"
                >
                  {loading ? "Verifying Face..." : "Capture & Login"}
                </button>

                <button
                  onClick={switchToPassword}
                  className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-white transition"
                >
                  ← Back to password login
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;