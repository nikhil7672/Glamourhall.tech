"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaCamera, FaEdit, FaSave, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MdDarkMode } from "react-icons/md";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import { FaLeaf, FaCrown } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState("Fashion enthusiast and style seeker");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (status === "unauthenticated" && !token) {
        window.location.href = "/auth/login";
      } else {
        setName(session?.user?.name || '')
      }
    };
    checkAuth();
  }, [status]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.id) {
          const response = await axios.get(`/api/auth/conversations/user/${user.id}`);
          setConversations(response.data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (status === "authenticated" || token ) {
      fetchConversations();
    }
  }, [status]);

  const stats = [
    { 
      label: "Style Chats", 
      value: conversations.length.toString(),
      icon: () => (
        <div className="relative w-8 h-8 md:w-10 md:h-10 mb-2 text-purple-500">
          <img 
            src="/chat.png"
            alt="Chat" 
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    { 
      label: "Aura", 
      value: "4500",
      icon: () => (
        <div className="relative w-8 h-8 md:w-10 md:h-10 mb-2 text-purple-500">
          <img 
            src="/aura1.png"
            alt="Aura" 
            className="w-full h-full object-contain"
          />
        </div>
      ),
      className: "text-purple-500"
    },
    // Challenges group
    {
      label: "Challenges",
      stats: [
        {
          label: "Active",
          value: "17",
          icon: FaSpinner,
          className: "text-blue-500"
        },
        {
          label: "Completed",
          value: "72",
          icon: () => (
            <div className="relative w-8 h-8 md:w-10 md:h-10 mb-2 text-purple-500">
              <img 
                src="/crown.png"
                alt="Crown" 
                className="w-full h-full object-contain"
              />
            </div>
          ),
        }
      ]
    }
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

  const handleAddAura = () => {
    // Implement aura purchase/add logic here
    router.push('/pricing')
  };

  const RecentChats = () => (
    <div className="mt-8 md:mt-12">
      <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-6">
        Recent Chats
      </h3>
      <div className="space-y-4 md:space-y-6">
        {isLoadingConversations ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : conversations.length > 0 ? (
          [...conversations]
            .sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 3)
            .map((conversation) => (
              <Link 
                href={{
                  pathname: "/chat",
                  query: { id: conversation.id }
                }}
                key={conversation.id}
                className="block hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-md md:shadow-lg transition duration-300">
                  <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0 flex items-center justify-center relative">
                    <FaComments className="w-6 h-6 md:w-8 md:h-8 text-blue-500 dark:text-blue-400 opacity-75" />
                  </div>
                  <div className="ml-3 md:ml-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {conversation?.title?.split(/\s+/).slice(0,5).join(' ') + (conversation?.title?.split(/\s+/).length > 6 ? '...' : '') || "New Style Chat"}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-full">
                      {conversation.messages?.length || 0} messages
                    </span>
                  </div>
                    <p className="text-xs md:text-base text-gray-600 dark:text-gray-300">
                      {conversation.messages?.[0]?.content?.substring(0, 60) + "..."}
                    </p>
                    <p className="text-[10px] md:text-sm text-gray-400 mt-1 md:mt-2">
                      {format(new Date(conversation.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </Link>
            ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No chat history available
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className=" transition-colors duration-300 bg-gray-100 dark:bg-gray-900  px-4 sm:px-2 lg:px-12">
      <div className="max-w-screen-xl mx-auto px-4 pb-20 md:pb-12 pt-8">
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
        <header className="flex justify-between items-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
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
          className="relative bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-8"
        >
          <div className="relative flex flex-col items-center">
            {/* Floating Avatar */}
            <div className="relative -mt-14 md:-mt-16 lg:-mt-20">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden shadow-xl md:shadow-2xl">
                <img
                  src={session?.user?.image || "/avatar.jpg"}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            {/* Profile Info */}
            <div className="mt-4 md:mt-6 text-center">
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {name}
                </h2>
                <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

           {/* Stats Section */}
           <div className="mt-6 md:mt-10 space-y-8">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {stats.slice(0, 2).map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-md md:shadow-lg hover:shadow-lg transition duration-300"
                >
                  {stat.icon && <stat.icon className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${stat.className}`} />}
                  <div className="text-2xl md:text-4xl font-bold text-gray-600 dark:text-blue-400 flex items-center gap-1">
                    {stat.value}
                    {stat.label === "Aura" && (
                      <button
                        onClick={handleAddAura}
                        aria-label="Add more aura"
                      >
                        <img 
                            src="/add.png" 
                            alt="Add Aura"
                            className="w-5 h-5 object-contain"
                          />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 md:mt-2 text-xs md:text-lg text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Challenges Section */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                Challenges
              </h3>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {stats[2].stats?.map((challengeStat, index) => (
                  <div key={index} className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-md md:shadow-lg hover:shadow-lg transition duration-300">
                    {challengeStat.icon && <challengeStat.icon className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${challengeStat.className}`} />}
                    <div className="text-2xl md:text-4xl font-bold text-gray-600 dark:text-blue-400">
                      {challengeStat.value}
                    </div>
                    <div className="mt-1 md:mt-2 text-xs md:text-lg text-gray-600 dark:text-gray-300">
                      {challengeStat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <RecentChats />
      </div>
    </div>
  );
}
