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
  style: string;
  colors: string[];
  customColor?: string;
  budget: string;
  occasions: string[];
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
    style: "",
    colors: [],
    customColor: "",
    budget: "",
    occasions: [],
  });
  const [error, setError] = useState<string>("");

  const handleNext = () => {
    const currentQuestion = steps[currentStep];

    
    if (!currentQuestion?.isCustomInput && !preferences[currentQuestion.id]) {
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
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl">
            <div className="mb-6">
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion?.question}
            </Dialog.Title>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {currentQuestion?.isCustomInput ? (
                  <div>
                    <input
                      type="color"
                      className="w-full h-10 border rounded-md"
                      value={preferences.customColor}
                      onChange={(e) => {
                        setPreferences({
                          ...preferences,
                          customColor: e.target.value,
                        });
                        setError(""); // Clear error when color is selected
                      }}
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {currentQuestion?.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setPreferences({
                            ...preferences,
                            [currentQuestion.id]: option.value,
                          });
                          setError(""); // Clear error on selection
                          // Remove handleNext() from here
                        }}
                        className={`p-3 border rounded-lg w-full text-left ${
                          preferences[currentQuestion.id] === option.value
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-4 flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-sm font-medium text-purple-900"
              >
                Back
              </button>
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Complete
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Next
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
