"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Option {
  value: string;
  label: string;
  emoji?: string;
  imageUrl?: string;
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
  ethnicity?: string;
  body_shape?: string;
  preferred_store?: string;
  skin_tone?: string;
  price_range?: string;
 }
 

interface User {
  id: string;
}

const steps: Step[] = [
  {
    id: "gender",
    question: "Choose what best describes your gender",
    options: [
      { value: "woman", label: "Woman ♀️" },
      { value: "neutral", label: "Neutral ⚪️" },
      { value: "man", label: "Man ♂️" },
    ],
  },
 {
  id: "age",
  question: "Choose the group that best fits your style",
  options: [
    { value: "teen", label: "Teen 🧒" },
    { value: "young_adult", label: "Young adult 👩🎓" },
    { value: "adult", label: "Adult 👨💼" },
    { value: "senior", label: "Senior 👵" },
  ],
},
 {
   id: "ethnicity",
   question: "Choose the group that best fits your style",
   options: [
     { value: "white", label: "White ⚪️" },
     { value: "black", label: "Black ⬛️" },
     { value: "east_asian", label: "East Asian 🀄️" },
     { value: "south_asian", label: "South Asian 🌸" },
     { value: "latino", label: "Latino 🌮" },
   ],
},
 {
   id: "body_shape",
   question: "Choose the body type that best describes you for a better fit",
   options: [
     { value: "petite", label: "Petite 🧘♀️" },
     { value: "slim", label: "Slim 🍃" },
     { value: "average", label: "Average 👌" },
     { value: "curvy", label: "Curvy 🌺" },
     { value: "plus_size", label: "Plus size 🌟" },
     { value: "tall", label: "Tall 🌳" },
   ],
 },
 {
   id: "skin_tone",
   question: "Choose the shade closest to your skin tone",
   options: [
     { value: "fair", label: "Fair ⚪️" },
     { value: "light", label: "Light 🟡" },
     { value: "medium", label: "Medium 🟠" },
     { value: "tan", label: "Tan 🟤" },
     { value: "deep", label: "Deep ⚫️" },
   ],
 },
{
  id: "price_range",
  question: "Choose a price range for brands we'll show",
  options: [
    { value: "no_limit", label: "No limit 💸" },
    { value: "affordable", label: "$ Affordable 🤑" },
    { value: "mid_range", label: "$$ Mid-Range 💰" },
    { value: "luxury", label: "$$$ Luxury 🤑" },
  ],
},
{
  id: "preferred_store",
  question: "Choose your favorite stores",
  options: [
    { 
      value: "amazon", 
      label: "Amazon",
      emoji: "🅰️",
      imageUrl: "/ama.svg" 
    },
    { 
      value: "flipkart", 
      label: "Flipkart",
      emoji: "🅱️",
      imageUrl: "/flipkart.svg" 
    },
    { 
      value: "ajio", 
      label: "Ajio",
      emoji: "🅾️",
      imageUrl: "/ajio.svg" 
    },
    { 
      value: "puma", 
      label: "Puma",
      emoji: "🐆",
      imageUrl: "/puma.svg" 
    },
  ],
},
];

export default function PreferencesPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<PreferencesState>({
    gender: "",
   age: undefined,
   ethnicity: undefined,
   skin_tone: "",
   body_shape: "",
   price_range: "",
   preferred_store: "",
  });
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
          setPreferences(data.preferences || {
            gender: "",
   age: undefined,
   ethnicity: undefined,
   skin_tone: "",
   body_shape: "",
   price_range: "",
   preferred_store: "",
          });
        } catch (error) {
          console.error("Error fetching preferences:", error);
          setPreferences({
            gender: "",
            age: undefined,
            ethnicity: undefined,
            skin_tone: "",
            body_shape: "",
            price_range: "",
            preferred_store: "",
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
      toast.success("Preferences updated successfully!");
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!preferences || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            Preferences
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              onClick={handleBackClick}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
        </div>

        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 dark:text-purple-300 bg-purple-200 dark:bg-purple-900">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 dark:bg-purple-900">
              <div
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep === index
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 scale-125"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div key={currentStep} className="fade-in">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {currentStepData.question}
          </h2>

          {currentStepData.isCustomInput ? (
            <input
              type={
                currentStepData.id === "age" 
                  ? "number"
                  : "text"
              }
              value={preferences[currentStepData.id] || ""}
              onChange={(e) =>
                handleInputChange(
                  currentStepData.id === "age"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              min={currentStepData.id === "age" ? "10" : "100"}
              max={currentStepData.id === "age" ? "100" : "250"}
            />
          ) : (
            <div className={`grid ${currentStepData.id === 'preferred_store' ? 'grid-cols-2 md:grid-cols-4 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
              {currentStepData.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center group
                    ${
                      preferences[currentStepData.id] === option.value
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md hover:scale-[1.02]"
                    }`}
                >
                  {option.imageUrl ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={option.imageUrl}
                        alt={option.label}
                        className="h-20 w-20 object-scale-down mb-2 transition-transform duration-300 group-hover:scale-110"
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {option.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-center">{option.label}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
        
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Preferences"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 focus:outline-none transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
        <Toaster />
  
        <style jsx>{`
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }