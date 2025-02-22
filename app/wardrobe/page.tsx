"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto pb-[7rem] md:pb-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 md:mb-6">
            Featured Wardrobe
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Discover curated fashion from our network of local influencers and
            boutique stores.
          </p>
        </motion.div>

        {/* Influencer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {influencers.map((influencer, index) => (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                {/* Image with Darker Gradient Overlay */}
                <img
                  src={influencer.image}
                  alt={influencer.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">{influencer.name}</h3>
                    <p className="text-sm">{influencer.description}</p>
                  </div>

                  {/* Location & Handle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm">{influencer.location}</span>
                    </div>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                      {influencer.handle}
                    </span>
                  </div>

                  {/* Instagram Button */}
                  <Link
                    href={influencer.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="font-semibold text-sm">Visit Store</span>
                  </Link>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white transition-all duration-300 rounded-3xl pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Floating CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Want to feature your store here?
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Apply Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
