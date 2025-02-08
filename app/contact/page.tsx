import { Metadata } from 'next';
import Link from 'next/link';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us | Glamourhall',
  description: "Get in touch with Glamourhall for inquiries, support, or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-gray-700 mb-6">
        We'd love to hear from you! Whether you have questions, feedback, or partnership inquiries, feel free to reach out.
      </p>

      <h2 className="text-2xl font-semibold mt-6">How to Reach Us</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-700">
        <li><strong>Email:</strong> <a href="mailto:avisekhgurung099@gmail.com" className="text-blue-500 underline">avisekhgurung099@gmail.com</a></li>
        <li><strong>Phone:</strong> +9198617804191</li>
        <li><strong>Address:</strong> Champta, Darjeeling, West Bengal, India 734009</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6">Send Us a Message</h2>
      <form className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium">Name</label>
          <input type="text" id="name" name="name" placeholder="Your Name" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
          <input type="email" id="email" name="email" placeholder="Your Email" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 font-medium">Message</label>
          <textarea id="message" name="message" rows={5} placeholder="Your Message" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>

      <p className="mt-8">
        <Link href="/" className="text-blue-500 underline">← Back to Home</Link>
      </p>
    </main>
  );
}
