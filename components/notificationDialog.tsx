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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <Link
                        href={`/notification/${notification.id}`}
                        onClick={onClose}
                        className="block"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {format(notification.timestamp, "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50 sticky bottom-0">
              <Link
                href="/notification"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                View all notifications
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
