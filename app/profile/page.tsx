"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { FaCamera, FaEdit, FaSave, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "Your Name");
  const [bio, setBio] = useState("Fashion enthusiast and style seeker");
  const { theme, setTheme } = useTheme();

  const stats = [
    { label: "Style Chats", value: "23" },
    { label: "Saved Looks", value: "45" },
    { label: "Following", value: "102" },
    { label: "Followers", value: "89" },
  ];

  const handleSave = () => {
    // Save updated info (integrate with API or state management)
    setIsEditing(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      // Clear local/session storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("nextauth.message");
      sessionStorage.removeItem("nextauth.message");

      // Clear NextAuth session
      await signOut({ redirect: false });

      // Redirect to login
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 px-4">
          {/* <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300">
            My Profile
          </h1> */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <FiSun className="w-full h-full text-yellow-400 absolute opacity-0 dark:opacity-100 transform transition-all duration-300 rotate-0 dark:rotate-180" />
                <FiMoon className="w-full h-full text-gray-600 dark:text-gray-300 absolute opacity-100 dark:opacity-0 transform transition-all duration-300 -rotate-180 dark:rotate-0" />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/90 hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md group dark:bg-red-600/90 dark:hover:bg-red-700 flex items-center gap-2"
              aria-label="Sign out"
            >
              <FaSignOutAlt className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm hidden md:inline-block">
                Sign Out
              </span>
            </button>
          </div>
        </header>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative">
          <div className="flex flex-col items-center">
            <div className="relative group -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden shadow-lg">
                <img
                  src={session?.user?.image || "/default-avatar.png"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow transform opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-blue-600">
                <FaCamera size={16} />
              </button>
            </div>
            <div className="mt-4 text-center">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 text-xl font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none"
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
                      className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <FaSave size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors"
                    >
                      <FaTimes size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{bio}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FaEdit size={16} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow hover:shadow-lg transition duration-300"
              >
                <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((activity, index) => (
              <div key={index} className="flex items-start bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0" />
                <div className="ml-4">
                  <h4 className="font-medium dark:text-gray-100">Style Chat #{index + 1}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Discussed summer fashion trends and got personalized recommendations.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
