// components/dashboard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CgGirl } from "react-icons/cg";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaPaperPlane,
  FaMicrophone,
  FaImage,
  FaChartLine,
  FaBookmark,
  FaBell,
  FaQuestionCircle,
  FaSearch,
  FaCompass,
  FaTshirt,
  FaRobot,
  FaComments,
  FaPen,
  FaCommentDots,
} from "react-icons/fa";
import { useMediaQuery } from "@/utils/useMediaQuery";
import axios from "axios";
import Image from "next/image"
interface Message {
  type: "user" | "ai";
  content: string;
  images?: string[];
  timestamp?: Date;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const initialPrompts = [
    { icon: "👗", text: "Help me style an outfit for a wedding" },
    { icon: "🎨", text: "What colors are trending this season?" },
    { icon: "💄", text: "Recommend makeup looks for my skin tone" },
    { icon: "🛍️", text: "Create a capsule wardrobe for me" },
    { icon: "✨", text: "Give me fashion tips for my body type" },
  ];
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(isDesktop);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  // Menu Configuration
  const menuItems: MenuItem[] = [
    { icon: FaCommentDots, label: "Start New Chat", href: "/new-chat" }, // Replaced Home with Start New Chat
    { icon: FaUser, label: "Profile", href: "/profile" },
    { icon: FaCog, label: "Settings", href: "/settings" },
    { icon: FaQuestionCircle, label: "Help Center", href: "/help" },
    { icon: FaComments, label: "Recent Chats", href: "/recent-chats" }, // Keep Recent Chats
  ];
  // Authentication Effect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setImageFiles((prev) => [...prev, ...Array.from(files)]);

    // Create object URLs for each file
    const newImagePreviews = Array.from(files).map((file) => {
      const objectUrl = URL.createObjectURL(file);
      return objectUrl;
    });

    // Update state with new image previews
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Cleanup object URLs on component unmount or when the imagePreviews change
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Chat Scroll Effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        setIsMobileSidebarOpen((prev) => !prev);
      }
      if (e.key === "Escape" && window.innerWidth < 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(isDesktop);
  }, [isDesktop]);
  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handlePromptClick = (promptText: string) => {
    setUserInput(promptText);
  
  };

  // Message Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasStartedChat(true);
    if (!userInput.trim() && imagePreviews.length === 0) return;
    setHasStartedChat(true);
    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: userInput, images: imagePreviews },
    ]);
    const uploadImages: any = imagePreviews;
    // Reset input and image previews
    setUserInput("");
    setImagePreviews([]);

    // Set AI typing state to true
    setIsAITyping(true);

    try {
      let textResponse;

      // Send text message as JSON only if there is user input
      if (userInput.trim()) {
        textResponse = await axios.post("/api/huggingface", {
          prompt: userInput,
        });
      }

      // Handle image uploads separately
      if (uploadImages.length > 0) {
        const formData = new FormData();
        for (const file of uploadImages) {
          formData.append("images", file, file.name);
        }

        // Send a POST request with the images
        await axios.post("/api/huggingface", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Handle AI response if textResponse is available
      if (textResponse && textResponse.data.result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: textResponse.data.result.content },
        ]);
      } else if (!textResponse) {
        // If no text response was made, handle image-only response or fallback
        console.log("Images uploaded without text input.");
      } else {
        console.error("No response from API");
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: "Sorry, I could not process your request." },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: "Sorry, an error occurred while processing your request.",
        },
      ]);
    } finally {
      setIsAITyping(false);
    }
  };
  const simulateAIResponse = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        content: "Thank you for your message. How else can I help?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleLogout = () => {
    router.push("/auth/login");
  };


  return (
<div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-purple-50 to-pink-50">

      {/* Mobile Overlay */}
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around items-center p-3">
          <button className="flex flex-col items-center">
            <FaSearch className="h-6 w-6 text-purple-500" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button className="flex flex-col items-center">
            <FaCompass className="h-6 w-6" />
            <span className="text-xs mt-1">Explore</span>
          </button>
          <button className="flex flex-col items-center">
            <FaBookmark className="h-6 w-6" />
            <span className="text-xs mt-1">Saved</span>
          </button>
          <button className="flex flex-col items-center">
            <FaUser className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isMobileSidebarOpen ? 0 : -300 }}
        className={`
          fixed md:static md:translate-x-0 w-72 ${
            isDesktop ? "h-screen" : "h-full"
          } z-40 
          bg-gradient-to-r from-purple-50 to-pink-50  
          transition-transform duration-200
          md:block
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                GlamourHall
              </span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors duration-150
                    ${
                      pathname === item.href
                        ? "bg-purple-50 dark:bg-gray-700 text-purple-600 dark:text-purple-400"
                        : ""
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-red-600 hover:bg-red-50 dark:text-red-400 
                dark:hover:bg-red-900/20 transition-colors duration-150
                bg-gray-100 dark:bg-gray-700 shadow-md"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-md shadow z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="text-gray-900 mr-2 md:hidden"
          >
            <FaBars size={24} className="text-gray-600 hover:text-gray-800" />
          </button>

          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            GlamourHall
          </span>
        </div>

        {/* Profile section on the right */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                <Image
                  src={`${session?.user?.image}`} // Default image if no profile image
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden mt-[60px] mb-[80px] md:mb-12">
          <div className="h-full overflow-y-auto" ref={chatContainerRef}>
            <div className="max-w-3xl mx-auto px-4 py-6">
              {/* Welcome Section - Only show if chat hasn't started */}
              {!hasStartedChat && messages.length <= 1 && (
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                    <span className="text-white text-3xl">👗</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Your Personal Style Guide
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Get personalized fashion advice, trend updates, and style
                    recommendations
                  </p>

                  {/* Featured Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                    {initialPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt.text)}
                        className="group p-4 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{prompt.icon}</span>
                          <span className="text-sm text-gray-700 group-hover:text-purple-700">
                            {prompt.text}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm">
                      Personal Styling
                    </span>
                    <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm">
                      Trend Analysis
                    </span>
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm">
                      Color Matching
                    </span>
                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
                      Sustainable Fashion
                    </span>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  {message.type === "ai" && (
                    <div className="w-12 h-12 mr-2 rounded-full bg-gradient-to-r from-pink-300 to-blue-700 flex items-center justify-center">
                      <span className="text-white">
                        {/* <CgGirl className="h-6 w-6" /> */}
                        ✨
                      </span>
                    </div>
                  )}
                  <div
                    className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white"
                        : "bg-gradient-to-r from-pink-100 to-blue-100 text-black"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isAITyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[85%] md:max-w-[70%] rounded-lg p-3.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/30 backdrop-blur-md border-t shadow z-10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSendMessage} className="relative lg:ml-16">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ask about fashion, styling, or trends..."
                    className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-colors"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  {/* <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaImage className="h-5 w-5" />
                  </button> */}
                </div>
                <button
                  type="submit"
                  className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 text-white hover:opacity-90 transition-opacity"
                >
                  <FaPaperPlane className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
