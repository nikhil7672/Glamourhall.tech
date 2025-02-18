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
 ethnicity?: string;
 body_shape?: string;
 preferred_store?: string;
 skin_tone?: string;
 price_range?: string;
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
   ethnicity: undefined,
   skin_tone: "",
   body_shape: "",
   price_range: "",
   preferred_store: "",
 });
 const [error, setError] = useState("");

 const handleNext = () => {
   const currentQuestion = steps[currentStep];
   if (!currentQuestion) return;
   
   if (currentQuestion.id === "preferred_store") {
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