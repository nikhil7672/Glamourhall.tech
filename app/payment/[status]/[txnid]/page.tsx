"use client"
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaSyncAlt } from 'react-icons/fa';

interface PaymentStatusPageProps {
  params: { status: string; txnid: string };
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
  const { status, txnid } = params;
  const isSuccess = status.toLowerCase() === 'success';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-md w-full text-center border border-gray-100/50 transform transition-all hover:scale-[1.02]">
        <div className="space-y-6">
          {/* Icon and Status */}
          <div className="p-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 inline-block">
            {isSuccess ? (
              <FaCheckCircle className="h-20 w-20 text-green-500 animate-bounce" />
            ) : (
              <FaTimesCircle className="h-20 w-20 text-red-500 animate-pulse" />
            )}
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuccess ? 'Payment Successful!' : 'Payment Failed!'}
            </h1>
            <p className="text-gray-600">
              {isSuccess
                ? 'Thank you for your payment. Your transaction has been successfully processed.'
                : 'Oops! Something went wrong with your transaction. Please try again or contact support.'}
            </p>
          </div>

          {/* Transaction ID */}
          <div className="mt-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">Transaction ID:</p>
            <p className="text-lg font-mono text-gray-800 font-medium">{txnid}</p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-4">
            {!isSuccess ? (
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                prefetch={true}
              >
                <span>Retry Payment</span>
                <FaSyncAlt className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/chat"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                prefetch={true}
              >
                <span>Start Chatting</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
