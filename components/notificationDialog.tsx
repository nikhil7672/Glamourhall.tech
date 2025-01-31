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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          ></motion.div>

          {/* Dialog */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-lg overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200"
                aria-label="Close notifications"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{notification.title}</h3>
                      <p className="text-xs text-gray-500">
                        {format(notification.timestamp, "MMM d, h:mm a")}
                      </p>
                      <p className="text-sm">{notification.message}</p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="mt-2 sm:mt-0 sm:ml-2 text-gray-400"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500">
                  No new notifications
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t text-center">
              <Link
                href="/notifications"
                className="text-purple-600 hover:underline"
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
