"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcIdea } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, LightbulbIcon, DollarSign, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  Upload,
  Send,
  History,
  LogOut,
  Menu,
  Home,
  Users,
  Settings,
  HelpCircle,
  BookOpen,
  UserPlus,
  Zap,
  Star,
  Mic,
  X,
  LogIn,
  Image as ImageIcon,
  BrainCircuit
} from "lucide-react";


interface Message {
  type: string;
  content: string;
  image?: string | ArrayBuffer | null;
}
export function LandingPageComponent() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content:
        "Hello! I'm your AI fashion assistant. How can I help you today?",
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Slow down video playback for a more subtle effect
    }
  }, []);

  const handlePhotoUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMessages([
          ...messages,
          { type: "user", content: "Image uploaded", image: e?.target?.result },
        ]);
        simulateAIResponse();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoCapture = () => {
    // In a real app, this would trigger the device camera
    setMessages([...messages, { type: "user", content: "Photo captured" }]);
    simulateAIResponse();
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = (e.target as HTMLFormElement).message.value;
    if (message.trim()) {
      setMessages([...messages, { type: "user", content: message }]);
      (e.target as HTMLFormElement).reset();
      simulateAIResponse();
    }
  };

  const handleVoiceMessage = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // In a real app, this would stop recording and process the audio
      setMessages([
        ...messages,
        { type: "user", content: "Voice message sent" },
      ]);
      simulateAIResponse();
    }
    // In a real app, this would start recording
  };

  const simulateAIResponse = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "Thank you for your message. Your style choices look great! The colors complement each other well, and the fit is perfect for your body type. I particularly like how you've accessorized. Keep up the great style!",
        },
      ]);
    }, 1000);
  };

  const handleLogout = () => {
    setShowChat(false);
    router.push("/");
  };

  const MenuItems = ({ mobile = false }) => (
    <>
      <Link
        href="/"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Home
      </Link>
      <Link
        href="#about"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        About
      </Link>
      <Link
        href="#features"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Features
      </Link>
      <Link
        href="#testimonials"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Testimonials
      </Link>
      <Link
        href="/pricing"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Pricing
      </Link>
      {/* <Link
        href="/blogs"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Blogs
      </Link> */}
    </>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link className="flex items-center" href="/">
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                GlamourHall
              </span>
            </Link>
          </div>

          {/* User/Navigation Section */}
          {showChat ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-900 dark:text-white"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium mr-4 text-gray-700 dark:text-gray-300">
                <MenuItems />
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Link href="/auth/register">
                  <Button className="hidden sm:inline-flex bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:bg-purple-700 transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden ml-2 text-gray-900 dark:text-white"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>

                {/* Enhanced Drawer Content */}
                <SheetContent
                  side="right"
                  className="bg-gradient-to-br from-purple-400  to-blue-400   w-[250px] sm:w-[300px] shadow-lg rounded-l-xl transition-transform duration-300 ease-in-out [&>button]:text-white [&>button]:hover:text-yellow-300 [&>button]:transition-colors [&>button]:duration-200 [&>button]:scale-150 [&>button]:top-6 [&>button]:right-6"
                >
                  <div className="p-6">
                    <nav className="flex flex-col space-y-6 mt-8">
                      <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-lg font-medium text-white hover:text-yellow-300 transition-colors duration-200"
                      >
                        <Home className="h-5 w-5 mr-2" /> Home
                      </Link>
                      <Link
                        href="/#features"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-lg font-medium text-white hover:text-yellow-300 transition-colors duration-200"
                      >
                        <Star className="h-5 w-5 mr-2" /> Features
                      </Link>
                      <Link
                        href="/pricing" // Updated href for Pricing
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-lg font-medium text-white hover:text-yellow-300 transition-colors duration-200"
                      >
                        <Tag className="h-5 w-5 mr-2" />
                        Pricing
                      </Link>
                      <Link
                        href="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-lg font-medium text-white hover:text-yellow-300 transition-colors duration-200"
                      >
                        <LogIn className="h-5 w-5 mr-2" /> Login
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center text-lg font-medium text-white hover:text-yellow-300 transition-colors duration-200"
                      >
                        <UserPlus className="h-5 w-5 mr-2" /> Sign Up
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {router.pathname === "/blogs" ? (
          // Blogs Page (unchanged)
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8">
                Fashion Insights
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>
                        Latest Trend:{" "}
                        {
                          [
                            "Summer Chic",
                            "Autumn Layers",
                            "Winter Warmth",
                            "Spring Pastels",
                            "Sustainable Fashion",
                            "Retro Revival",
                          ][index]
                        }
                      </CardTitle>
                      <CardDescription>
                        Posted on {new Date().toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Image
                        src={`/placeholder.svg?height=200&width=400&text=Fashion+Trend+${
                          index + 1
                        }`}
                        alt={`Fashion trend ${index + 1}`}
                        width={400}
                        height={200}
                        className="rounded-lg object-cover w-full"
                      />
                      <p className="mt-2">
                        Discover the latest fashion trends and how to
                        incorporate them into your wardrobe. Our AI stylist
                        breaks down the key elements and offers personalized
                        advice.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">Read More</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : !showChat ? (
          // Landing Page with Video Background
          <>
            {/* Hero Section with Video Background */}
            <section className="relative w-full py-16 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
                poster="/video-poster.jpg"
              >
                <source src="/cover.mp4" type="video/mp4" />
                <source src="/background-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>

              {/* Overlay for contrast */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent"></div>

              <div className="container relative z-10 mx-auto px-4 md:px-6 flex items-center justify-center h-full">
                <div className="flex flex-col items-center space-y-6 text-center text-white max-w-4xl animate-fade-in">
                  {/* Headline */}
                  <div className="space-y-4">
                    <h1
                      className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                      style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      AI-Powered Fashion Advice, Just for You
                    </h1>
                    <p
                      className="mx-auto max-w-[700px] text-base sm:text-lg md:text-xl lg:text-2xl"
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Receive personalized fashion recommendations based on your
                      style.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
                    <Link href="/auth/login">
                      <Button className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl hover:brightness-110 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center">
                        <BrainCircuit className="mr-3 h-7 w-7 transform transition-transform duration-300 hover:rotate-12" />
                        Fashion Advice
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section
              id="features"
              className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="container mx-auto px-6">
                <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12 text-gray-900 dark:text-white sm:text-5xl">
                  Why Choose GlamourHall
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: Zap,
                      title: "Style Suggestions",
                      description:
                        "Receive personalized outfit recommendations based on your preferences and the latest trends.",
                    },                    
                    {
                      icon: BookOpen,
                      title: "Personalized Tips",
                      description:
                        "Get expert tips on how to elevate your style based on your wardrobe and preferences."
                    },                    
                    {
                      icon: Users,
                      title: "Fashion Collaboration",
                      description:
                        "Collaborate with our AI to create outfits and refine your personal style."
                    },                    
                    {
                      icon: Camera,
                      title: "Visual Analysis",
                      description:
                        "Our AI analyzes your photos to provide accurate style suggestions.",
                    },
                    {
                      icon: Settings,
                      title: "Manage Preferences",
                      description:
                        "Easily add, edit, and manage your style preferences for a more tailored experience."
                    },                    
                    {
                      icon: HelpCircle,
                      title: "24/7 Support",
                      description:
                        "Get help anytime with our round-the-clock customer support.",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-transform duration-300 hover:scale-105"
                    >
                      <div className="flex flex-col items-center">
                        <feature.icon className="h-12 w-12 mb-4 text-blue-400" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-center text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* About Section */}
            <section
              id="about"
              className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="container mx-auto px-6">
                <div className="grid items-center gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
                  <Image
                    src="/woman.jpg"
                    width={400}
                    height={300}
                    alt="AI Fashion Assistant"
                    className="mx-auto aspect-video overflow-hidden rounded-2xl shadow-lg object-cover object-center transition-transform duration-300 hover:scale-105 sm:w-full lg:order-last"
                  />
                  <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
                        About GlamourHall
                      </h2>
                      <p className="max-w-[600px] text-gray-600 md:text-lg lg:text-base xl:text-lg dark:text-gray-300 leading-relaxed">
                        GlamourHall is your personal AI fashion assistant. We
                        combine cutting-edge AI technology with fashion
                        expertise to provide instant, personalized style advice.
                        Our mission is to help everyone feel confident and look
                        their best, no matter the occasion.
                      </p>
                    </div>
                    <Button onClick={()=> router.push('/auth/login')} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-purple-700 transition-colors duration-300 w-fit">
                      Learn More About Us
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section
              id="testimonials"
              className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="container mx-auto px-6">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center mb-12 sm:text-5xl">
                  What Our Users Say
                </h2>
                <Carousel className="relative w-full max-w-2xl mx-auto">
                  <CarouselContent className="flex space-x-6">
                    {[
                      {
                        name: "Emily S.",
                        comment:
                          "GlamourHall has completely transformed my wardrobe. I feel more confident than ever!",
                        rating: 5,
                      },
                      {
                        name: "Michael T.",
                        comment:
                          "As someone who struggles with fashion choices, this app has been a game-changer.",
                        rating: 5,
                      },
                      {
                        name: "Sarah L.",
                        comment:
                          "The AI stylist gives such personalized advice. It's like having a fashion expert in my pocket!",
                        rating: 4,
                      },
                    ].map((testimonial, index) => (
                      <CarouselItem key={index} className="w-full">
                        <Card className="rounded-lg shadow-lg bg-white dark:bg-gray-800 transform transition-transform duration-300 hover:scale-105">
                          <CardContent className="flex flex-col items-center justify-center p-8">
                            <div className="flex mb-4">
                              {Array.from({ length: testimonial.rating }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="w-6 h-6 fill-yellow-400 stroke-yellow-400"
                                  />
                                )
                              )}
                            </div>
                            <p className="text-lg font-medium text-center text-gray-800 dark:text-gray-200 mb-4">
                              "{testimonial.comment}"
                            </p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              - {testimonial.name}
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Custom Navigation Arrows */}
                  <CarouselPrevious className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-600 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-700 dark:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </CarouselPrevious>
                  <CarouselNext className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-600 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-700 dark:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </CarouselNext>
                </Carousel>
              </div>
            </section>

            {/* Pricing Section */}
            {/* <section
              id="pricing"
              className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-12 sm:text-5xl">
                  Choose Your Style Plan
                </h2>
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-12">
                  {[
                    {
                      name: "Style Starter",
                      price: "$0/month",
                      features: [
                        "Limited outfit photo analyses",
                        "Basic style suggestions",
                        "Limited makeup recommendations",
                        "Basic trend reports",
                      ],
                    },
                    {
                      name: "Fashion Forward",
                      price: "$2.99/month",
                      features: [
                        "Unlimited outfit & makeup photo analyses",
                        "Detailed style and makeup suggestions",
                        "Trend-based outfit recommendations",
                        "Personalized wardrobe recommendations",
                        "Seasonal trend forecasts",
                      ],
                    },
                    {
                      name: "Couture Connoisseur",
                      price: "$4.99/month",
                      features: [
                        "Unlimited outfit & makeup photo analyses",
                        "Detailed style and makeup suggestions",
                        "Everything in Fashion Forward",
                        "Advanced AI-powered style coaching",
                        "Priority feature updates",
                        "Early access to new AI models",
                      ],
                    },
                  ].map((plan, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg shadow-lg border ${
                        index === 1
                          ? "bg-purple-50 dark:bg-purple-900 border-purple-500 transform scale-105"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                      } p-8 transition-transform duration-300 hover:scale-105`}
                    >
                      {index === 1 && (
                        <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {plan.name}
                      </h3>
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                        {plan.price}
                      </p>
                      <ul className="space-y-4 text-left">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <svg
                              className="h-5 w-5 text-green-500 mr-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-200 text-base">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <button
                          className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors duration-300 ${
                            index === 1
                              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:bg-purple-600"
                              : "bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-900"
                          }`}
                          onClick={() => console.log("Plan Selected")}
                        >
                          {index === 1 ? "Recommended" : "Choose Plan"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section> */}

            {/* CTA Section */}
            <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                  Ready to Transform Your Style?
                </h2>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl mt-6 mb-10 text-gray-100">
                  Join thousands of fashion enthusiasts who have elevated their
                  style with GlamourHall. Start your journey today!
                </p>
                <Button
                  className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push('/auth/login')}
                >
                  Get Started Now
                </Button>
              </div>
            </section>
          </>
        ) : (
          // AI Chat Page (Dashboard-like layout with chat)
          <div className="flex h-[calc(100vh-3.5rem)] bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 p-4 hidden md:block">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <History className="mr-2 h-4 w-4" />
                  Style History
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Community
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
              </nav>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Recent Outfits</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <span className="text-sm">Outfit {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {message.image ? (
                          <Image
                            src={message.image}
                            alt="Uploaded image"
                            width={200}
                            height={200}
                            className="rounded-lg"
                          />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Textarea
                    name="message"
                    placeholder="Ask for style advice..."
                    className="flex-1 min-h-[50px]"
                  />
                  <div className="flex flex-col space-y-2">
                    <Button type="submit">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVoiceMessage}
                    >
                      <Mic
                        className="h-4 w-4"
                        color={isRecording ? "red" : "currentColor"}
                      />
                    </Button>
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
            </div>
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                About GlamourHall
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GlamourHall is your AI-powered fashion assistant, helping you
                look your best every day with personalized style advice.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/blogs"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Blog
                  </Link>
                </li> */}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Cookie Policy
                  </Link>
                </li> */}
              </ul>
            </div>
            <div>
  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Fashion Challenge</h3>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    Ready for a style challenge? Upload your outfit and let our AI analyze it for suggestions and improvements. See how your fashion choices measure up!
  </p>
</div>

          </div>
          <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} GlamourHall. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
