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
        Welcome to <strong>Glamourhall</strong>! We are dedicated to providing innovative solutions that blend technology and creativity to meet your needs. Our platform offers a wide range of services designed to enhance your digital experience.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Our Mission</h2>
      <p className="mt-2 text-gray-700">
        At Glamourhall, our mission is to empower individuals and businesses by delivering high-quality, user-centric products and services that foster growth, innovation, and success.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Our Values</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-700">
        <li><strong>Innovation:</strong> We strive to stay ahead of the curve by embracing new ideas and technologies.</li>
        <li><strong>Integrity:</strong> Honesty and transparency are at the core of everything we do.</li>
        <li><strong>Customer Focus:</strong> We prioritize our customers' needs and work to exceed their expectations.</li>
        <li><strong>Collaboration:</strong> We believe in the power of teamwork and partnerships.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Meet the Team</h2>
      <p className="mt-2 text-gray-700">
        Our passionate and dedicated team of professionals brings together expertise from diverse backgrounds, ensuring we deliver the best possible solutions to our clients.
      </p>

      <p className="mt-8">
        <Link href="/contact" className="text-blue-500 underline">Get in touch with us →</Link>
      </p>
    </main>
  );
}
