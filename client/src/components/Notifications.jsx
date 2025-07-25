"use client";
import { useState, useEffect } from "react";
import { FaBell, FaCheck, FaTrash } from "react-icons/fa";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // تحديد نقطة النهاية بناءً على التبويب النشط
      let endpoint = `${apiUrl}/api/notifications`;
      if (activeTab === "employee") {
        endpoint = `${apiUrl}/api/notifications/employee`;
      }

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("فشل في جلب الإشعارات");
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      toast.error(error.message || "فشل في جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast.error("فشل في تحديث الإشعار");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success("تم حذف الإشعار");
    } catch (error) {
      toast.error("فشل في حذف الإشعار");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
        method: "PUT",
        credentials: "include",
      });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("تم وضع جميع الإشعارات كمقروءة");
    } catch (error) {
      toast.error("فشل في تحديث الإشعارات");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        <p className="text-indigo-200 mt-2">جميع إشعارات النظام في مكان واحد</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              جميع الإشعارات
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "employee"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              إشعارات السلفة
            </button>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition"
          >
            <FaCheck className="ml-2" /> وضع الكل كمقروء
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 flex justify-between items-start transition ${
                  !notification.read ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString(
                        "ar-EG",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  {notification.link && (
                    <a
                      href={notification.link}
                      className="text-indigo-600 hover:underline mt-2 inline-block"
                    >
                      عرض التفاصيل
                    </a>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                      title="وضع كمقروء"
                    >
                      <FaCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    title="حذف"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FaBell className="mx-auto text-gray-400 text-3xl mb-4" />
              <p className="text-gray-500">لا توجد إشعارات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
