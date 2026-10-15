import { useLocation, useNavigate } from "react-router-dom";

const RegisterStep3 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const image = location.state?.image;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">

      <div className="bg-[#111111] border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">

        {/* HEADER */}
        <div className="mb-4">

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
            Step 3 of 3
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-2 bg-white rounded"></div>
          <div className="flex-1 h-2 bg-white rounded"></div>
          <div className="flex-1 h-2 bg-white rounded"></div>
        </div>

        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-4">
          <div className="bg-white text-black w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold">
            ✓
          </div>
        </div>

        {/* TEXT */}
        <h3 className="text-xl font-semibold mb-2 text-white">
          Registration Complete!
        </h3>

        <p className="text-gray-400 text-sm mb-4">
          Your account has been created with face recognition enabled.
        </p>

        {/* IMAGE */}
        {image && (
          <div className="flex flex-col items-center mb-4">
            <img
              src={image}
              alt="registered"
              className="w-24 h-24 rounded-lg object-cover border border-gray-700"
            />

            <p className="text-sm text-gray-400 mt-2">
              Registered Face
            </p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-semibold transition"
        >
          Go to Login
        </button>

      </div>
    </div>
  );
};

export default RegisterStep3;