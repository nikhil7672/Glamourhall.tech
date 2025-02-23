"use client";
import { motion } from "framer-motion";
import { FaLeaf, FaTint, FaRegGem, FaFire } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

const challenges = [
  {
    title: "Acne Assassin",
    duration: 7,
    icon: <FaFire className="w-8 h-8" />,
    color: "bg-gradient-to-br from-red-500 to-orange-400",
    progress: 0,
    description: "7-day intensive pimple clearing program"
  },
  {
    title: "Glow Guardian",
    duration: 14,
    icon: <FaRegGem className="w-8 h-8" />,
    color: "bg-gradient-to-br from-yellow-400 to-amber-500",
    progress: 0,
    description: "Two-week radiance boosting challenge"
  },
  {
    title: "Hydration Hero",
    duration: 21,
    icon: <FaTint className="w-8 h-8" />,
    color: "bg-gradient-to-br from-blue-400 to-purple-500",
    progress: 0,
    description: "3-week deep moisturizing quest"
  },
  {
    title: "Even Tone Explorer",
    duration: 30,
    icon: <FaLeaf className="w-8 h-8" />,
    color: "bg-gradient-to-br from-green-400 to-emerald-500",
    progress: 0,
    description: "Month-long pigmentation correction journey"
  }
];

export default function SelfcareChallenge() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
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
      <div className="max-w-7xl mx-auto pb-[5rem] md:pb-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-16"
        >
          <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
            Challenges
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Level up your routine with our gamified challenges. Earn rewards, track progress, 
            and transform yourself!
          </p>
        </motion.div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group p-2 md:p-0">
              {/* 3D Card Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/30 rounded-3xl shadow-2xl transform group-hover:-rotate-6 transition-transform duration-300" />
              
              <div className={`relative p-6 md:p-8 rounded-3xl ${challenge.color} text-white overflow-hidden`}>
                {/* Floating Emoji */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute -top-4 -right-4 opacity-20 text-8xl"
                >
                  {challenge.icon}
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-6">{challenge.icon}</div>
                  <h3 className="text-lg md:text-2xl font-bold mb-2">{challenge.title}</h3>
                  <p className="text-xs md:text-sm opacity-90 mb-4">{challenge.description}</p>
                  
                  {/* Progress Circle */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-white/20"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${challenge.progress * 251} 251`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base md:text-xl font-bold">
                      {challenge.duration}
                    </span>
                  </div>

                  {/* Start Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 md:py-3 text-xs md:text-base bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-all"
                    onClick={() => {
                      setSelectedChallenge(index);
                      setIsModalOpen(true);
                    }}
                  >
                    Start Challenge
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 md:mt-24 p-4 md:p-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl md:rounded-3xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Choose Your Challenge", text: "Pick from our curated skin goals" },
              { icon: "📅", title: "Daily Tracking", text: "Complete daily skincare missions" },
              { icon: "🏆", title: "Earn Rewards", text: "Unlock achievements & discounts" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Challenge Modal */}
      {isModalOpen && selectedChallenge !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">
              Start {challenges[selectedChallenge].title}?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This {challenges[selectedChallenge].duration}-day challenge will help you achieve:
            </p>
            <ul className="list-disc pl-6 mb-8">
              <li>Daily personalized routines</li>
              <li>Progress tracking</li>
              <li>Expert tips & guidance</li>
            </ul>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-6 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  router.push(`/selfcare-challenge/${challenges[selectedChallenge].title}`);
                  setIsModalOpen(false);
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
              >
                Let's Go!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 