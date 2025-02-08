'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VerifyPageProps {
  params: { txnid: string };
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const { txnid } = params;
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify?${txnid}`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        // The API redirects, but if not, we can handle it here too
        const data = await response.json();
        router.push(`/payment/${data.status}/${data.txnid}`);
      } catch (error) {
        console.error('Verification Error:', error);
        router.push(`/payment/failure/${txnid}`);
      }
    };

    verifyPayment();
  }, [txnid, router]);

  return (
    <main className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold mb-4">Verifying Payment...</h1>
      <p className="text-gray-700">Please wait while we verify your transaction.</p>
    </main>
  );
}
