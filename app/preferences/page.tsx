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
 height?: number;
 style: string;
 body_shape: string;
 fit_preference: string;
 occasions: string[];
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
 {
   id: "occasions",
   question: "What occasions do you dress for most?",
   options: [
     { value: "casual", label: "Casual Days 🌅" },
     { value: "work", label: "Work 💼" },
     { value: "evening", label: "Evening Out 🌙" },
     { value: "special", label: "Special Events ✨" },
   ],
 }
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
           height: undefined,
           style: "",
           body_shape: "",
           fit_preference: "",
           occasions: [],
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

 const handleBackClick = (e) => {
   e.preventDefault();
   router.back();
 };

 return (
   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
     <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Preferences</h1>
         <Link 
        href="#" 
        onClick={handleBackClick} 
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
           </svg>
           Back
         </Link>
       </div>

       <div className="mb-8">
         <div className="relative pt-1">
           <div className="flex mb-2 items-center justify-between">
             <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 dark:text-purple-300 bg-purple-200 dark:bg-purple-900">
               Step {currentStep + 1} of {steps.length}
             </span>
           </div>
           <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 dark:bg-purple-900">
             <div style={{width: `${((currentStep + 1) / steps.length) * 100}%`}} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 dark:bg-purple-600"/>
           </div>
         </div>
       </div>

       <div className="mb-8">
         <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
           {currentStepData.question}
         </h2>

         {currentStepData.isCustomInput ? (
           <input
             type={currentStepData.id === "age" || currentStepData.id === "height" ? "number" : "text"}
             value={preferences[currentStepData.id] || ""}
             onChange={(e) => handleInputChange(currentStepData.id === "age" || currentStepData.id === "height" ? 
               Number(e.target.value) : e.target.value)}
             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
             min={currentStepData.id === "age" ? "10" : "100"}
             max={currentStepData.id === "age" ? "100" : "250"}
           />
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {currentStepData.options?.map((option) => (
               <button
                 key={option.value}
                 onClick={() => handleInputChange(option.value)}
                 className={`p-4 rounded-lg border-2 text-left transition-colors ${
                   preferences[currentStepData.id] === option.value
                     ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                     : "border-gray-200 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-500"
                 }`}
               >
                 <span className="text-gray-900 dark:text-gray-100">
                   {option.label}
                 </span>
               </button>
             ))}
           </div>
         )}
       </div>

       <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
         <button
           onClick={handlePrevious}
           disabled={currentStep === 0}
           className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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