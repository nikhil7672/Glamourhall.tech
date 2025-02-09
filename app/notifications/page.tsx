"use client";
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

const NotificationsPage = () => {
  // Sample notifications data (Replace with API fetch)
  const [notifications] = useState([
    {
      id: '1',
      title: 'New Style Recommendation',
      message: 'Check out the latest fashion trends we picked for you!',
      timestamp: new Date(),
      read: false,
      type: 'update' as const,
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  return (
<div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <Link href="/chat" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back to Chat
      </Link>
      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-center sm:text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400">
          All Notifications
        </h1>
      </div>
    </div>

    {/* Notifications List */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg divide-y divide-gray-200 dark:divide-gray-700">
      {currentNotifications.length > 0 ? (
        currentNotifications.map((notification) => (
          <Link
            key={notification.id}
            href={`/notifications/${notification.id}`}
            className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg ${
              !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                {format(notification.timestamp, 'MMM d, yyyy - h:mm a')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
          </Link>
        ))
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No notifications found
        </div>
      )}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2 mt-6 p-4 bg-white dark:bg-gray-900 shadow-lg rounded-2xl">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-full font-medium ${
                currentPage === page
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    )}
  </div>
</div>

  );
};

export default NotificationsPage;