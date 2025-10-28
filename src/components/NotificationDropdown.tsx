import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  TrendingUp,
  Clock,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../lib/appwrite";
import type { Notification } from "../types/appwrite";

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (
    type: Notification["type"],
    priority: Notification["priority"]
  ) => {
    const iconClass = `w-3 h-3 ${
      priority === "high"
        ? "text-red-400"
        : priority === "medium"
        ? "text-[#d8ed36]"
        : "text-[#d8ed36]"
    }`;

    switch (type) {
      case "transaction_update":
        return <TrendingUp className={iconClass} />;
      case "investment_update":
        return <CheckCircle className={iconClass} />;
      case "security":
        return <Shield className={iconClass} />;
      case "system":
        return <Info className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-900";
      case "medium":
        return "border-l-[#d8ed36] bg-gray-800";
      case "low":
        return "border-l-[#d8ed36] bg-gray-800";
      default:
        return "border-l-gray-500 bg-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US");
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.isRead !== "true" && notification.isRead !== true) {
      await markAsRead(notification.$id);
    }

    // Close the dropdown
    setIsOpen(false);

    // If there's an action URL, navigate to it
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative " ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative  p-2 text-gray-400 hover:text-[#d8ed36] hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute  -right-20 md:right-0 mt-2  w-[300px] md:w-96 bg-gray-400 rounded-lg shadow-lg border border-gray-800 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-sm md:text-lg font-semibold text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {/* {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className=" text-xs md:text-sm text-[#d8ed36] hover:text-[#c4d630] font-medium flex items-center"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </button>
                )} */}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs md:text-sm text-red-600 hover:text-red-300 font-medium flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-[#d8ed36]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.$id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-1 md:p-2 border   cursor-pointer transition-colors border-l ${getPriorityColor(
                        notification.priority
                      )} ${
                        notification.isRead !== "true" &&
                        notification.isRead !== true
                          ? "bg-gray-800  hover:bg-gray-600"
                          : "bg-gray-400  hover:bg-gray-700"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5 hidden  ">
                          {getNotificationIcon(
                            notification.type,
                            notification.priority
                          )}
                        </div>
                        <div className="flex-1   min-w-0">
                          <div className="flex items-center   justify-between">
                            <p
                              className={`text-xs md:text-sm font-medium ${
                                notification.isRead !== "true" &&
                                notification.isRead !== true
                                  ? "text-white italic"
                                  : "text-white italic"
                              }`}
                            >
                              {notification.title} ...
                            </p>
                            <div className="flex items-center  space-x-2">
                              <span className="text-xs text-white">
                                {formatTimeAgo(notification.$createdAt)}
                              </span>
                              {notification.isRead !== "true" &&
                              notification.isRead !== true ? (
                                <div className="w-2 h-2 bg-[#cee331] rounded-full"></div>
                              ) : (
                                <div className="w-2 h-2 bg-[#a9c0bd]  rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-xs md:text-sm mt-1 ${
                              notification.isRead !== "true" &&
                              notification.isRead !== true
                                ? "text-gray-200"
                                : "text-white"
                            }`}
                          >
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <p
                              className={`text-xs  mt-1 italic ${
                                notification.isRead !== "true" &&
                                notification.isRead !== true
                                  ? "text-[#d8ed36]"
                                  : "text-white "
                              } `}
                            >
                              view more..
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.$id);
                          }}
                          className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className=" p-4 md:p-8 text-center">
                  <Bell className="md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-4" />
                  <h3 className="md:text-lg font-medium text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    You're all caught up! We'll notify you when something
                    important happens.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-800 bg-gray-400">
                <p className="text-xs text-white text-center">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
