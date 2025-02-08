import { Metadata } from 'next';
import Link from 'next/link';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Privacy Policy | Glamourhall',
  description: "Glamourhall's Privacy Policy outlining how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: February 07, 2025</p>

      <p>This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
      <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

      <h2 className="text-2xl font-semibold mt-6">Interpretation and Definitions</h2>
      <h3 className="text-xl font-medium mt-4">Interpretation</h3>
      <p>The words of which the initial letter is capitalized have meanings defined under the following conditions...</p>

      <h3 className="text-xl font-medium mt-4">Definitions</h3>
      <p>For the purposes of this Privacy Policy:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Account:</strong> A unique account created for You to access our Service.</li>
        <li><strong>Company:</strong> Refers to Glamourhall.</li>
        <li><strong>Cookies:</strong> Small files placed on Your device by a website.</li>
        <li><strong>Country:</strong> Refers to West Bengal, India.</li>
        <li><strong>Device:</strong> Any device that can access the Service.</li>
        <li><strong>Personal Data:</strong> Information that identifies an individual.</li>
        <li><strong>Website:</strong> Refers to Glamourhall, accessible from <a href="https://www.glamourhall.tech/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">glamourhall.tech</a></li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Collecting and Using Your Personal Data</h2>
      <p>We may collect the following data:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Email address</li>
        <li>First and Last Name</li>
        <li>Usage Data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Children's Privacy</h2>
      <p>Our Service does not address anyone under the age of 13...</p>

      <h2 className="text-2xl font-semibold mt-6">Changes to This Privacy Policy</h2>
      <p>We may update Our Privacy Policy from time to time. Changes are effective when posted on this page.</p>

      <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, You can contact us:</p>
      <ul className="list-disc pl-5">
        <li>By visiting this page on our website: <a href="https://www.glamourhall.tech/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">glamourhall.tech</a></li>
      </ul>

      <p className="mt-8">
        <Link href="/" className="text-blue-500 underline">← Back to Home</Link>
      </p>
    </main>
  );
}
