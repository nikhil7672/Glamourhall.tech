"use client";
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Bell } from 'lucide-react';
import Link from 'next/link';
const NotificationDetails = () => {
    const params = useParams();
    const id = params.id;

  // Sample Notification Data (Replace with API Fetch)
  const notification = {
    id,
    title: 'System Update Available',
    message: 'A new update is available for your system. Please update to the latest version for enhanced features and security improvements.',
    timestamp: new Date(),
    type: 'update',
    read: true,
  };

  const handleBack = () => {
    window.location.href = '/notifications';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 transition-colors duration-300">
    {/* Header */}
    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <Link href="/chat" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </div>

      {/* Notification Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{notification.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {format(notification.timestamp, 'MMM d, yyyy - h:mm a')}
        </p>
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{notification.message}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end items-center p-4 border-t dark:border-gray-700">
        <button
          onClick={handleBack}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 transition-all"
        >
          View All Notifications
        </button>
      </div>
    </div>
  </div>

  );
};

export default NotificationDetails;
