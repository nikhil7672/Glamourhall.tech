// components/dashboard.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBars, FaTimes, FaComments, FaHome, FaSignOutAlt, 
  FaUser, FaCog, FaPaperPlane, FaMicrophone, FaImage,
  FaChartLine, FaBookmark, FaBell, FaQuestionCircle 
} from 'react-icons/fa'
import { Button } from "@/components/ui/button"
import { useMediaQuery } from '@/utils/useMediaQuery'; // Ensure this is correctly imported
import axios from 'axios'

interface Message {
  type: 'user' | 'ai'
  content: string
  image?: string
  timestamp?: Date
}

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  // UI States
  const [showChat, setShowChat] = useState(true)
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(isDesktop);

  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content: "Hello! How can I assist you today?",
      timestamp: new Date()
    },
  ])
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageInputRef = useRef<HTMLInputElement | null>(null)

  // Menu Configuration
  const menuItems: MenuItem[] = [
    { icon: FaHome, label: 'Home', href: '/' },
    { icon: FaChartLine, label: 'Analytics', href: '/analytics' },
    { icon: FaBookmark, label: 'Saved Items', href: '/saved' },
    { icon: FaBell, label: 'Notifications', href: '/notifications' },
    { icon: FaUser, label: 'Profile', href: '/profile' },
    { icon: FaCog, label: 'Settings', href: '/settings' },
    { icon: FaQuestionCircle, label: 'Help Center', href: '/help' },
  ]

  // Authentication Effect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Chat Scroll Effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        setIsMobileSidebarOpen(prev => !prev)
      }
      if (e.key === 'Escape' && window.innerWidth < 768) {
        setIsMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    setIsMobileSidebarOpen(isDesktop);
  }, [isDesktop]);
  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Message Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: userInput },
    ]);

    // Set AI typing state to true
    setIsAITyping(true);

    try {
        const message = userInput
        setUserInput('')
      // Send a POST request with the refined text prompt
      const response = await axios.post('/api/huggingface', {
        prompt: message,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.result) {
        // Add AI response to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'ai', content: response.data.result.content },
        ]);
      } else {
        console.error('No response from API');
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'ai', content: 'Sorry, I could not process your request.' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'ai', content: 'Sorry, an error occurred while processing your request.' },
      ]);
    } finally {
      // Clear input field and stop typing animation
      setUserInput('');
      setIsAITyping(false);
    }
  };
  const simulateAIResponse = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setMessages(prev => [...prev, {
      type: "ai",
      content: "Thank you for your message. How else can I help?",
      timestamp: new Date()
    }])
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    // Add the image upload message to the chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: "Image uploaded",
        image: URL.createObjectURL(file), // Use URL for display
        timestamp: new Date(),
      },
    ]);
  
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('image', file);
  
      // Send the image file to the server for processing
      const response = await axios.post('/api/huggingface', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Handle the AI response
      if (response.data.result) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: JSON.stringify(response.data.result) },
        ]);
      } else {
        console.error("No response from API");
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "ai", content: "Sorry, I could not process your image." },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: "Sorry, an error occurred while processing your image.",
        },
      ]);
    }
  };
  

  const handleVoiceMessage = async () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessages(prev => [...prev, { 
        type: "user", 
        content: "Voice message sent",
        timestamp: new Date()
      }])
      simulateAIResponse()
    }
  }

  const handleLogout = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
      {/* Mobile Overlay */}
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
          fixed md:static md:translate-x-0 w-72 ${isDesktop ? 'h-screen' : 'h-full'} z-40 
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          transition-transform duration-200
          md:block
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
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
                    ${pathname === item.href ? 
                      'bg-purple-50 dark:bg-gray-700 text-purple-600 dark:text-purple-400' : ''}
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="text-gray-900 dark:text-white mr-4 md:hidden"
              >
                <FaBars size={24} />
              </button>
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2" 
                />
                <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                  GlamourHall
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-gray-900 dark:text-white" 
                onClick={() => setShowChat(!showChat)}
              >
                <FaComments className="mr-2 h-4 w-4" />
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
  <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
    Welcome, {session?.user?.name}
  </h1>
  <p className="mb-4 text-gray-600 dark:text-gray-300">
    This is your dashboard. Here you can manage your account, view your style history, and more.
  </p>

  {/* Chat Section */}
  {showChat && (
    <div className="mt-4 md:mt-8 border rounded-lg shadow-lg bg-white dark:bg-gray-800 max-w-4xl mx-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          Chat with AI Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Online</span>
        </div>
      </div>

      <div className="p-4 overflow-y-auto h-[400px] md:h-[500px] scroll-smooth" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} mb-4`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3.5 ${message.type === "user" ? "bg-purple-500 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"}`}>
              {message.image && (
                <img src={message.image} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
              )}
              <p className="break-words">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block text-right">
                {message.timestamp?.toLocaleTimeString()}
              </span>
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

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 dark:bg-gray-750 rounded-b-lg">
        <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              name="message"
              placeholder="Type your message..."
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
            />
          </div>
          <div className="flex mt-2 sm:mt-0 space-x-2">
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2">
              <FaPaperPlane className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 dark:border-gray-600 px-4 py-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaImage className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className={`border-gray-300 dark:border-gray-600 px-4 py-2 ${isRecording ? "bg-red-50 dark:bg-red-900" : ""}`}
              onClick={handleVoiceMessage}
            >
              <FaMicrophone className="h-4 w-4" color={isRecording ? "red" : "currentColor"} />
            </Button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
      </form>
    </div>
  )}
</main>


        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow w-full">
          <div className="container mx-auto px-6 py-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} GlamourHall. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}