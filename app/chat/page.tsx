"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTimesCircle,
  FaCog,
  FaPaperPlane,
  FaImage,
  FaQuestionCircle,
  FaComments,
  FaCommentDots,
  FaPlus,
} from "react-icons/fa";
import { BsBellFill } from "react-icons/bs";
import { useMediaQuery } from "@/utils/useMediaQuery";
import axios from "axios";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { NotificationDialog } from "@/components/notificationDialog";
import { RiChatNewFill } from "react-icons/ri";

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

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);
  const initialPrompts = [
    { icon: "💃", text: "Help me style an outfit for a wedding" },
    { icon: "🎨", text: "What colors are trending this season?" },
    { icon: "💄", text: "Recommend makeup looks for my skin tone" },
    { icon: "🛍️", text: "Create a capsule wardrobe for me" },
    { icon: "✨", text: "Give me fashion tips for my body type" },
  ];
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(isDesktop);
  const [notificationCount, setNotificationCount] = useState(4);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [notifications] = useState([
    {
      id: "1",
      title: "New Style Recommendation",
      message: "Check out the latest fashion trends we picked for you!",
      timestamp: new Date(),
      read: false,
      type: "update" as const,
    },
    {
      id: "2",
      title: "Outfit Analysis Complete",
      message: "Your recent outfit analysis is ready to view.",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: "alert" as const,
    },
    {
      id: "3",
      title: "New Message",
      message: "Your stylist has sent you a new message.",
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      type: "message" as const,
    },
    {
      id: "4",
      title: "Trending Colors",
      message: "Spring color trends are now available!",
      timestamp: new Date(Date.now() - 86400000),
      read: false,
      type: "update" as const,
    },
    {
      id: "5",
      title: "Style Match Found",
      message: "We found a perfect match for your style preferences.",
      timestamp: new Date(Date.now() - 172800000),
      read: true,
      type: "alert" as const,
    },
  ]);

  const [conversations, setConversations] = useState([]);
  // Refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  // Menu Configuration
  const menuItems: MenuItem[] = [
    { icon: FaCommentDots, label: "Start New Chat", href: "/new-chat" },
    { icon: FaComments, label: "Recent Chats", href: "/recent-chats" },
    { icon: FaCog, label: "Settings", href: "/settings" },
    { icon: FaQuestionCircle, label: "Help Center", href: "/help" },
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setImageFiles((prev) => [...prev, ...Array.from(files)]);

    const newImagePreviews = Array.from(files).map((file) => {
      const objectUrl = URL.createObjectURL(file);
      return objectUrl;
    });

    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePromptClick = (promptText: string) => {
    setUserInput(promptText);
  };
  const createConversation = async (messagesToSave: any[]) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        throw new Error("User not found");
      }

      const payload = {
        userId: user.id,
        initialMessage: messagesToSave, // Use the passed messages
      };

      const response = await fetch(`/api/auth/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to create new conversation: ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  const updateConversation = async (messagesToSave: any[]) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        throw new Error("User not found");
      }

      const payload = {
        newMessage: messagesToSave.map((msg) => ({
          type: msg.type === "user" ? "user" : "ai",
          content: msg.content,
          ...(msg.type === "user" &&
            msg.images?.length && { images: msg.images }),
        })),
      };

      const response = await fetch(
        `/api/auth/conversations/${activeConversationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to update conversation: ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw error;
    }
  };

  // Message Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() && imagePreviews.length === 0) return;
    setHasStartedChat(true);

    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: userInput, images: imagePreviews },
    ]);

    setIsAITyping(true);

    const userMessageContent = userInput;
    const userImages = [...imagePreviews];

    try {
      let uploadedImagePaths: any = [];
      setImagePreviews([]);
      const textPrompt = userInput;
      setUserInput("");
      // Upload images to the server
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => {
          uploadFormData.append("images", file);
        });

        const uploadResponse = await axios.post("/api/upload", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.data.filePaths) {
          uploadedImagePaths = uploadResponse.data.filePaths.map(
            (file: any) => file.path
          );
        }
      }

      // Prepare data for AI processing
      const formData = new FormData();
      if (userInput.trim()) {
        formData.append("text", textPrompt);
      }

      uploadedImagePaths.forEach((path: any) => {
        formData.append("imagePaths", path); // Send file paths instead of file objects
      });

      formData.append("messages", JSON.stringify(messages));

      const userMessage = {
        type: "user",
        content: userMessageContent,
        images: uploadedImagePaths,
      };

      // Send data to AI API
      const response = await fetch("/api/huggingface", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data && data.result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: data.result },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: "Sorry, I could not process your request." },
        ]);
      }

      const aiMessage = {
        type: "ai",
        content: data?.result || "Sorry, I could not process your request.",
      };

      // Reset input and image previews
      if (!activeConversationId) {
        const newConversation = await createConversation([
          userMessage,
          aiMessage,
        ]);
        console.log(newConversation, "newConversation");
        setActiveConversationId(newConversation.id);
        fetchUserConversations();
      } else {
        await updateConversation([userMessage, aiMessage]);
      }

      setUserInput("");
      setImagePreviews([]);
      setImageFiles([]);
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
      setUserInput("");
      setImagePreviews([]);
      setImageFiles([]);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // Check if the device is mobile
      if (window.innerWidth < 768) {
        // Scroll to the bottom of the chat container with a smooth animation
        chatContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else {
        // Scroll to the bottom of the chat container without animation
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
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

  const checkUser = async () => {
    if (session?.user?.email) {
      const response = await fetch("/api/auth/user-exists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.exists) {
          // Create new user using register endpoint
          const registerResponse = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session.user.email,
              fullName: session.user.name || "",
              password: "", // Empty for Google users
              provider: "google",
            }),
          });

          if (registerResponse.ok) {
            const userData = await registerResponse.json();
            // Store user data in storage
            localStorage.setItem("user", JSON.stringify(userData.user));
            sessionStorage.setItem("user", JSON.stringify(userData.user));
            setLocalStorageUser(userData.user);
          } else {
            console.error("Failed to create user");
          }
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.setItem("user", JSON.stringify(data.user));
          setLocalStorageUser(data.user);
        }
      }
    }
  };

  const fetchUserConversations = async () => {
    try {
      setIsLoadingChats(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`/api/auth/conversations/user/${user.id}`);

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setUserInput("");
    setImagePreviews([]);
    setImageFiles([]);
    setHasStartedChat(false);
  };

  // Load specific chat
  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/auth/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to load conversation");

      const data = await response.json();
      setActiveConversationId(conversationId);
      setMessages(data.messages);
      setHasStartedChat(true);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };
  // Authentication Effect
  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (status === "unauthenticated" && !token) {
        window.location.href = "/auth/login";
      }
    };

    checkAuth();
  }, [status]);

  useEffect(() => {
    setIsMobileSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (session?.user?.email) {
      checkUser();
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (localStorageUser?.id) {
      fetchUserConversations();
    }

  }, [localStorageUser]);

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setLocalStorageUser(JSON.parse(user));
    }
  }, []);
  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row 
  bg-gradient-to-r from-blue-50 to-purple-50 
  dark:from-gray-900 dark:to-purple-900
  transition-colors duration-200"
    >
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isMobileSidebarOpen ? 0 : -300 }}
        className={`
    fixed md:static md:translate-x-0 w-72 ${
      isDesktop ? "h-screen" : "h-full"
    } z-40 
    bg-gradient-to-r from-purple-50 to-blue-50  
    border border-gray-300 rounded-lg shadow-md // Add border, rounded corners, and shadow
    transition-transform duration-200
    md:block
  `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Glamourhall
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
          {/* <nav className="flex-1 overflow-y-auto p-4">
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
          </nav> */}
          <button
            onClick={() => {
              startNewChat();
              if (!isDesktop) {
                setIsMobileSidebarOpen(false);
              }
            }}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
          >
            <RiChatNewFill className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Conversations List */}
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {isLoadingChats ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
              </div>
            ) : (
              conversations.map((conversation: any) => (
                <div
                  key={conversation.id}
                  className={`group relative px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                    activeConversationId === conversation.id
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => {
                    loadConversation(conversation.id);
                    if (!isDesktop) {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                >
                  {/* Conversation Title */}
                  <div className="font-medium truncate">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Logout Button */}
          {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
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
          </div> */}
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
                <FaBars
                  size={24}
                  className="text-gray-600 hover:text-gray-800"
                />
              </button>

              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                GlamourHall
              </span>
            </div>

            {/* Profile section on the right */}
            <div className="flex items-center gap-4">
              {(session?.user || localStorageUser) && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative"
                    >
                      <BsBellFill
                        className={`text-gray-700 ${
                          window.innerWidth < 768 ? "w-6 h-6" : "w-5 h-5"
                        }`}
                      />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1.5 border-2 border-white">
                          {notifications.length > 99
                            ? "99+"
                            : notifications.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <Popover className="relative">
                    <Popover.Button className="focus:outline-none">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-purple-400 
      transition-all duration-200 flex items-center justify-center bg-gray-100"
                      >
                        {session?.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt="Profile Picture"
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                            <span className="text-2xl text-purple-500">
                              {localStorageUser?.fullName?.[0]?.toUpperCase() ||
                                localStorageUser?.full_name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 origin-top-right">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="relative bg-white dark:bg-gray-800 p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-200">
                                  {session?.user?.image ? (
                                    <Image
                                      src={session.user.image}
                                      alt="Profile"
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                      <span className="text-2xl text-purple-500">
                                        {localStorageUser?.fullName?.[0]?.toUpperCase() ||
                                          localStorageUser?.full_name?.[0]?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {localStorageUser?.fullName ||
                                    localStorageUser?.full_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {localStorageUser?.email}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
            text-red-600 hover:bg-red-50 dark:text-red-400 
            dark:hover:bg-red-900/20 transition-colors duration-150"
                              >
                                <FaSignOutAlt className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                  Sign Out
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </Popover>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden mt-[60px] mb-[80px] md:mb-12">
          <div
            className={`h-full overflow-y-auto ${
              window.innerWidth < 768 ? "mb-20" : ""
            }`}
            ref={chatContainerRef}
          >
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
                      <motion.span
                        animate={{
                          y: ["0%", "-10%", "0%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                        className="text-white"
                      >
                        ✨
                      </motion.span>
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    {/* Image Section */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-2 mt-2 flex flex-wrap gap-2">
                        {message.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Message Image ${index}`}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    {/* Text Content Section */}
                    {message.content && (
                      <div
                        className={`relative inline-block rounded-2xl px-4 py-3 ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white"
                            : "bg-gradient-to-r from-pink-100 to-blue-100 text-black"
                        }`}
                      >
                        {message.type === "ai" ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                    )}
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
          <div className="max-w-2xl mx-auto px-4 py-3">
            <form onSubmit={handleSendMessage} className="relative lg:ml-16">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ask about fashion, styling, or trends..."
                    className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 focus:border-lavender focus:ring focus:ring-lavender transition-colors"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaImage className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 text-white hover:opacity-90 transition-opacity"
                >
                  <FaPaperPlane className="h-5 w-5" />
                </button>
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 text-red-600 bg-white rounded-full p-1"
                      >
                        <FaTimesCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <NotificationDialog
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}
