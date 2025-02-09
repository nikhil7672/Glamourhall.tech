import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";

interface StepOption {
 value: string;
 label: string;
 emoji?: string;
}

interface Step {
 id: keyof PreferencesState;
 question: string;
 options?: StepOption[];
 isCustomInput?: boolean;
}

interface PreferencesState {
 gender: string;
 age?: number;
 height?: number;
 style: string;
//  budget: string;
 body_shape?: string;
 fit_preference?: string;
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
   id: "age",
   question: "Enter your age",
   isCustomInput: true,
 },
 {
   id: "height", 
   question: "Enter your height (cm)",
   isCustomInput: true,
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
   id: "style",
   question: "What's your preferred style?",
   options: [
     { value: "casual", label: "Casual 😎" },
     { value: "professional", label: "Professional 💼" },
     { value: "streetwear", label: "Streetwear 🧢" },
     { value: "minimalist", label: "Minimalist ⚪" },
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
//  {
//    id: "budget",
//    question: "What's your shopping budget?",
//    options: [
//      { value: "budget", label: "Budget-Friendly 💰" },
//      { value: "moderate", label: "Moderate 💰💰" },
//      { value: "luxury", label: "Luxury 💰💰💰" },
//    ],
//  },
 {
   id: "occasions",
   question: "What occasions do you dress for most?",
   options: [
     { value: "casual", label: "Casual Days 🌅" },
     { value: "work", label: "Work 💼" },
     { value: "evening", label: "Evening Out 🌙" },
     { value: "special", label: "Special Events ✨" },
   ],
 },
];

export function StylePreferenceStepper({
 isOpen,
 onClose,
 onSubmit,
 userId,
}: StylePreferenceStepperProps) {
 const [currentStep, setCurrentStep] = useState(0);
 const [preferences, setPreferences] = useState<PreferencesState>({
   gender: "",
   age: undefined,
   height: undefined,
   style: "",
  //  budget: "",
   body_shape: "",
   fit_preference: "",
   occasions: [],
 });
 const [error, setError] = useState("");

 const handleNext = () => {
   const currentQuestion = steps[currentStep];
   if (!currentQuestion) return;
   
   if (currentQuestion.id === "age") {
     const ageValue = preferences.age;
     if (!ageValue || isNaN(ageValue) || ageValue < 10 || ageValue > 100) {
       setError("Please enter a valid age between 10 and 100.");
       return;
     }
   } else if (currentQuestion.id === "height") {
     const heightValue = preferences.height;
     if (!heightValue || isNaN(heightValue) || heightValue < 100 || heightValue > 250) {
       setError("Please enter a valid height between 100 and 250 cm.");
       return;
     }
   } else if (!currentQuestion?.isCustomInput && !preferences[currentQuestion.id]) {
     setError("Please select an option before proceeding.");
     return;
   }

   setError("");
   setCurrentStep((prev) => prev + 1);
 };

 const handleBack = () => {
   setError("");
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/70">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl dark:shadow-black">
          <div className="mb-8">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600 rounded-full"
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestion?.question}
          </Dialog.Title>

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
                  <input
                    type="number"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-600 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={`Enter your ${currentQuestion.id}`}
                    value={preferences[currentQuestion.id] || ""}
                    onChange={(e) => {
                      setPreferences({
                        ...preferences,
                        [currentQuestion.id]: Number(e.target.value),
                      });
                      setError("");
                    }}
                  />
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
                      className={`p-4 border-2 rounded-xl w-full text-left transition-all
                        ${preferences[currentQuestion.id] === option.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900 shadow-purple-100 dark:shadow-purple-800 shadow-inner"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-800"
                        } text-gray-900 dark:text-white`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-4 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${currentStep === 0
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800"
                }`}
            >
              Back
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-600 transition-all"
              >
                Complete
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-600 transition-all"
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