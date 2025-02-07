"use client"
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

// Types
interface Plan {
  name: string;
  price: string;
  features: string[];
  isUpcoming?: boolean;
}

// Constants
const PLANS: Plan[] = [
  {
    name: "Basic",
    price: "$0/month",
    features: [
      "Limited outfit photo analysis",
      "Basic style suggestions",
      "Basic style feedback",
    ],
  },
  {
    name: "Pro",
    price: "$2.99/month",
    features: [
      "Unlimited outfit photo analysis",
      "Advanced style suggestions",
      "Personalized fashion assistant",
      "Fully customizable style profile",
      "24/7 priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Coming Soon",
    features: [
      "AI-powered analysis",
      "Personal stylist access",
      "VIP features & events",
      "Enterprise controls",
      "Dedicated support",
    ],
    isUpcoming: true,
  },
];

const PricingPage = () => {
  const router = useRouter();
  const [formHtml, setFormHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle form submission when formHtml is updated
  useEffect(() => {
    if (formHtml && formContainerRef.current) {
      const formData = formContainerRef.current.querySelector("#payment_post") as HTMLFormElement;
      if (formData) {
        try {
          // Validate form before submission
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

  // Function to handle the payment API call
  const handlePlanSelect = async (plan: Plan) => {
    if (plan.isUpcoming) {
      setError("This plan is not available yet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paymentData = {
        txnid: `TXN${Date.now()}${Math.random().toString(36).slice(2)}`,
        amount: "100.00",
        email: "user@example.com", // Replace with actual user email
        product: plan.name,
        firstname: "John", // Replace with actual user name
        mobile: "1234567890", // Replace with actual user mobile
      };

      const response = await axios.post("/api/payment", paymentData);

      if (response.data?.data) {
        console.log('Payment form received:', response.data);
        setFormHtml(response.data.data);
      } else {
        throw new Error(response.data?.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment request failed:", error);
      setError(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Payment Form Container */}
      <div
        ref={formContainerRef}
        dangerouslySetInnerHTML={{ __html: formHtml }}
        style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}
      />

      {/* Main Content */}
      <section className="w-full py-16 md:py-24 lg:py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 text-center">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 bg-transparent text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 mt-4"
          >
            &larr; Back
          </button>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-12 sm:text-5xl mt-4">
            Choose Your Style Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-10 lg:grid-cols-3 xl:gap-12">
            {PLANS.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl shadow-lg border border-gray-300 dark:border-gray-700 transition-transform duration-500 hover:scale-105 p-8 ${
                  index === 1
                    ? "bg-gradient-to-t from-purple-500 via-purple-600 to-purple-700 text-white"
                    : index === 2
                    ? "bg-white/10 backdrop-blur-lg text-gray-400"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {/* Plan Labels */}
                {index === 1 && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow-lg">
                    Most Popular
                  </span>
                )}
                {index === 2 && (
                  <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-semibold py-1 px-3 rounded-full">
                    Coming Soon
                  </span>
                )}

                {/* Plan Details */}
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <p className="text-3xl font-extrabold mb-6">{plan.price}</p>

                {/* Features List */}
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <svg
                        className={`h-5 w-5 ${
                          index === 2 ? "text-gray-500" : "text-green-500"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="mt-8">
                  <button
                    disabled={index === 2 || isLoading}
                    className={`w-full py-3 px-6 rounded-full text-lg font-semibold transition-all duration-300 
                      ${isLoading ? 'opacity-50 cursor-wait' : ''} 
                      ${
                        index === 1
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          : index === 2
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-900"
                      }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {isLoading ? 'Processing...' : 
                     index === 2 ? "Notify Me" :
                     index === 1 ? "Recommended" : 
                     "Choose Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingPage;