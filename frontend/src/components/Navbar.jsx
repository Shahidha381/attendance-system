import { useNavigate } from "react-router-dom";
import Button from "./Button";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black border-b border-gray-800 flex items-center justify-between px-10 py-5">

      {/* LOGO */}
      <div className="flex items-center gap-3 font-bold text-xl text-white cursor-pointer">

        <div className="bg-white text-black p-2 rounded-lg shadow-md">
          📷
        </div>

        <span className="tracking-wide">
          FaceAttend
        </span>
      </div>

      {/* NAV LINKS */}
      <div className="hidden md:flex gap-10 text-gray-400 font-medium">

        <a
          href="#"
          className="hover:text-white transition duration-200"
        >
          Features
        </a>

        <a
          href="#"
          className="hover:text-white transition duration-200"
        >
          How It Works
        </a>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-4">

        <button
          onClick={() => navigate("/login")}
          className="border border-gray-700 text-white px-5 py-2 rounded-xl hover:bg-gray-900 transition duration-200"
        >
          Sign In
        </button>

        <button
          onClick={() => navigate("/register")}
          className="bg-white text-black px-5 py-2 rounded-xl font-semibold hover:bg-gray-200 transition duration-200"
        >
          Get Started
        </button>

      </div>
    </nav>
  );
};

export default Navbar;