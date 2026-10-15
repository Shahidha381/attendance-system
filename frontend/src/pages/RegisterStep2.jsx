import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { useRef, useState } from "react";
import { registerUser } from "../api/userApi";

const RegisterStep2 = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const userData = location.state;

  const webcamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [image, setImage] = useState(null);

  const handleCaptureClick = () => {
    if (!cameraOn) {
      setCameraOn(true);
      return;
    }

    setTimeout(() => {
      if (webcamRef.current) {
        const imgSrc = webcamRef.current.getScreenshot();

        if (imgSrc) {
          setImage(imgSrc);
        } else {
          console.log("Still not ready");
        }
      }
    }, 500);
  };

  // Retake
  const handleRetake = () => {
    setImage(null);
  };

  // Confirm
  const handleConfirm = async () => {
    try {
      const payload = {
        ...userData,
        image: image,
      };

      await registerUser(payload);

      navigate("/register/success", { state: { image } });

    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">

      <div className="bg-[#111111] border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-4">

          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="bg-white text-black p-2 rounded-md">📷</div>
            <span className="font-bold text-lg text-white">
              FaceAttend
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white">
            Create Account
          </h2>

          <p className="text-gray-400 text-sm">
            Step 2 of 3
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-2 bg-white rounded"></div>
          <div className="flex-1 h-2 bg-white rounded"></div>
          <div className="flex-1 h-2 bg-gray-700 rounded"></div>
        </div>

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-center text-white">
          Register Your Face
        </h3>

        <p className="text-sm text-gray-400 text-center mb-4">
          This will be used for attendance verification
        </p>

        {/* CAMERA BOX */}
        <div className="relative rounded-xl overflow-hidden bg-black border border-gray-700 flex items-center justify-center h-64">

          {/* SHOW CAMERA */}
          {cameraOn && !image && (
            <Webcam
              ref={webcamRef}
              className="w-full h-full object-cover"
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "user",
                width: 640,
                height: 480
              }}
              onUserMedia={() => console.log("Camera started")}
              onUserMediaError={(err) => console.error("Camera error:", err)}
            />
          )}

          {/* SHOW CAPTURED IMAGE */}
          {image && (
            <img
              src={image}
              alt="captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* CIRCLE OVERLAY */}
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-white rounded-full opacity-80"></div>
            </div>
          )}

          {/* CAPTURE BUTTON */}
          {!image && (
            <button
              onClick={handleCaptureClick}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full shadow-lg transition"
            >
              📸 Capture
            </button>
          )}

        </div>

        {/* AFTER CAPTURE BUTTONS */}
        {image && (
          <div className="flex gap-4 mt-4">

            <button
              onClick={handleRetake}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
            >
              Retake
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 bg-white hover:bg-gray-200 text-black py-2 rounded-lg font-medium transition"
            >
              Confirm
            </button>

          </div>
        )}

        {/* CANCEL */}
        <button
          onClick={() => navigate("/register")}
          className="mt-6 text-center w-full text-gray-400 hover:text-white transition"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default RegisterStep2;