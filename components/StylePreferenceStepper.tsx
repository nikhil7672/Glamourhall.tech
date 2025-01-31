import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";

// Define the structure for step options
interface StepOption {
    value: string;
    label: string;
    emoji?: string;
    icon?: string;
    color?: string;
    description?: string;
  }
  
  // Define each step structure
  interface Step {
    id: keyof PreferencesState;
    question: string;
    options?: StepOption[];
    isCustomInput?: boolean;
  }
  
  // Define the preferences state structure
  interface PreferencesState {
    gender: string;
    age?: number; // Add age as optional
    style: string;
    colors: string[];
    customColor?: string;
    budget: string;
    occasions: string[];
    body_shape?: string;
    fit_preference?: string;
    fabric_preference?: string;
    fashion_icon?: string;
    seasonal_preference?: string;
    accessories?: string;
    comfort_vs_style?: string;
  }
  
  

interface StylePreferenceStepperProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: PreferencesState) => void;
  userId: string;
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
        isCustomInput: true, // This will trigger the input field
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
      question: "Which season’s fashion do you love the most?",
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
  

export function StylePreferenceStepper({
  isOpen,
  onClose,
  onSubmit,
  userId,
}: StylePreferenceStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [preferences, setPreferences] = useState<PreferencesState>({
    gender: "",
    age: undefined, // Add age as optional (undefined initially)
    style: "",
    colors: [],
    customColor: "#00000",
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
  
  const [error, setError] = useState<string>("");

  const handleNext = () => {
    const currentQuestion = steps[currentStep];
    if (!currentQuestion) return;
    
    if (currentQuestion.id === "age") {
        const ageValue = preferences.age;
      
        // Ensure age is a number and within a valid range
        if (!ageValue || isNaN(ageValue) || ageValue < 10 || ageValue > 100) {
            if (!error) { // Ensure we set the error only once
                setError("Please enter a valid age between 10 and 100.");
              }
          return;
        }
      } else if (!currentQuestion?.isCustomInput && !preferences[currentQuestion.id]) {
        setError("Please select an option before proceeding.");
        return;
      }

    setError(""); // Clear error when moving forward
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(""); // Clear error when going back
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, preferences }),
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onSubmit(preferences);
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const currentQuestion = steps[currentStep];

  return (
<Transition appear show={isOpen} as={Fragment}>
  <Dialog as="div" className="relative z-50" onClose={() => {}}>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl transform transition-all">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 rounded-full"
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-2 text-right text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Question Title */}
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion?.question}
          </Dialog.Title>

          {/* Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentQuestion?.isCustomInput ? (
                <div className="space-y-4">
                  {currentQuestion.id === "fashion_icon" ? (
                    <input
                      type="text"
                      className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Enter your fashion icon (e.g., David Beckham)"
                      value={preferences.fashion_icon || ""}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          fashion_icon: e.target.value,
                        });
                        setError("");
                      }}
                    />
                  ) : currentQuestion.id === "age" ? (
                    <input
                      type="number"
                      className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Enter your age"
                      min="10"
                      max="100"
                      value={preferences.age || ""}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          age: Number(e.target.value),
                        });
                        setError("");
                      }}
                    />
                  ) : (
                    <input
                      type="color"
                      className="w-full h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                      value={preferences.customColor}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          customColor: e.target.value,
                        });
                        setError("");
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {currentQuestion?.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPreferences({
                          ...preferences,
                          [currentQuestion.id]: option.value,
                        });
                        setError("");
                      }}
                      className={`p-4 border-2 rounded-xl w-full text-left hover:bg-purple-50 transition-all ${
                        preferences[currentQuestion.id] === option.value
                          ? "border-purple-500 bg-purple-50 shadow-purple-100 shadow-inner"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-purple-600 hover:bg-purple-50"
                }`}
            >
              Back
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all"
              >
                Complete
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all"
              >
                Next
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
</Transition>
  );
}
