"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { FaCamera, FaEdit, FaSave, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MdDarkMode } from "react-icons/md";


export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "Your Name");
  const [bio, setBio] = useState("Fashion enthusiast and style seeker");
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const stats = [
    { label: "Style Chats", value: "23" },
    { label: "Credits", value: "4500" },
    { label: "Following", value: "102" },
    { label: "Followers", value: "89" },
  ];

  const handleSave = () => {
    // Save updated info (integrate with API or state management)
    setIsEditing(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      // Clear tokens and session storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("nextauth.message");
      sessionStorage.removeItem("nextauth.message");

      await signOut({ redirect: false });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden md:fixed md:flex items-center left-4 top-4 z-50"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/90" />
        </button>
      </motion.div>
        {/* Hero Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
           Profile
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition"
              aria-label="Toggle theme"
            >
              <div className="relative w-6 h-6">
                <FiSun className="w-full h-full text-yellow-400 absolute opacity-0 dark:opacity-100 transform transition duration-300 rotate-0 dark:rotate-180" />
                <MdDarkMode className="w-full h-full text-gray-600 dark:text-gray-300 absolute opacity-100 dark:opacity-0" />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 transition rounded-full shadow-lg"
              aria-label="Sign out"
            >
              <FaSignOutAlt className="w-5 h-5 text-white" />
              <span className="text-white hidden md:inline-block">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Animated Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8"
        >
          <div className="relative flex flex-col items-center">
            {/* Floating Avatar */}
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden shadow-2xl">
                <Image
                  src={session?.user?.image || "/avatar.jpg"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg transform hover:scale-110 transition">
                <FaCamera size={16} />
              </button>
            </div>
            {/* Profile Info */}
            <div className="mt-6 text-center">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 text-2xl font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 bg-transparent border-2 border-blue-300 rounded-lg focus:border-blue-500 outline-none"
                    rows={3}
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                    >
                      <FaSave size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
                    >
                      <FaTimes size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {name}
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{bio}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  >
                    <FaEdit size={16} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
              >
                <div className="text-4xl font-bold text-blue-500 dark:text-blue-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Recent Chats
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((activity, index) => (
              <div
                key={index}
                className="flex items-start bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
              >
                <div className="w-20 h-20 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0" />
                <div className="ml-6">
                  <h4 className="text-xl font-medium dark:text-gray-100">
                    Style Chat #{index + 1}
                  </h4>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    Discussed summer fashion trends and got personalized recommendations.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
