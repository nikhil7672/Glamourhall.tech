"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast'

interface Plan {
  title: string;
  name: string;
  price: string;
  features: string[];
  isUpcoming?: boolean;
  monthlyPrice: number;
  annualPrice: number;
}

const PLANS: Plan[] = [
  {
    title: "Basic",
    name: "basic",
    price: "₹0/month",
    features: [
      "Limited outfit photo analysis",
      "Limited AI style suggestions",
      "Personalized fashion assistant",
      "Discover curated fashion insights",
      "Customizable style profile",
      "AI-powered style matches",
    ],
    monthlyPrice: 0,
    annualPrice: 0,
  },
  {
    title: "Premium",
    name: "premium",
    price: "₹49/month | ₹499/year",
    features: [
      "Unlimited outfit photo analysis",
      "Unlimited AI style suggestion",
      "Personalized fashion assistant",
      "Discover curated fashion insights",
      "Customizable style profile",
      "AI-powered style matches",
    ],
    monthlyPrice: 49,
    annualPrice: 499,
  },
  {
    title: "Pro",
    name: "pro",
    price: "Coming Soon",
    features: [
      "AI-powered deep fashion analysis",
      "Personal stylist access",
      "VIP features & fashion events",
      "Dedicated premium support",
      "Elite AI-powered style matches",
      "AI voice fashion assistant"
    ],
    isUpcoming: true,
    monthlyPrice: 99,
    annualPrice: 999,
  },
];


const PricingPage = () => {
  const router = useRouter();
  const [formHtml, setFormHtml] = useState('');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (formHtml && formContainerRef.current) {
      const formData = formContainerRef.current.querySelector("#payment_post") as HTMLFormElement;
      if (formData) {
        try {
          if (!formData.action || !formData.method) {
            throw new Error('Invalid payment form');
          }
          setTimeout(() => {
            formData.submit();
          }, 0);
        } catch (error) {
          console.error('Form submission error:', error);
          setError('Payment form submission failed');
        }
      }
    }
  }, [formHtml]);

  const handlePlanSelect = async (plan: Plan) => {


    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
      return;
    }

    if (plan.name === "basic") {
      router.push("/chat");
      return;
    }

    if (user.plan === 'premium') {
      toast.error('You\'re already on the premium plan!', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
   
    if (plan.isUpcoming) {
      setError("This plan is not available yet");
      return;
    }

    try {
      setLoadingPlan(plan.name);
      setError(null);
      const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
      
      const paymentData = {
        txnid: `TXN${Date.now()}${Math.random().toString(36).slice(2)}`,
        amount: price.toString(),
        email: user.email,
        product: plan.name,
        firstname: user.name || "Customer",
        mobile: user.mobile || "0000000000",
        userId: user.id,
        billingCycle,
      };

      const response = await axios.post("/api/payment", paymentData);

      if (response.data?.data) {
        setFormHtml(response.data.data);
      } else {
        throw new Error(response.data?.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment request failed:", error);
      setError(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-y-auto overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-purple-200/20 to-transparent dark:from-purple-900/20 blur-3xl transform rotate-12" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-blue-200/20 to-transparent dark:from-blue-900/20 blur-3xl transform -rotate-12" />
      </div>

      {/* Error Toast */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50"
        >
          {error}
        </motion.div>
      )}

      {/* Hidden Payment Form */}
      <div
        ref={formContainerRef}
        dangerouslySetInnerHTML={{ __html: formHtml }}
        className="hidden"
      />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            Select the perfect plan for your style journey
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-md">
            <div className="flex space-x-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Annual
                <span className="ml-1 text-xs font-normal bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden group ${
                index === 1 ? "transform scale-105" : ""
              }`}
            >
              <div className={`h-full p-8 backdrop-blur-lg ${
                index === 1
                  ? "bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50"
                  : index === 2
                  ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-400 dark:from-amber-600 dark:via-amber-700 dark:to-amber-600 border-amber-400/50 dark:border-amber-500/30 shadow-[0_0_20px_5px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_10px_rgba(245,158,11,0.4)] transition-shadow duration-300 relative overflow-hidden"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              } relative z-10`}>
                {/* Glass effect overlay */}
                {(index === 1 || index === 2) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-900/5 dark:to-gray-900/10 pointer-events-none z-0" />
                )}

                {/* Glow effect for premium */}
                {index === 1 && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-300" />
                )}

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Plan Badge */}
                  {index === 1 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/30">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-100/20 dark:bg-gray-800/30 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-gray-200/30 dark:border-gray-700/30">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Plan Details */}
                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-4 ${
                      index === 1 || index === 2
                        ? "text-white" 
                  
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {plan.title}
                    </h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-5xl font-extrabold ${
                        index === 1 || index === 2
                          ? "text-white" 
                          : "text-gray-900 dark:text-white"
                      }`}>
                        ₹{billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className={`text-lg ${
                        index === 1 
                          ? "text-purple-200" :
                          index === 2 
                          ? "text-amber-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        /{billingCycle}
                      </span>
                    </div>
                    {/* Show yearly savings only for non-upcoming annual plans */}
                    {billingCycle === "annual" &&  (
                      <p className={`mt-2 text-sm ${
                        index === 1 
                          ? "text-green-300" 
                          : "text-green-500 dark:text-green-400"
                      }`}>
                        Save ₹{(plan.monthlyPrice * 12) - plan.annualPrice} yearly
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <svg
                          className={`h-5 w-5 ${
                            index === 1 
                              ? "text-blue-200" 
                              : index === 2
                              ? "text-amber-600"
                              : "text-blue-500 dark:text-purple-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className={`text-sm ${
                          index === 1 
                            ? "text-purple-100" 
                            : index === 2
                            ? "text-amber-100"
                            : "text-gray-600 dark:text-gray-300"
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loadingPlan !== null || plan.isUpcoming}
                    className={`w-full py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      index === 1
                        ? "bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white hover:text-blue-700 border border-blue-200/50"
                        : index === 2
                        ? "bg-gray-100/30 dark:bg-gray-700/30 backdrop-blur-sm text-gray-400 cursor-not-allowed border border-gray-200/30 dark:border-gray-600/30"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                    } ${loadingPlan === plan.name ? "opacity-75 cursor-wait" : ""}`}
                  >
                    {loadingPlan === plan.name 
                      ? "Processing..." 
                      : plan.isUpcoming 
                      ? "Coming Soon" 
                      : index === 1 
                      ? "Upgrade Now" 
                      : "Get Started"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default PricingPage;