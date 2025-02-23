"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Brain, BrainCircuit, EyeIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { TypingAnimation } from "../../components/typing-animation";
import { motion } from "framer-motion";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import toast, { Toaster } from 'react-hot-toast'
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
  FaCogs,
  FaRegCreditCard,
  FaTrash,
  FaSun,
  FaMoon,
  FaStopCircle,
  FaCheckCircle,
  FaCrown,
  FaStore,
  FaLeaf,
} from "react-icons/fa";
import { HiOutlineBars3CenterLeft } from "react-icons/hi2";
import { BsBellFill } from "react-icons/bs";
import { useMediaQuery } from "@/utils/useMediaQuery";
import axios from "axios";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { NotificationDialog } from "@/components/notificationDialog";
import { RiChatNewFill } from "react-icons/ri";
import { StylePreferenceStepper } from "@/components/StylePreferenceStepper";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePollySpeechSynthesis } from "@/components/voice/useSpeechSynthesis";
import { SpeechControl } from "@/components/voice/SpeechControl";
import  MobileNavSpacer  from "@/components/MobileNavSpacer";

interface Message {
  type: "user" | "ai";
  content: string;
  images?: string[];
  products?: any[];
  timestamp?: Date;
  isHistory?: boolean;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface GroupedConversations {
  today: any[];
  yesterday: any[];
  last7Days: any[];
  last30Days: any[];
  older: any[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get("id");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);
  const initialPrompts = [
    { icon: "🤵", text: "What should I wear to a wedding?" },
    { icon: "🎨", text: "Which colors are trending this season?" },
    { icon: "👕", text: "How can I build a versatile capsule wardrobe?" },
    { icon: "👟", text: "What style tips work best for my body type?" },
  ];
  
  
  
  // const { theme, setTheme } = useTheme();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(isDesktop);
  const [notificationCount, setNotificationCount] = useState(4);
  const [fullLoading, setFullLoading] = useState(false);
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
    // {
    //   id: "1",
    //   title: "New Style Recommendation",
    //   message: "Check out the latest fashion trends we picked for you!",
    //   timestamp: new Date(),
    //   read: false,
    //   type: "update" as const,
    // },
  ]);

  const [conversations, setConversations] = useState([]);
  // Refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Add at the top of your component
  const [showARTryOn, setShowARTryOn] = useState(false);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    isSpeechEnabled,
    setIsSpeechEnabled,
    speechSettings,
    setSpeechSettings,
    speakText,
    stopSpeech,
    voicesLoaded,
    currentlySpeaking
    
    
  } = usePollySpeechSynthesis();
  
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number>(-1);
  
  // Add useEffect for speaking new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'ai' && !lastMessage.isHistory ) {
      // Stop any existing speech before starting new
      stopSpeech();
      // Use setTimeout to ensure DOM updates complete before speaking
      setTimeout(() => {
        speakText(lastMessage.content, messages.length - 1, setCurrentlySpeakingIndex);
      }, 100);
    }
  }, [messages]); // Add isSpeechEnabled to dependencies
  
  
  // Function to open the Preferences dialog
  const viewPreferenceDialog = () => router.push("/preferences");

  // Function to close the Preferences dialog
  const closeDialog = () => setIsDialogOpen(false);
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
    
    const MAX_FILES = 2; // Set your limit
    if (files.length > MAX_FILES || imageFiles?.length > MAX_FILES) {
      toast.error(`Max ${MAX_FILES} files allowed.`);
      return;
    }
   // Validate file types and sizes
   const MAX_FILE_SIZE = 2 * 1024 * 1024; // 5MB in bytes
   const validFiles = Array.from(files).filter((file) => {
     // Check if the file is an image
     if (!file.type.startsWith('image/')) {
       toast.error(`File "${file.name}" is not an image.`);
       return false;
     }
 
     // Check file size
     if (file.size > MAX_FILE_SIZE || imageFiles?.length > MAX_FILE_SIZE) {
       toast.error(`File "${file.name}" exceeds the maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
       return false;
     }
 
     return true;
   });
     // Process valid files
  if (validFiles.length > 0) {
    // Your file processing logic here
    console.log('Valid files:', validFiles);
  } else {
    toast.error('No valid files were selected.');
  }
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
          ...(msg.type === "ai" &&
            msg.products?.length && { products: msg.products }),
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
    if (isSpeechEnabled) {
      enableAudio();
    }
    // Early return if no content
    if (!userInput.trim() && imagePreviews.length === 0) return;

    // Create new AbortController
    const controller = new AbortController();
    setAbortController(controller);

    // Set initial states
    setHasStartedChat(true);
    setIsWaitingResponse(true);
    setIsAITyping(true);

    // Store message content before clearing
    const userMessageContent = userInput;
    const userImages = [...imagePreviews];

    // Add user message to chat immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: userInput, images: imagePreviews },
    ]);

    // Clear input and images right away
    setUserInput("");
    setImagePreviews([]);
    const textPrompt = userInput;

    try {
      // Handle image uploads if any
      let uploadedImagePaths: string[] = [];
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => uploadFormData.append("images", file));

        const uploadResponse = await axios.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
        });

        if (uploadResponse.data.filePaths) {
          uploadedImagePaths = uploadResponse.data.filePaths.map(
            (file: any) => file.path
          );
        }
      }

      // Prepare AI request data
      const formData = new FormData();
      if (textPrompt.trim()) formData.append("text", textPrompt);
      formData.append("imagePaths", JSON.stringify(uploadedImagePaths));
      if (conversationId) formData.append("conversationId", conversationId);
      if (localStorageUser) formData.append("userId", localStorageUser?.id);

      // Create message objects
      const userMessage = {
        type: "user" as const,
        content: userMessageContent,
        images: uploadedImagePaths,
      };

      // Make AI API request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/fashion`,
        {
          method: "POST",
          body: formData,
          headers: {
            'x-user-id': localStorageUser?.id
          },
          signal: controller.signal,
        }
      );

      if (response.status === 429) {
        const errorData = await response.json();
        const resetTime = new Date(errorData.resetTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true // Force 12-hour format
        });
      
        toast.error(
          <div className="relative flex flex-col gap-4 p-6 max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header Row */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Request Limit Reached
              </h3>
              <button
                onClick={() => toast.dismiss()}
                className="p-1 -mt-1 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Rest of the content */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="whitespace-nowrap">Next requests available at</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {resetTime}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Upgrade Button */}
            <motion.a
              href="/pricing"
              className="group relative overflow-hidden rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/pricing';
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-90 transition-all duration-300" />
              <div className="relative flex items-center justify-center gap-2 px-6 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-900"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-amber-900 tracking-wide">
                  Upgrade to Premium
                </span>
              </div>
            </motion.a>
          </div>,
          {
            duration: 10000,
            icon: "⏳",
            style: {
              border: 'none',
              padding: 0,
              background: 'transparent',
              boxShadow: 'none',
            },
            className: '!max-w-[500px] [&>div]:relative', // Added relative positioning
          }
        );
        return;
      }
      
      
  
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      // Process AI response
      const aiMessage = {
        type: "ai" as const,
        content: data?.result || "Sorry, I could not process your request.",
        products: data?.products || [],
        isHistory: false // Ensure this is explicitly set
      };
      setIsWaitingResponse(false);
      setIsAITyping(false);
      // Update messages with AI response
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // Handle conversation storage
      if (!activeConversationId) {
        const newConversation = await createConversation([
          userMessage,
          aiMessage,
        ]);
        setActiveConversationId(newConversation.id);
        fetchUserConversations();
      } else {
        await updateConversation([userMessage, aiMessage]);
      }
    } catch (error) {
      setIsWaitingResponse(false);
      setIsAITyping(false);
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request cancelled by user");
        return;
      }
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: "Sorry, an error occurred while processing your request.",
        },
      ]);
    } finally {
      // Reset all states
      setIsWaitingResponse(false);
      setIsAITyping(false);
      setImageFiles([]);
      setAbortController(null);
      scrollToBottom();
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setIsWaitingResponse(false);
      setIsAITyping(false);
      setAbortController(null);
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
    setFullLoading(true); // Start the loading indicator

    try {
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
              const parsedUser = JSON.parse(
                localStorage.getItem("user") || "{}"
              );
              setLocalStorageUser(parsedUser);
              checkUserPreferences(parsedUser?.id);
            } else {
              console.error("Failed to create user");
            }
          } else {
            const user = data?.user;
            localStorage.setItem("user", JSON.stringify(user));
            sessionStorage.setItem("user", JSON.stringify(user));
            console.log(user, "user");
            setLocalStorageUser(user);
            checkUserPreferences(user?.id);
          }
        } else {
          console.error("Error checking user existence");
        }
      }
    } catch (error) {
      console.error("Error in checkUser:", error);
    } finally {
      setFullLoading(false); // Stop the loading indicator once the process is done
    }
  };

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
            activeConversationId === conversation.id ? "bg-gray-100" : ""
          }`}
          onClick={() => {
            handleConversationClick(conversation.id);
            if (!isDesktop) {
              setIsMobileSidebarOpen(false);
            }
          }}
        >
          {/* Conversation Title */}
          <div className="font-medium truncate">{conversation.title}</div>
          <div className="text-xs text-gray-400">
            {new Date(conversation.created_at).toLocaleDateString()}
          </div>
        </div>
      ))
    )}
  </div>;

  const groupConversationsByTimePeriod = (conversations: any[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    const groupedConversations: GroupedConversations = {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: [],
    };

    conversations.forEach((conversation) => {
      const conversationDate = new Date(conversation.created_at);

      if (conversationDate.toDateString() === today.toDateString()) {
        groupedConversations.today.push(conversation);
      } else if (conversationDate.toDateString() === yesterday.toDateString()) {
        groupedConversations.yesterday.push(conversation);
      } else if (conversationDate >= last7Days) {
        groupedConversations.last7Days.push(conversation);
      } else if (conversationDate >= last30Days) {
        groupedConversations.last30Days.push(conversation);
      } else {
        groupedConversations.older.push(conversation);
      }
    });

    return groupedConversations;
  };

  const truncateTitle = (title: string, wordLimit = 4) => {
    if (!title) return "Untitled Conversation";
    const words = title.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : title;
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    // Prevent click from triggering conversation selection
    e.stopPropagation();

    try {
      // API call to delete conversation
      const response = await fetch(
        `/api/auth/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        fetchUserConversations();
      } else {
        console.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Modify the conversations rendering in the sidebar
  const renderConversationGroup = (title: string, conversations: any[]) => {
    if (conversations.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        {/* Sidebar-style title */}
        <div className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md uppercase tracking-wide flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-md text-xs">
            {conversations.length}
          </span>
        </div>

        {/* Conversation List */}
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group relative px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between rounded-md ${
              activeConversationId === conversation.id
                ? "bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
            onClick={() => {
              handleConversationClick(conversation.id);
              if (!isDesktop) {
                setIsMobileSidebarOpen(false);
              }
            }}
          >
            {/* Content Section */}
            <div className="flex-1 mr-2">
              {/* Conversation Title */}
              <div className="font-medium truncate text-gray-900 dark:text-gray-100">
                {truncateTitle(conversation.title)}
              </div>

              {/* Tooltip */}
              <div className="absolute left-4 top-full mt-1 w-max max-w-xs bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {conversation.title}
              </div>

              {/* Timestamp & Unread Count */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center mt-1">
                <span>
                  {new Date(conversation.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Delete Button - Aligned in One Line */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent conversation selection
                handleDeleteConversation(conversation.id, e);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 md:opacity-0 md:group-hover:opacity-100 dark:text-gray-500 dark:hover:text-red-400"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Modify the conversations rendering in the sidebar
  const renderConversations = () => {
    if (isLoadingChats) {
      return (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      );
    }

    const groupedConversations = groupConversationsByTimePeriod(conversations);

    return (
      <div className="overflow-y-auto h-full">
        {renderConversationGroup("Today", groupedConversations.today)}
        {renderConversationGroup("Yesterday", groupedConversations.yesterday)}
        {renderConversationGroup("Last 7 Days", groupedConversations.last7Days)}
        {renderConversationGroup(
          "Last 30 Days",
          groupedConversations.last30Days
        )}
        {renderConversationGroup("Older", groupedConversations.older)}
      </div>
    );
  };

  const fetchUserConversations = async () => {
    try {
      setIsLoadingChats(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`/api/auth/conversations/user/${user.id}`);

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setConversations(sortedData);
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
    router.push("/chat", { scroll: false });
  };

  // Add new state for half loader
  const [halfLoading, setHalfLoading] = useState(false);

  const loadConversation = async (conversationId: string) => {
    try {
      if(searchParams?.get("id")) {
        setHalfLoading(true);
      }
     // Use half loader instead of full
      const response = await fetch(`/api/auth/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to load conversation");

      const data = await response.json();
      setActiveConversationId(conversationId);

      const historyMessages = data.messages.map((message: Message) => ({
        ...message,
        isHistory: true,
      }));

      setMessages(historyMessages);
      setHasStartedChat(true);
      setHalfLoading(false);
      router.push(`/chat?id=${conversationId}`, { scroll: false });
    } catch (error) {
      console.error("Error loading conversation:", error);
      setHalfLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    loadConversation(conversationId);
    if (!isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  };

  const checkUserPreferences = async (userId: any) => {
    try {
      const response = await fetch(`/api/preferences?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      const hasExistingPreferences =
        data.preferences &&
        typeof data.preferences === "object" &&
        Object.keys(data.preferences).length > 0;

      setHasPreferences(hasExistingPreferences);

      return hasExistingPreferences;
    } catch (error) {
      console.error("Error checking preferences:", error);
      return false;
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
    if (conversationId && conversationId !== activeConversationId) {
      loadConversation(conversationId);
    } else if (!conversationId && messages.length === 0) {
      startNewChat();
    }
  }, [conversationId]);

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
      const parsedUser = JSON.parse(user);
      setLocalStorageUser(parsedUser);
      checkUserPreferences(parsedUser?.id);
    }
  }, []);
  // Loading State
  if (status === "loading" || fullLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  const handleARTryOn = (productImage: string) => {
    setSelectedProductImage(productImage);
    setShowARTryOn(true);
  };

  const enableAudio = async () => {
    try {
      // 1. Create and resume audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      
      // 2. Play your silent.mp3 file
      const silentAudio = new Audio('/silent.mp3');
      silentAudio.volume = 0; // Ensure silent playback
      await silentAudio.play();
      
      // 3. Enable speech after successful playback
      setIsSpeechEnabled(true);
      
      
      // 4. Clean up after short delay
      setTimeout(() => {
        silentAudio.pause();
        silentAudio.remove();
      }, 500);
    } catch (error) {
      console.error('Audio enable failed:', error);
      toast.error('Enable audio: Click speaker then allow permissions');
      setIsSpeechEnabled(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row 
      bg-gradient-to-r from-blue-50 to-purple-50 
      dark:from-gray-900 dark:to-gray-800
      transition-colors duration-200"
    >
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
        fixed md:fixed md:translate-x-0 w-72 
        ${isDesktop ? "h-screen" : "h-full"} 
        z-40 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700
        border border-gray-200 dark:border-gray-600 rounded-2xl shadow-lg
        transition-transform duration-300 ease-in-out
        md:block
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-t-2xl">
            <div className="flex items-center gap-4">
              <Image
                src="/fashion-wear.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full shadow-md"
              />
              <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Glamourhall
              </span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-300 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              startNewChat();
              if (!isDesktop) setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <Image
              src="/new-message.png"
              alt="New Chat"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-medium text-gray-800 dark:text-gray-300">
              New Chat
            </span>
          </button>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingChats ? (
              <div className="flex justify-center p-4 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
              </div>
            ) : (
              renderConversations()
            )}
          </div>

          {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {localStorageUser?.plan === 'premium' ? (
              <div className="relative flex flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
           
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] opacity-0 hover:opacity-100 transition-opacity" />
                
      
                <div className="relative z-10 flex flex-col items-center">
                  <FaCrown className="h-5 w-5 text-amber-800 dark:text-amber-100 mb-1.5" />
                  <div className="text-center">
                    <p className="text-[0.75rem] font-semibold text-amber-900 dark:text-amber-50 tracking-wide uppercase">
                      Premium Account
                    </p>
                    <p className="text-[0.65rem] text-amber-800/90 dark:text-amber-100/80 mt-0.5 font-medium">
                      Active
                    </p>
                  </div>
                </div>
                <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-amber-500/10 dark:bg-amber-400/10" />
                <div className="absolute -left-2 -bottom-2 h-6 w-6 rounded-full bg-yellow-400/10 dark:bg-yellow-300/10" />
              </div>
            ) : (
              <motion.button
                onClick={() => router.push("/pricing")}
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 p-0.5 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_100%_0%,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3 rounded-[11px] bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3.5">
                  <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_100%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)]" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-amber-900 tracking-wide">
                    Upgrade to Premium
                  </span>
                  <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-amber-600/10" />
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-600/5" />
                </div>
              </motion.button>
            )}
          </div>  */}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen md:ml-72">
        {/* Page content */}
        <MobileNavSpacer />
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-md shadow-lg z-10 dark:bg-gray-900/30">
          <div className="px-4 py-3 flex justify-between items-center">
            {/* Left Section: Logo and Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden text-gray-900 dark:text-gray-100"
              >
                <HiOutlineBars3CenterLeft
                  size={24}
                  className="hover:text-purple-500 transition-colors"
                />
              </button>

              <div className="flex items-center gap-2">
                <img
                  src="/fashion-wear.png"
                  alt="Logo"
                  className="w-8 h-8 object-cover rounded-full shadow-md"
                />
                <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  GlamourHall
                </span>
              </div>
            </div>

            {/* Right Section: Theme Toggle, Notifications, Profile */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Speech Control */}
              <div className="hidden md:block">
                <SpeechControl
                  isSpeechEnabled={isSpeechEnabled}
                  setIsSpeechEnabled={setIsSpeechEnabled}
                  stopSpeech={stopSpeech}
                  currentlySpeakingIndex={currentlySpeakingIndex}
                  currentlySpeaking={currentlySpeaking}
                  className="w-10 h-10 rounded-full backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 
                            border-2 border-purple-300/50 dark:border-purple-500/30 shadow-lg
                            hover:shadow-xl transition-all duration-300
                            flex items-center justify-center
                            hover:-translate-y-0.5 active:translate-y-0
                            [transform-style:preserve-3d]"
                  iconClassName="w-5 h-5"
                />
              </div>
              {/* Settings Button */}
              <div className="relative">
                <button
                  onClick={viewPreferenceDialog}
                  className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors duration-200"
                >
                  <img 
                    src="/settingss.png"
                    alt="Settings" 
                    className="w-7 h-7 object-contain"
                  />
                </button>
              </div>
              {/* Notifications */}
              {(session?.user || localStorageUser) && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
                  >
                    <img 
                      src="/bell.png" 
                      alt="Notifications" 
                      className="w-5 h-5 text-gray-700 dark:text-gray-300" 
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden mt-[20px] md:mt-[60px] mb-[80px] md:mb-12 md:ml-0">
          <div
            className={`h-full overflow-y-auto ${
              window.innerWidth < 768 ? "mb-22" : ""
            }`}
            ref={chatContainerRef}
          >
            <div className="max-w-3xl mx-auto px-4 py-10 mb-[1rem] md:mb-0">
              {halfLoading && (
                <div className="flex justify-center items-center h-full py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mt-32"></div>
                </div>
              )}

              {/* Welcome Section - Only show if chat hasn't started */}
              {!hasStartedChat && messages.length <= 1 && !halfLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-8 space-y-8"
                >
                  {/* Animated Logo */}
                  <motion.div
  initial={{ scale: 0, rotateX: -90, rotateY: 45 }}
  animate={{ 
    scale: 1,
    rotateX: [0, 15, -15, 0],
    rotateY: [0, 15, -15, 0],
    transition: { 
      type: "spring", 
      stiffness: 120,
      damping: 15,
      rotateX: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      },
      rotateY: {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }
    } 
  }}
  whileHover={{ 
    scale: 1.1,
    rotateZ: [0, 3, -3, 0],
    transition: { type: "spring", stiffness: 300 }
  }}
  whileTap={{ scale: 0.95 }}
  className="relative mx-auto w-32 h-32 perspective-1000"
>
  {/* 3D Aura Layers */}
  <div className="absolute inset-0 rounded-full overflow-hidden">
    {/* Pulsing Core Glow */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full"
      animate={{
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Rotating Particle Field */}
    <motion.div 
      className="absolute inset-0 bg-[url('/sparkles.png')] bg-contain opacity-20"
      animate={{
        rotate: 360,
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>

  {/* 3D Glass Sphere */}
  <div className="relative w-full h-full rounded-full transform-style-preserve-3d">
    {/* Inner Refraction */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent backdrop-blur-xl border-2 border-white/20 shadow-4xl" />
    
    {/* Dynamic Lighting */}
    <motion.div 
      className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/10 to-transparent"
      animate={{
        x: [-50, 50, -50],
        y: [-30, 30, -30],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Floating Bot */}
    <motion.div
      className="relative z-10 w-full h-full flex items-center justify-center"
      animate={{
        y: ["0%", "-10%", "0%"],
        rotateZ: [0, 0.5, -0.5, 0],
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotateZ: {
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <motion.img
        src="/glambot.png"
        alt="Fashion AI Icon"
        className="w-24 h-24 transform-style-preserve-3d"
        animate={{
          rotateX: [0, 15, 0],
          rotateY: [0, 15, 0],
          filter: "drop-shadow(0 10px 8px rgba(192, 132, 252, 0.3))"
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
        whileHover={{
          scale: 1.1,
          filter: "drop-shadow(0 15px 10px rgba(192, 132, 252, 0.5))"
        }}
      />
    </motion.div>
  </div>

  {/* Interactive Shadow */}
  <motion.div 
    className="absolute -bottom-4 left-1/2 w-24 h-4 bg-purple-400/20 dark:bg-purple-600/30 blur-xl rounded-full"
    animate={{
      scaleX: [0.8, 1.2, 0.8],
      opacity: [0.6, 0.8, 0.6]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
</motion.div>

                  {/* Headings */}
                  <div className="space-y-4">
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-400 bg-clip-text text-transparent"
                    >
                      Your AI Style Companion
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    >
                      Transform your wardrobe with <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold">AI-powered fashion insights</span> tailored just for you
                    </motion.p>
                  </div>

                  {/* Prompts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-4">
                    {initialPrompts.map((prompt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <button
                          onClick={() => handlePromptClick(prompt.text)}
                          className="group w-full p-6 rounded-2xl border border-white/20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg hover:bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-left relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#e879f920_0%,#3b82f600_50%)] opacity-0 group-hover:opacity-100 animate-spin-slow" />
                          <div className="flex items-center gap-4 relative z-10">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="text-base md:text-lg p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-blue-900 shadow-inner"
                            >
                              {prompt.icon}
                            </motion.span>
                            <span className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 transition-colors">
                              {prompt.text}
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Feature Chips */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-3"
                  >
                    {[
                      { label: 'Style Advisor', icon: '👗', color: 'purple' },
                      { label: 'Outfit Planner', icon: '📈', color: 'pink' },
                      { label: 'Color Analysis', icon: '🎨', color: 'blue' },
                      { label: 'Eco Styles', icon: '🌿', color: 'green' }
                    ].map((badge, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 rounded-full backdrop-blur-sm border text-xs md:text-sm flex items-center gap-2 transition-colors
                          ${badge.color === 'purple' ? 
                            'bg-purple-50/70 dark:bg-purple-900/30 border-purple-200/50 dark:border-purple-700/50 hover:bg-purple-100/50 dark:hover:bg-purple-800/40 text-purple-600 dark:text-purple-300' :
                          badge.color === 'pink' ?
                            'bg-pink-50/70 dark:bg-pink-900/30 border-pink-200/50 dark:border-pink-700/50 hover:bg-pink-100/50 dark:hover:bg-pink-800/40 text-pink-600 dark:text-pink-300' :
                          badge.color === 'blue' ?
                            'bg-blue-50/70 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-700/50 hover:bg-blue-100/50 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-300' :
                            'bg-green-50/70 dark:bg-green-900/30 border-green-200/50 dark:border-green-700/50 hover:bg-green-100/50 dark:hover:bg-green-800/40 text-green-600 dark:text-green-300'
                          }`}
                      >
                        <span className="text-xl">{badge.icon}</span>
                        <motion.span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 transition-colors">
                          {badge.label}
                        </motion.span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          badge.color === 'purple' ? 'bg-purple-400' :
                          badge.color === 'pink' ? 'bg-pink-400' :
                          badge.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'
                        }`} />
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Chat Messages */}
              {!halfLoading && messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  {message.type === "ai" && (
                    <div className="w-16 h-16 mr-3 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center shadow-lg dark:from-pink-700 dark:to-blue-800">
                      <motion.img
                        src="/glambot.png"
                        alt="Icon"
                        animate={{ y: ["0%", "-10%", "0%"] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    {/* Image Section */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-3 mt-2 flex flex-wrap gap-3">
                        {message.images.map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`Message Image ${imgIndex}`}
                            className="w-36 h-36 object-cover rounded-xl shadow-md"
                          />
                        ))}
                      </div>
                    )}
                    {/* Text Content Section */}
                    {message.content && (
                      <div
                        className={`relative text-sm md:text-base  inline-block rounded-2xl px-5 py-4 shadow-lg ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.type === "ai" &&
                        index === messages.length - 1 &&
                        !message.isHistory ? (
                          <TypingAnimation content={message.content} />
                        ) : (
                          <ReactMarkdown className="text-sm md:text-base speech-friendly">{message.content}</ReactMarkdown>
                        )}
                      </div>
                    )}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400 transition-transform hover:scale-110" />
                          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                            Style Matches
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                          {message.products.map((product, productIndex) => (
                            <div key={productIndex} className="relative">
                              <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block bg-white dark:bg-gray-800 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:rotate-1"
                              >
                                {/* Image container */}
                                <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                  <img
                                    src={product?.image}
                                    alt={product?.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                 
                                  />
                                 
                                </div>

                                {/* Product Info */}
                                <div className="p-3 md:p-4">
                                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                    {product.name}
                                  </h3>
                                </div>

                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400 rounded-xl transition-colors duration-300 pointer-events-none" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAITyping && (
                <div className="flex justify-start my-3 pb-20 md:pb-3">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-purple-100/20 dark:border-purple-800/20">
                    {/* Brain Icon (Replaces Sparkles) */}
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <BrainCircuit className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>

                    {/* Text and Loader Animation */}
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-sm font-medium">Thinking...</span>

                      {/* Dots Animation */}
                      <motion.div className="flex gap-1 pt-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.span
                            key={i}
                            className="w-1 h-1 rounded-full bg-purple-500"
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Bar */}
   
        <div className="fixed md:left-72 md:bottom-0 bottom-16 left-0 right-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t shadow z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 pb-6">
          {imagePreviews.length > 0 && (
                <div className="mt-4 mb-4 flex gap-2 overflow-x-auto">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1 -right-1 text-red-600 bg-white rounded-full p-1 shadow-sm"
                      >
                        <FaTimesCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            <form onSubmit={handleSendMessage} className="relative lg:ml-16">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Let's find your perfect look!"
                    className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base md:text-base chat-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    style={{ touchAction: 'manipulation' }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                    title="Upload Image"
                  >
                    <Image
                      src="/picture.png"
                      alt="Upload"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                {isWaitingResponse ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    title="Cancel"
                  >
                    <FaStopCircle className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 text-white hover:opacity-90 transition-opacity"
                    title="Send"
                  >
                    <FaPaperPlane className="h-5 w-5" />
                  </button>
                )}
              </div>
            
            </form>
          </div>
        </div>
        <Toaster />
      </div>
      <NotificationDialog
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
      {!hasPreferences && (
        <StylePreferenceStepper
          isOpen={!hasPreferences}
          onClose={() => setHasPreferences(true)}
          onSubmit={async (preferences: any) => {
            setHasPreferences(true);
            // Additional logic here if needed
          }}
          userId={localStorageUser?.id}
        />
      )}
      {/* Mobile Speech Control Floating Button - Only show when chat hasn't started */}
      {hasStartedChat &&  (
        <div className="fixed md:hidden bottom-[9.5rem] right-4 z-50"> {/* Increased bottom spacing */}
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative"
          >
            <SpeechControl
              isSpeechEnabled={isSpeechEnabled}
              setIsSpeechEnabled={setIsSpeechEnabled}
              stopSpeech={stopSpeech}
              currentlySpeakingIndex={currentlySpeakingIndex}
              currentlySpeaking={currentlySpeaking}
              className="w-10 h-10 rounded-full backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 
                        border-2 border-purple-300/50 dark:border-purple-500/30 shadow-2xl
                        hover:shadow-3xl transition-all duration-300
                        flex items-center justify-center
                        hover:-translate-y-1 active:translate-y-0
                        [transform-style:preserve-3d]"
              iconClassName="w-6 h-6"
            />
            {/* Enhanced 3D effect elements */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-400/20 
                           mix-blend-overlay [transform:translateZ(1px)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-white/30 
                           [transform:translateZ(2px)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full shadow-inner shadow-black/10 
                           [transform:translateZ(3px)] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
