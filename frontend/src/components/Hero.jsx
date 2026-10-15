import Button from "./Button";

import {
  ScanFace,
  Clock3,
  BarChart3,
  ShieldCheck,
  Users,
  Fingerprint,
} from "lucide-react";

const features = [
  {
    icon: ScanFace,
    title: "Face Recognition",
    description:
      "Advanced AI-powered facial recognition for instant identity verification",
  },
  {
    icon: Clock3,
    title: "Real-time Tracking",
    description:
      "Mark attendance in real-time with automatic timestamp recording",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Comprehensive reports and insights on attendance patterns",
  },
  {
    icon: ShieldCheck,
    title: "Fraud Prevention",
    description:
      "Eliminates proxy attendance with unique biometric verification",
  },
  {
    icon: Users,
    title: "Multi-role Support",
    description:
      "Separate interfaces for students and teachers/administrators",
  },
  {
    icon: Fingerprint,
    title: "Secure Storage",
    description:
      "Encrypted face data storage with privacy-first architecture",
  },
];

const steps = [
  {
    number: "01",
    title: "Register Your Face",
    description:
      "Create an account and capture your facial image using your device camera",
  },
  {
    number: "02",
    title: "Verify Identity",
    description:
      "System generates unique face encodings and stores them securely",
  },
  {
    number: "03",
    title: "Mark Attendance",
    description:
      "Simply look at the camera to automatically mark your attendance",
  },
];

const Hero = () => {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 gap-10">

        {/* LEFT */}
        <div className="max-w-xl">

          {/* BADGE */}
          <span className="bg-gray-900 border border-gray-700 text-gray-200 px-4 py-1 rounded-full text-sm">
            AI-Powered Attendance System
          </span>

          {/* TITLE */}
          <h1 className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
            Smart Attendance <br />

            <span className="text-gray-300">
              Made Simple
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="text-gray-400 mt-6 text-lg leading-relaxed">
            Eliminate manual attendance tracking with our advanced face
            recognition technology. Secure, fast, and completely contactless.
          </p>
        </div>

        
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-[#0d0d0d] px-6 md:px-12 py-24">

        <div className="max-w-7xl mx-auto">

          {/* TITLE */}
          <div className="text-center mb-16">

            <h2 className="text-4xl font-bold text-white">
              Powerful Features
            </h2>

            <p className="text-gray-400 mt-4 text-lg">
              Everything you need to manage attendance efficiently and securely
            </p>
          </div>

          {/* FEATURE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-lg hover:border-gray-600 hover:shadow-2xl transition duration-300"
                >

                  {/* ICON */}
                  <div className="w-14 h-14 rounded-xl bg-black border border-gray-700 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-black px-6 md:px-12 py-24">

        <div className="max-w-7xl mx-auto">

          {/* TITLE */}
          <div className="text-center mb-20">

            <h2 className="text-4xl font-bold text-white">
              How It Works
            </h2>

            <p className="text-gray-400 mt-4 text-lg">
              Simple three-step process to get started with smart attendance
            </p>
          </div>

          {/* STEPS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">

            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center relative"
              >

                {/* NUMBER CIRCLE */}
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold mx-auto relative z-10 shadow-lg">
                  {step.number}
                </div>

                {/* CONNECTING LINE */}
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-700"></div>
                )}

                {/* STEP TITLE */}
                <h3 className="text-2xl font-semibold text-white mt-8">
                  {step.title}
                </h3>

                {/* STEP DESCRIPTION */}
                <p className="text-gray-400 mt-4 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;