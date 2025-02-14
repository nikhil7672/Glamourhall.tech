import { Metadata } from 'next';
import Link from 'next/link';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'About Us | Glamourhall',
  description: "Learn more about Glamourhall, our mission, values, and the team behind our innovative services.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About Glamourhall</h1>
      <p className="text-lg text-gray-700 mb-6">
        Welcome to <strong>Glamourhall</strong>! We are operated and managed by <strong>AVISEKH GURUNG</strong>. Our focus is on delivering innovative solutions that blend technology and creativity to meet the diverse needs of our clients.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Our Mission</h2>
      <p className="mt-2 text-gray-700">
        Our mission at Glamourhall is to empower individuals and businesses through cutting-edge technology and creative solutions. We strive to deliver products and services that foster growth, innovation, and long-term success.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Our Values</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-700">
        <li><strong>Innovation:</strong> We embrace new ideas and technologies to stay ahead in the industry.</li>
        <li><strong>Integrity:</strong> We uphold honesty and transparency in all our dealings.</li>
        <li><strong>Customer Focus:</strong> Our clients are at the heart of everything we do.</li>
        <li><strong>Collaboration:</strong> We believe in the power of teamwork and partnerships to achieve excellence.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Meet AVISEKH GURUNG</h2>
      <p className="mt-2 text-gray-700">
        AVISEKH GURUNG is the visionary behind Glamourhall, bringing years of experience in technology and creative solutions. His leadership and passion drive the company's commitment to excellence and innovation.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Contact Information</h2>
      <p className="mt-2 text-gray-700">
        For inquiries or support, please email directly at{" "}
        <a 
          href="mailto:avisekhgurung099@gmail.com" 
          className="text-blue-500 underline hover:text-blue-700"
        >
          avisekhgurung099@gmail.com
        </a>
        .
      </p>

      <p className="mt-8">
        <Link href="/" className="text-blue-500 underline">← Back to Home</Link>
      </p>
    </main>
  );
}
