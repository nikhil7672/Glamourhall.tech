import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface PaymentStatusPageProps {
  params: { status: string; txnid: string };
}

export const metadata = {
  title: 'Payment Status | Glamourhall',
  description: 'View your payment status for transactions with Glamourhall.',
};

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
  const { status, txnid } = params;
  const isSuccess = status.toLowerCase() === 'success';

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-10 max-w-md w-full text-center border border-gray-200 animate-fadeIn transition-transform transform hover:scale-105">
        
        {isSuccess ? (
          <>
            <FaCheckCircle className="h-24 w-24 text-green-500 mx-auto animate-bounce" />
            <h1 className="text-3xl font-extrabold text-gray-800 mt-4">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">
              Thank you for your payment. Your transaction has been successfully processed.
            </p>
          </>
        ) : (
          <>
            <FaTimesCircle className="h-24 w-24 text-red-500 mx-auto animate-pulse" />
            <h1 className="text-3xl font-extrabold text-gray-800 mt-4">Payment Failed!</h1>
            <p className="text-gray-600 mt-2">
              Oops! Something went wrong with your transaction. Please try again or contact support.
            </p>
          </>
        )}

        <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-md">
          <p className="text-sm text-gray-500">Transaction ID:</p>
          <p className="text-lg font-mono text-gray-800">{txnid}</p>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition shadow-lg">
            Go to Home
          </Link>
          {!isSuccess && (
            <Link href="/contact" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition shadow-lg">
              Contact Support
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
