"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaBell,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaQuestionCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const TopNavbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const isAdmin = currentUser?.isAdmin;
  const isStaff = currentUser?.isStaff;
  const isCustomer = currentUser?.isCustomer;

  const profileImage =
    (isAdmin && currentUser.profilePicture) ||
    (isStaff && currentUser.profilePictureStaff) ||
    (isCustomer && currentUser.profilePictureCustomer);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      // تحديث حالة الإشعار محلياً
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // تحديث الإشعارات كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // تحميل الإشعارات المزيفة
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: "طلب إجازة جديد", time: "منذ 10 دقائق", read: false },
      {
        id: 2,
        title: "تقرير الأداء الشهري جاهز",
        time: "منذ ساعة",
        read: true,
      },
      {
        id: 3,
        title: "اجتماع فريق الموارد البشرية",
        time: "منذ يومين",
        read: true,
      },
    ];
    setNotifications(mockNotifications);

    // تحديث الوقت الحالي
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateString = now.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentTime(`${timeString} • ${dateString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // تبديل وضع الليل
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  // حساب الإشعارات غير المقروءة
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 shadow-lg text-white">
      <div className="flex items-center gap-4">
        <div className="bg-white/10 p-2 rounded-xl">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">HR</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            نظام إدارة الموارد البشرية
          </h1>
          <p className="text-xs text-indigo-200 dark:text-gray-300 mt-1">
            {currentTime || "جاري تحميل الوقت..."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* زر المساعدة */}
        <Tooltip content="المساعدة" placement="bottom">
          <button className="p-2 rounded-full bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-600 dark:hover:bg-gray-600 transition">
            <FaQuestionCircle className="text-lg" />
          </button>
        </Tooltip>

        {/* زر الإعدادات */}
        <Tooltip content="الإعدادات" placement="bottom">
          <button className="p-2 rounded-full bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-600 dark:hover:bg-gray-600 transition">
            <FaCog className="text-lg" />
          </button>
        </Tooltip>

        {/* زر وضع الليل */}
        <Tooltip
          content={darkMode ? "الوضع النهاري" : "الوضع الليلي"}
          placement="bottom"
        >
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-600 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? (
              <FaSun className="text-lg" />
            ) : (
              <FaMoon className="text-lg" />
            )}
          </button>
        </Tooltip>

        {/* زر الإشعارات */}
        <div className="relative">
          <Tooltip content="الإشعارات" placement="bottom">
            <button
              onClick={() => setIsDropdownOpen("notifications")}
              className="p-2 rounded-full bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-600 dark:hover:bg-gray-600 transition relative"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          <AnimatePresence>
            {isDropdownOpen === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    الإشعارات
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    لديك {unreadCount} إشعارات غير مقروءة
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <Link
                        key={notification._id}
                        href={notification.link || "#"}
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        <div
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 transition ${
                            notification.read
                              ? "bg-white dark:bg-gray-800"
                              : "bg-blue-50 dark:bg-gray-700"
                          }`}
                        >
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="bg-red-500 rounded-full w-2 h-2"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString(
                              "ar-EG"
                            )}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FaBell className="mx-auto text-gray-400 text-2xl" />
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        لا توجد إشعارات
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
                  <Link
                    href="/notifications"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline w-full text-center"
                  >
                    عرض جميع الإشعارات
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* زر الملف الشخصي */}
        <div className="relative">
          <button
            onClick={() =>
              setIsDropdownOpen(isDropdownOpen === "profile" ? null : "profile")
            }
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow">
                  <FaUserCircle className="text-xl text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div className="text-left hidden md:block">
              <p className="text-sm font-medium">
                {currentUser?.name || "مستخدم"}
              </p>
              <p className="text-xs text-indigo-200 dark:text-gray-300">
                {currentUser?.role || "مستخدم"}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="profile"
                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                        <FaUserCircle className="text-2xl text-white" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {currentUser?.name || "مستخدم"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentUser?.role || "مستخدم"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <FaUserCircle className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      الملف الشخصي
                    </span>
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <FaCog className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      الإعدادات
                    </span>
                  </Link>
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                    <FaSignOutAlt />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// مكون مساعد للتلميحات
const Tooltip = ({ children, content, placement = "bottom" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const placementClasses = {
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`absolute ${placementClasses[placement]} z-20`}
          >
            <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap">
              {content}
              <div
                className="absolute w-2 h-2 bg-gray-800 rotate-45 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  ...(placement === "bottom" && { top: "-4px" }),
                  ...(placement === "top" && { bottom: "-4px" }),
                  ...(placement === "left" && { right: "-4px" }),
                  ...(placement === "right" && { left: "-4px" }),
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopNavbar;
