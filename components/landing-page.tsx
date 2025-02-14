"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcIdea } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  LightbulbIcon,
  DollarSign,
  Tag,
  Info,
  MessageSquare,
} from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
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
  BrainCircuit,
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
      {/* <Link
        href="/pricing"
        className={`block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          mobile ? "text-lg" : ""
        }`}
      >
        Pricing
      </Link> */}
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

  const features = [
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
        "Get expert tips on how to elevate your style based on your wardrobe and preferences.",
    },
    {
      icon: Users,
      title: "Fashion Collaboration",
      description:
        "Collaborate with our AI to create outfits and refine your personal style.",
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
        "Easily add, edit, and manage your style preferences for a more tailored experience.",
    },
    {
      icon: HelpCircle,
      title: "24/7 Support",
      description:
        "Get help anytime with our round-the-clock customer support.",
    },
  ];

  const testimonials = [
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
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 shadow-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link className="flex items-center" href="/">
            <Image
              src="/fashion-wear.png"
              alt="GlamourHall Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full shadow-lg"
            />
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 ml-2">
              GlamourHall
            </span>
          </Link>
        </div>

        {/* Navigation and Actions */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-purple-500 transition-colors">
              Home
            </Link>
            <Link
              href="/#features"
              className="hover:text-purple-500 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#about"
              className="hover:text-purple-500 transition-colors"
            >
              About
            </Link>
            <Link
              href="/#testimonials"
              className="hover:text-purple-500 transition-colors"
            >
              Testimonials
            </Link>
          </nav>

          {/* Action Button */}
          <div className="hidden sm:flex items-center space-x-2 ml-4">
            <Link href="/auth/register">
              <Button className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-xl px-8 py-3.5 group">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Text with subtle glow */}
                <span className="relative text-white/95 group-hover:text-white transition-colors duration-200">
                  Get Started
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      {/* Modern Glassmorphism Effect */}
      <SheetContent
      showCloseButton={false}
        side="right"
        className="bg-white/10 backdrop-blur-lg border border-white/20 w-[260px] sm:w-[300px] shadow-xl rounded-l-2xl transition-transform duration-300 ease-in-out"
      >
        {/* Close Button */}
        <SheetClose className="absolute top-4 right-4 p-2 text-white font-bold hover:text-yellow-300 transition-colors duration-200">
          <X className="h-6 w-6" />
          <span className="sr-only">Close menu</span>
        </SheetClose>

        <div className="p-6">
          <nav className="flex flex-col space-y-6 mt-10">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <Home className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:rotate-6" />
              Home
            </Link>

            <Link
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <Star className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
              Features
            </Link>

            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <Info className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:rotate-12" />
              About
            </Link>

            <Link
              href="/#testimonials"
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <MessageSquare className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-105" />
              Testimonials
            </Link>

            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <UserPlus className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:rotate-6" />
              Sign Up
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
        </div>
      </div>
    </header>
     
      <main className="flex-1">
        <>
          {/* Hero Section with Video Background */}
          <section className="relative w-full py-20 md:py-28 lg:py-40 xl:py-56 overflow-hidden">
            {/* Background Video */}
            <video
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

            {/* Gradient Overlay for Better Contrast */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/70 to-transparent"></div>

            {/* Content */}
            <div className="container relative z-10 mx-auto px-4 md:px-6 flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-6 text-center text-white max-w-3xl animate-fade-in">
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 leading-tight">
                  AI-Powered Fashion Advice
                </h1>

                {/* Subheading */}
                <p className="mx-auto max-w-[600px] text-lg sm:text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed font-semibold">
                  Receive personalized fashion recommendations tailored to your
                  unique style.
                </p>

                {/* Buttons */}
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
                  <Link href="/auth/login">
                    <button className="px-8 py-3.5 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl hover:brightness-110 transform hover:scale-[1.02] transition-all duration-300 ease-in-out flex items-center relative overflow-hidden group">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Icon with animation */}
                      <BrainCircuit className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />

                      {/* Text with subtle glow */}
                      <span className="relative text-white/95 group-hover:text-white transition-colors duration-200">
                        Get Fashion Advice
                      </span>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </div>
                    </button>
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
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent hover:border-blue-400 transition-all duration-300 hover:shadow-2xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                        <feature.icon className="h-10 w-10 text-blue-500 dark:text-blue-300" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
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
              <div className="grid items-center gap-12 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_550px]">
                <div className="relative lg:order-last">
                  <Image
                    src="/woman.jpg"
                    width={500}
                    height={350}
                    alt="AI Fashion Assistant"
                    className="mx-auto aspect-video overflow-hidden rounded-3xl shadow-2xl object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl transition-opacity duration-300 opacity-0 hover:opacity-100"></div>
                </div>

                <div className="flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900 dark:text-white leading-tight">
                      About{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                        GlamourHall
                      </span>
                    </h2>
                    <p className="max-w-[600px] text-gray-600 md:text-lg lg:text-base xl:text-lg dark:text-gray-300 leading-relaxed">
                      GlamourHall is your personal AI fashion assistant,
                      blending cutting-edge technology with style expertise. We
                      deliver personalized fashion advice, empowering you to
                      feel confident and look your best for any occasion.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 w-fit"
                  >
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

              <Carousel className="relative w-full max-w-3xl mx-auto">
                <CarouselContent className="flex space-x-8">
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="w-full">
                      <Card className="rounded-3xl shadow-xl bg-white dark:bg-gray-800 transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
                        <CardContent className="flex flex-col items-center justify-center p-8 relative">
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            {testimonial.rating} ★
                          </div>
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
                          <p className="text-lg font-medium text-center text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                            "{testimonial.comment}"
                          </p>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 italic">
                            - {testimonial.name}
                          </p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Custom Navigation Arrows */}
                <CarouselPrevious className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 p-3 rounded-full shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300">
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
                <CarouselNext className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 p-3 rounded-full shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300">
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
          <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-30"></div>

            <div className="container mx-auto px-6 text-center relative z-10">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight drop-shadow-lg">
                Ready to Transform Your Style?
              </h2>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl mt-6 mb-10 text-gray-100 leading-relaxed">
                Join thousands of fashion enthusiasts who have elevated their
                style with GlamourHall. Start your journey today!
              </p>
              <Button
                className="px-10 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-2xl hover:bg-gray-100 hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                onClick={() => router.push("/auth/login")}
              >
                Get Started Now
              </Button>
            </div>

            {/* Subtle Animated Shapes */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-pink-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse delay-200"></div>
          </section>
        </>
      </main>
      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
  {/* Background Accents */}
  <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse delay-200"></div>

  <div className="container mx-auto px-6 py-12 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
      {/* About Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          About GlamourHall
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          GlamourHall is your AI-powered fashion assistant, helping you
          look your best every day with personalized style advice.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Links
        </h3>
        <ul className="space-y-2">
          {["Home", "About", "Features"].map((link, index) => (
            <li key={index}>
              <Link
                href={link === "Home" ? "/" : `#${link.toLowerCase()}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-transform duration-200 hover:translate-x-1"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Legal
        </h3>
        <ul className="space-y-2">
          {["Terms of Service", "Privacy Policy"].map((link, index) => (
            <li key={index}>
              <Link
                href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-transform duration-200 hover:translate-x-1"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Fashion Challenge */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          AI Fashion Challenge
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Ready for a style challenge? Upload your outfit and let our AI
          analyze it for suggestions and improvements. See how your
          fashion choices measure up!
        </p>
      </div>

      {/* Made in India */}
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Made in 🇮🇳 India
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Proudly designed and built in India, bringing AI-powered fashion
          to the world!
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-lg">🇮🇳</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Support Local Innovation
          </span>
        </div>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="mt-12 border-t pt-8 border-gray-300 dark:border-gray-700 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} GlamourHall. All rights reserved.
      </p>
    </div>
  </div>
</footer>

    </div>
  );
}
