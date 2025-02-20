"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function ApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: "",
    instagramHandle: "",
    location: "",
    description: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.storeName || !formData.instagramHandle || !formData.email) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      // Show success toast
      toast.success("Application submitted successfully!", {
        duration: 3000,
        position: "top-center",
      });

      // Reset form
      setFormData({
        storeName: "",
        instagramHandle: "",
        location: "",
        description: "",
        email: "",
      });

      // Redirect to chat page after 3 seconds
      setTimeout(() => router.push("/chat"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Apply to Feature Your Store
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join our network of featured local stores and reach more customers
          </p>
        </motion.div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="storeName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Store Name *
            </label>
            <input
              type="text"
              id="storeName"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 transition-colors"
              required
            />
          </div>
          <div>
            <label
              htmlFor="instagramHandle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Instagram Handle *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 text-gray-500 dark:text-gray-300">
                @
              </span>
              <input
                type="text"
                id="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="flex-1 px-4 py-3 rounded-r-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 transition-colors"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Store Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 transition-colors"
              rows={4}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Contact Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 transition-colors"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-md hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
