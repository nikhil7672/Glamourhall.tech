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
    {
      id: '2',
      title: 'Outfit Analysis Complete',
      message: 'Your recent outfit analysis is ready to view.',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: 'alert' as const,
    },
    {
      id: '3',
      title: 'New Message',
      message: 'Your stylist has sent you a new message.',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      type: 'message' as const,
    },
    {
      id: '4',
      title: 'Trending Colors',
      message: 'Spring color trends are now available!',
      timestamp: new Date(Date.now() - 86400000),
      read: false,
      type: 'update' as const,
    },
    {
      id: '5',
      title: 'Style Match Found',
      message: 'We found a perfect match for your style preferences.',
      timestamp: new Date(Date.now() - 172800000),
      read: true,
      type: 'alert' as const,
    },
    {
      id: '6',
      title: 'Wardrobe Update',
      message: 'Time to refresh your wardrobe! Check new suggestions.',
      timestamp: new Date(Date.now() - 259200000),
      read: false,
      type: 'update' as const,
    },
    {
      id: '7',
      title: 'Seasonal Tips',
      message: 'New seasonal styling tips are available.',
      timestamp: new Date(Date.now() - 345600000),
      read: true,
      type: 'message' as const,
    },
    {
      id: '8',
      title: 'Style Analysis',
      message: 'Your monthly style analysis is ready.',
      timestamp: new Date(Date.now() - 432000000),
      read: false,
      type: 'alert' as const,
    },
    {
      id: '9',
      title: 'New Collection',
      message: 'Explore our latest collection picks for you.',
      timestamp: new Date(Date.now() - 518400000),
      read: true,
      type: 'update' as const,
    },
    {
      id: '10',
      title: 'Outfit Reminder',
      message: 'Dont forget to plan your outfit for tomorrow!',
      timestamp: new Date(Date.now() - 604800000),
      read: false,
      type: 'message' as const,
    },
    {
      id: '11',
      title: 'Style Achievement',
      message: 'You unlocked a new style milestone!',
      timestamp: new Date(Date.now() - 691200000),
      read: true,
      type: 'alert' as const,
    },
    {
      id: '12',
      title: 'Fashion Event',
      message: 'Virtual fashion show starting in 2 hours.',
      timestamp: new Date(Date.now() - 777600000),
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/chat" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Chat
          </Link>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-gray-600" />
            <h1 className="text-xl font-semibold text-center sm:text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">All Notifications</h1>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {currentNotifications.length > 0 ? (
            currentNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/notification/${notification.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                    {format(notification.timestamp, 'MMM d, yyyy - h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No notifications found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2 mt-4 p-4 bg-white shadow-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;