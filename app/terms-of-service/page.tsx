import { Metadata } from 'next';
import Link from 'next/link';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Terms and Conditions | Glamourhall',
  description: "Glamourhall's Terms and Conditions outlining the rules and regulations for using our services.",
};

export default function TermsOfServicePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: February 08, 2025</p>

      <p>Please read these terms and conditions carefully before using Our Service.</p>

      <h2 className="text-2xl font-semibold mt-6">Interpretation and Definitions</h2>
      <h3 className="text-xl font-medium mt-4">Interpretation</h3>
      <p>The words of which the initial letter is capitalized have meanings defined under the following conditions...</p>

      <h3 className="text-xl font-medium mt-4">Definitions</h3>
      <p>For the purposes of these Terms and Conditions:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Affiliate:</strong> An entity that controls, is controlled by, or is under common control with a party.</li>
        <li><strong>Country:</strong> Refers to West Bengal, India.</li>
        <li><strong>Company:</strong> Refers to Glamourhall.</li>
        <li><strong>Device:</strong> Any device that can access the Service, such as a computer or smartphone.</li>
        <li><strong>Service:</strong> Refers to the Website.</li>
        <li><strong>Terms and Conditions:</strong> These Terms and Conditions that form the entire agreement between You and the Company.</li>
        <li><strong>Third-party Social Media Service:</strong> Services or content provided by a third party that may be displayed by the Service.</li>
        <li><strong>Website:</strong> Refers to Glamourhall, accessible from <a href="https://www.glamourhall.tech/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">www.glamourhall.tech</a></li>
        <li><strong>You:</strong> The individual or legal entity accessing or using the Service.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Acknowledgment</h2>
      <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company...</p>

      <h2 className="text-2xl font-semibold mt-6">Links to Other Websites</h2>
      <p>Our Service may contain links to third-party websites that are not owned or controlled by the Company...</p>

      <h2 className="text-2xl font-semibold mt-6">Termination</h2>
      <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason...</p>

      <h2 className="text-2xl font-semibold mt-6">Limitation of Liability</h2>
      <p>Notwithstanding any damages that You might incur, the entire liability of the Company shall be limited to the amount actually paid by You through the Service...</p>

      <h2 className="text-2xl font-semibold mt-6">"AS IS" and "AS AVAILABLE" Disclaimer</h2>
      <p>The Service is provided to You "AS IS" and "AS AVAILABLE" without warranty of any kind...</p>

      <h2 className="text-2xl font-semibold mt-6">Governing Law</h2>
      <p>The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service...</p>

      <h2 className="text-2xl font-semibold mt-6">Disputes Resolution</h2>
      <p>If You have any concern or dispute about the Service, You agree to first try to resolve it informally by contacting the Company...</p>

      <h2 className="text-2xl font-semibold mt-6">Changes to These Terms and Conditions</h2>
      <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time...</p>

      <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
      <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
      <ul className="list-disc pl-5">
        <li>By visiting this page on our website: <a href="https://www.glamourhall.tech/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">www.glamourhall.tech</a></li>
      </ul>

      <p className="mt-8">
        <Link href="/" className="text-blue-500 underline">← Back to Home</Link>
      </p>
    </main>
  );
}
