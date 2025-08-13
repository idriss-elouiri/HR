// src/components/Sidebar.js
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  FaTachometerAlt,
  FaUserTie,
  FaBriefcase,
  FaSignOutAlt,
  FaCalendarAlt,
  FaUserClock,
  FaPlaneDeparture,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaChartLine,
  FaTimes,
  FaSkyatlas,
  FaUser,
  FaUserCog,
  FaFileAlt,
  FaClock,
  FaBell,
  FaMoneyBillWave, // أيقونة جديدة
} from "react-icons/fa";
import { MdPeopleAlt, MdSettings } from "react-icons/md";

const Sidebar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  // تحديد الصلاحيات بناءً على دور المستخدم
  const isAdmin = currentUser?.isAdmin;
  const isHR = currentUser?.isHR;
  const isEmployee = !isAdmin && !isHR;

  // تحديد دور المستخدم للنص
  const userRole = isAdmin ? "مشرف النظام" : isHR ? "موظف HR" : "موظف";

  return (
    <aside
      className={`min-h-screen bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-indigo-700 flex items-center justify-between">
        <div
          className={`flex items-center gap-3 transition-opacity ${
            collapsed ? "opacity-0 w-0" : "opacity-100 w-full"
          }`}
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-xl">
            <FaUserTie size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              نظام الموارد البشرية
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              {currentUser?.name} - {userRole}
            </p>
          </div>
        </div>

        <button
          onClick={toggleCollapse}
          className="p-2 rounded-full bg-indigo-700 hover:bg-indigo-600 transition-all"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className="p-4 space-y-1">
        {/* لوحة التحكم - متاحة للجميع */}
        {(isAdmin || isHR) && (
          <Link
            href="/Dashboard"
            onClick={() => handleLinkClick("dashboard")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "dashboard"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaTachometerAlt size={20} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              لوحة التحكم
            </span>
          </Link>
        )}
        {/* الموظفون - للمشرفين وموظفي HR فقط */}
        {(isAdmin || isHR) && (
          <Link
            href="/Employees"
            onClick={() => handleLinkClick("employees")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "employees"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <MdPeopleAlt size={20} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              الموظفون
            </span>
          </Link>
        )}

        {/* الرواتب المالية - للمشرفين وموظفي HR فقط */}
        {(isAdmin || isHR) && (
          <Link
            href="/Salaries"
            onClick={() => handleLinkClick("salaries")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "salaries"
                ? "bg-gradient-to-r from-green-500 to-green-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaBriefcase size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              الرواتب المالية
            </span>
          </Link>
        )}

        {/* الإجازات والغياب - متاحة للجميع ولكن بصلاحيات مختلفة */}
        <Link
          href={isEmployee ? "/EmployeeLeaveRequest" : "/LeavesAbsences"}
          onClick={() => handleLinkClick("leaves")}
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
            activeLink === "leaves"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg"
              : "hover:bg-indigo-700"
          }`}
        >
          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
            <FaCalendarAlt size={18} />
          </div>
          <span className={`${collapsed ? "hidden" : "block"}`}>
            {isEmployee ? "طلب إجازة" : "الإجازات والغياب"}
          </span>
        </Link>

        {/* طلب سلفة - للموظفين العاديين فقط */}
        {isEmployee && (
          <Link
            href="/AdvanceRequest"
            onClick={() => handleLinkClick("advance")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "advance"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaMoneyBillWave size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              طلب سلفة
            </span>
          </Link>
        )}

        {/* التقارير والإشعارات - للمشرفين وموظفي HR فقط */}
        {(isAdmin || isHR) && (
          <Link
            href="/Reports"
            onClick={() => handleLinkClick("reports")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "reports"
                ? "bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaUserClock size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              التقارير والإشعارات
            </span>
          </Link>
        )}

        {/* إدارة الشفتات - للمشرفين فقط */}
        {isAdmin && (
          <Link
            href="/DepartmentsShiftsPage"
            onClick={() => handleLinkClick("shifts")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "shifts"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaClock size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              إدارة الشفتات
            </span>
          </Link>
        )}

        {/* الحضور والانصراف - للمشرفين وموظفي HR فقط */}
        {(isAdmin || isHR) && (
          <Link
            href="/ZKAttendance"
            onClick={() => handleLinkClick("attendance")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "attendance"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaTimes size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              الحضور والانصراف
            </span>
          </Link>
        )}

        {/* نظام التقارير - للمشرفين فقط */}
        {isAdmin && (
          <Link
            href="/SystemReports"
            onClick={() => handleLinkClick("system")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "system"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaSkyatlas size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              نظام التقارير
            </span>
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/Notifications"
            onClick={() => handleLinkClick("Notifications")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "notifications"
                ? "bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaBell size={20} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              الإشعارات
            </span>
          </Link>
        )}
        {/* معلومات الموظف - للموظف العادي فقط */}
        {(isEmployee || isHR) && (
          <Link
            href="/EmployeeInfo"
            onClick={() => handleLinkClick("info")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "info"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaUser size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              معلوماتي الشخصية
            </span>
          </Link>
        )}

        {/* تسجيل الخروج - متاح للجميع */}
        <Link
          href="/Logout"
          onClick={() => handleLinkClick("Logout")}
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
            activeLink === "Logout"
              ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
              : "hover:bg-indigo-700"
          }`}
        >
          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
            <FaSignOutAlt size={18} />
          </div>
          <span className={`${collapsed ? "hidden" : "block"}`}>
            تسجيل الخروج
          </span>
        </Link>
      </div>

      {/* مؤشر الدور في أسفل السايد بار */}
      <div
        className={`p-4 border-t border-indigo-700 ${
          collapsed ? "hidden" : "block"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="bg-indigo-700 p-1 rounded-full">
            {isAdmin ? (
              <FaUserCog className="text-amber-400" size={16} />
            ) : isHR ? (
              <FaUserTie className="text-emerald-400" size={16} />
            ) : (
              <FaUser className="text-blue-300" size={16} />
            )}
          </div>
          <div>
            <p className="text-xs text-indigo-300">دور المستخدم الحالي:</p>
            <p className="text-sm font-medium">
              {isAdmin && "مشرف النظام (صلاحيات كاملة)"}
              {isHR && "موظف HR (صلاحيات جزئية)"}
              {isEmployee && "موظف (عرض معلوماته فقط)"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
