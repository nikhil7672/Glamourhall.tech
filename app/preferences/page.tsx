"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast'

interface Option {
  value: string;
  label: string;
}

interface Step {
  id: keyof PreferencesState;
  question: string;
  options?: Option[];
  isCustomInput?: boolean;
}

interface PreferencesState {
  gender: string;
  age?: number;
  style: string;
  colors: string[];
  customColor: string;
  budget: string;
  occasions: string[];
  body_shape: string;
  fit_preference: string;
  fabric_preference: string;
  fashion_icon: string;
  seasonal_preference: string;
  accessories: string;
  comfort_vs_style: string;
}

interface User {
  id: string;
}

const steps: Step[] = [
  {
    id: "gender",
    question: "Select your gender",
    options: [
      { value: "male", label: "Male ♂️" },
      { value: "female", label: "Female ♀️" },
      { value: "nonbinary", label: "Non-Binary ⚧️" },
      { value: "prefer_not_say", label: "Prefer not to say 🙊" },
    ],
  },
  {
    id: "age",
    question: "Enter your age",
    isCustomInput: true,
  },
  {
    id: "style",
    question: "What's your preferred style?",
    options: [
      { value: "casual", label: "Casual 😎" },
      { value: "professional", label: "Professional 💼" },
      { value: "bohemian", label: "Boho 🌸" },
      { value: "streetwear", label: "Streetwear 🧢" },
      { value: "minimalist", label: "Minimalist ⚪" },
      { value: "vintage", label: "Vintage 🎭" },
    ],
  },
  {
    id: "colors",
    question: "Pick your favorite colors",
    isCustomInput: true,
  },
  {
    id: "budget",
    question: "What's your shopping budget?",
    options: [
      { value: "budget", label: "Budget-Friendly 💰" },
      { value: "moderate", label: "Moderate 💰💰" },
      { value: "luxury", label: "Luxury 💰💰💰" },
    ],
  },
  {
    id: "occasions",
    question: "What occasions do you dress for?",
    options: [
      { value: "casual", label: "Casual Days 🌅" },
      { value: "work", label: "Work 💼" },
      { value: "evening", label: "Evening Out 🌙" },
      { value: "special", label: "Special Events ✨" },
      { value: "workout", label: "Workout 💪" },
    ],
  },
  {
    id: "body_shape",
    question: "Which body shape best describes you?",
    options: [
      { value: "rectangle", label: "Rectangle ▭" },
      { value: "hourglass", label: "Hourglass ⏳" },
      { value: "pear", label: "Pear 🍐" },
      { value: "apple", label: "Apple 🍎" },
      { value: "triangle", label: "Triangle 🔺" },
    ],
  },
  {
    id: "fit_preference",
    question: "How do you like your clothes to fit?",
    options: [
      { value: "slim", label: "Slim Fit 🏃" },
      { value: "regular", label: "Regular Fit 👕" },
      { value: "oversized", label: "Oversized 😎" },
    ],
  },
  {
    id: "fabric_preference",
    question: "Do you have any fabric preferences?",
    options: [
      { value: "cotton", label: "Cotton 🌿" },
      { value: "wool", label: "Wool 🧶" },
      { value: "silk", label: "Silk ✨" },
      { value: "linen", label: "Linen 🌾" },
      { value: "no_preference", label: "No Preference 🤷" },
    ],
  },
  {
    id: "fashion_icon",
    question: "Do you have a fashion inspiration or celebrity style icon?",
    isCustomInput: true,
  },
  {
    id: "seasonal_preference",
    question: "Which season's fashion do you love the most?",
    options: [
      { value: "spring", label: "Spring 🌸" },
      { value: "summer", label: "Summer ☀️" },
      { value: "autumn", label: "Autumn 🍂" },
      { value: "winter", label: "Winter ❄️" },
    ],
  },
  {
    id: "accessories",
    question: "How do you feel about accessories?",
    options: [
      { value: "minimal", label: "Minimalist ⌚" },
      { value: "statement", label: "Statement Pieces 💎" },
      { value: "essential", label: "Only Essentials 👜" },
    ],
  },
  {
    id: "comfort_vs_style",
    question: "What matters more to you?",
    options: [
      { value: "comfort", label: "Comfort First ☁️" },
      { value: "style", label: "Style Over Everything 🔥" },
      { value: "balance", label: "Balanced Approach ⚖️" },
    ],
  },
];

export default function PreferencesPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchPreferences = async () => {
        try {
          const response = await fetch(`/api/preferences?userId=${user.id}`);
          if (!response.ok) throw new Error("Failed to fetch preferences");
          const data = await response.json();
          setPreferences(data.preferences);
        } catch (error) {
          console.error("Error fetching preferences:", error);
          setPreferences({
            gender: "",
            age: undefined,
            style: "",
            colors: [],
            customColor: "",
            budget: "",
            occasions: [],
            body_shape: "",
            fit_preference: "",
            fabric_preference: "",
            fashion_icon: "",
            seasonal_preference: "",
            accessories: "",
            comfort_vs_style: "",
          });
        }
      };

      fetchPreferences();
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (value: string | number | string[]) => {
    if (!preferences) return;
    
    const currentStepData = steps[currentStep];
    setPreferences({
      ...preferences,
      [currentStepData.id]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, preferences }),
      });
  
      if (!response.ok) throw new Error("Failed to update preferences");
  
      // Show success toast
      toast.success("Preferences updated successfully!");
  
      // Redirect using router
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      // Show error toast if request fails
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!preferences || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  const handleBackClick = (e) => {
    e.preventDefault(); // Prevent the default link behavior
    router.back(); // Navigate back to the previous page
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <Link
      href="#"
      onClick={handleBackClick}
      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
    >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
              <div
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{currentStepData.question}</h2>

          {currentStepData.isCustomInput ? (
            currentStepData.id === "age" ? (
              <input
                type="number"
                value={preferences[currentStepData.id] || ""}
                onChange={(e) => handleInputChange(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
                max="120"
              />
            ) : currentStepData.id === 'colors' ? (
                <input
                type="color"
                className="w-full h-10 border rounded-md"
                value={preferences.customColor}
                onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      customColor: e.target.value,
                    });
                  }}
              />
            ) : (
              <input
                type="text"
                value={preferences[currentStepData.id] || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStepData.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange(option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    preferences[currentStepData.id] === option.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Preferences"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}