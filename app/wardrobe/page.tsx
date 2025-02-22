"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const influencers = [
  {
    id: 1,
    name: "Urban Chic Collective",
    handle: "@urbanchic.style",
    description: "Curated streetwear & contemporary fashion",
    location: "New Delhi",
    image: "/store1.jpg",
    instagramLink: "https://instagram.com/urbanchic.style",
  },
  {
    id: 2,
    name: "Ethnic Elegance",
    handle: "@ethnicelegance.in",
    description: "Traditional wear with modern twists",
    location: "Mumbai",
    image: "/store2.jpg",
    instagramLink: "https://instagram.com/ethnicelegance.in",
  },
  {
    id: 3,
    name: "Denim District",
    handle: "@denimdistrict.india",
    description: "Specialty denim wear & custom fittings",
    location: "Bangalore",
    image: "/store3.jpg",
    instagramLink: "https://instagram.com/denimdistrict.india",
  },
  // Add more influencers as needed
];

export default function WardrobePage() {
  const { status } = useSession();
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
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
          className="text-center mb-8 md:mb-20"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 md:mb-6">
            Featured Wardrobe
          </h1>
          <p className="text-sm md:text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Discover curated fashion from our network of local influencers and boutique stores.
          </p>
        </motion.div>

        {/* Influencer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
          {influencers.map((influencer, index) => (
            <motion.div
              key={influencer.id}
              className="relative group"
            >
              <div className="relative h-64 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
                <img
                  src={influencer.image}
                  alt={influencer.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <div className="mb-3 md:mb-4">
                    <h3 className="text-xl md:text-2xl font-bold">{influencer.name}</h3>
                    <p className="text-xs md:text-sm">{influencer.description}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs md:text-sm">{influencer.location}</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 md:px-3 rounded-full">
                      {influencer.handle}
                    </span>
                  </div>

                  <Link
                    href={influencer.instagramLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"
                  >
                    <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-semibold">Visit Store</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating CTA */}
        <motion.div
          className="text-center mt-12 md:mt-20"
        >
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-4 md:mb-6">
            Want to feature your store here?
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl md:rounded-2xl text-white"
          >
            Apply Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
