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
} from "react-icons/fa";
import { MdPeopleAlt, MdSettings } from "react-icons/md";

const Sidebar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  console.log(currentUser.isHR);
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
          <h2 className="text-xl font-bold tracking-tight">
            نظام الموارد البشرية
          </h2>
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

        {/* الموظفون - للمشرفين وموظفي HR فقط */}
        {isAdmin && (
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
        {isAdmin && (
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

        {/* الإجازات والغياب - متاحة للجميع */}
        {isAdmin && (
          <Link
            href="/LeavesAbsences"
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
              الإجازات والغياب
            </span>
          </Link>
        )}
        {isHR && (
          <Link
            href="/EmployeeLeaveRequest"
            onClick={() => handleLinkClick("leaverequest")}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
              activeLink === "leaverequest"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg"
                : "hover:bg-indigo-700"
            }`}
          >
            <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
              <FaCalendarAlt size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              طلب إجازة
            </span>
          </Link>
        )}
        {/* التقارير والإشعارات - للمشرفين وموظفي HR فقط */}
        {isAdmin && (
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
              <FaPlaneDeparture size={18} />
            </div>
            <span className={`${collapsed ? "hidden" : "block"}`}>
              إدارة الشفتات
            </span>
          </Link>
        )}

        {/* الحضور والانصراف - للمشرفين وموظفي HR فقط */}
        {isAdmin && (
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

        {/* الإعدادات - متاحة للجميع ولكن بصلاحيات مختلفة */}
        <Link
          href="/Settings"
          onClick={() => handleLinkClick("settings")}
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all group ${
            activeLink === "settings"
              ? "bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg"
              : "hover:bg-indigo-700"
          }`}
        >
          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition">
            <MdSettings size={20} />
          </div>
          <span className={`${collapsed ? "hidden" : "block"}`}>الإعدادات</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
