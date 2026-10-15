import { useNavigate } from "react-router-dom";
import { useState } from "react";

const RegisterStep1 = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    user_id: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    if (!formData.name || !formData.email || !formData.user_id || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    navigate("/register/face", {
      state: {
        ...formData,
        role,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-[#111111] p-8 rounded-2xl shadow-lg border border-gray-800 w-full max-w-md">

        {/* Role */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 border py-2 rounded-lg transition ${
              role === "student"
                ? "bg-white text-black border-white"
                : "bg-[#1a1a1a] text-gray-300 border-gray-700"
            }`}
          >
            Student
          </button>

          <button
            onClick={() => setRole("teacher")}
            className={`flex-1 border py-2 rounded-lg transition ${
              role === "teacher"
                ? "bg-white text-black border-white"
                : "bg-[#1a1a1a] text-gray-300 border-gray-700"
            }`}
          >
            Teacher
          </button>
        </div>

        {/* Inputs */}
        <input
          name="name"
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 p-3 mb-3 rounded-lg focus:outline-none focus:border-white"
        />

        <input
          name="email"
          onChange={handleChange}
          placeholder="Email"
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 p-3 mb-3 rounded-lg focus:outline-none focus:border-white"
        />

        <input
          name="user_id"
          onChange={handleChange}
          placeholder={role === "student" ? "Student ID" : "Teacher ID"}
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 p-3 mb-3 rounded-lg focus:outline-none focus:border-white"
        />

        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 p-3 mb-3 rounded-lg focus:outline-none focus:border-white"
        />

        <button
          onClick={handleContinue}
          className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-semibold transition"
        >
          Continue →
        </button>

      </div>
    </div>
  );
};

export default RegisterStep1;