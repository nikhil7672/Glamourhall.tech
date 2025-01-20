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
    window.location.href = '/notification';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
        <Link href="/chat" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <Bell className="w-6 h-6 text-gray-600" />
        </div>

        {/* Notification Content */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">{notification.title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {format(notification.timestamp, 'MMM d, yyyy - h:mm a')}
          </p>
          <div className="mt-4">
            <p className="text-gray-700 text-lg">{notification.message}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 border-t">
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
