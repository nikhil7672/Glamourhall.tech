import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";

interface StepOption {
 value: string;
 label: string;
 emoji?: string;
 imageUrl?: string;
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
 body_shape?: string;
 fit_preference?: string;
 accessory_style?: string;
 preferred_store?: string;
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
   id: "fit_preference",
   question: "How do you like your clothes to fit?",
   options: [
     { value: "slim", label: "Slim Fit 🏃" },
     { value: "regular", label: "Regular Fit 👕" },
     { value: "oversized", label: "Oversized 😎" },
   ],
 },
 {
  id: "accessory_style",
  question: "How do you accessorize?",
  options: [
    { value: "minimal", label: "Minimal ✨ (Simple jewelry)" },
    { value: "statement", label: "Statement 💥 (Bold pieces)" },
    { value: "functional", label: "Functional 🕶️ (Hats, belts)" },
    { value: "none", label: "No Accessories 🙅" },
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
   body_shape: "",
   fit_preference: "",
   accessory_style: "",
   preferred_store: "",
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
   } else if (currentQuestion.id === "preferred_store") {
     if (!preferences.preferred_store) {
       setError("Please select a store");
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
   const currentQuestion = steps[currentStep];
   
   // Check if current step is store selection and validate
   if (currentQuestion.id === "preferred_store") {
     if (!preferences.preferred_store) {
       setError("Please select a store");
       return;
     }
   }

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
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
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
                <div className={`grid ${currentQuestion.id === 'preferred_store' ? 'grid-cols-2' : 'grid-cols-1'} gap-3 gap-y-4`}>
                  {currentQuestion?.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (currentQuestion.id === "preferred_store") {
                          setPreferences({
                            ...preferences,
                            [currentQuestion.id]: option.value,
                          });
                        } else {
                          setPreferences({
                            ...preferences,
                            [currentQuestion.id]: option.value,
                          });
                        }
                        setError("");
                      }}
                      className={`p-3 rounded-xl w-full transition-all duration-300 flex flex-col items-center justify-center gap-2
                        ${
                          (currentQuestion.id === "preferred_store" 
                            ? preferences.preferred_store === option.value
                            : preferences[currentQuestion.id] === option.value)
                            ? "border-transparent bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-transparent hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20"
                        } text-gray-900 dark:text-white`}
                    >
                      {option.imageUrl ? (
                        <>
                          <img 
                            src={option.imageUrl} 
                            alt={option.label} 
                            className="h-16 w-16 object-contain"
                          />
                          <span className="text-sm text-center">{option.label}</span>
                        </>
                      ) : (
                        option.label
                      )}
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
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
                ${
                  currentStep === 0
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600"
                }`}
            >
              Back
            </button>
            
            <button
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={currentStep === steps.length - 1 && !preferences.preferred_store}
              className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-600 transition-all duration-300 shadow-lg ${
                currentStep === steps.length - 1 && !preferences.preferred_store 
                  ? "opacity-50 cursor-not-allowed" 
                  : ""
              }`}
            >
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
</Transition>

 );
}