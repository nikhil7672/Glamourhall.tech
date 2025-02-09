"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { Bell, X, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "message" | "alert" | "update";
}

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          ></motion.div>

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-800 z-50 shadow-2xl rounded-l-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-tl-2xl">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Notifications</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Close notifications"
              >
                <X size={22} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-5 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        {notification.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(notification.timestamp, "MMM d, h:mm a")}
                      </p>
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                        {notification.message}
                      </p>
                    </div>
                    <ChevronRight
                      size={22}
                      className="ml-3 text-gray-400 dark:text-gray-500"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No new notifications
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-bl-2xl">
              <Link
                href="/notifications"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
