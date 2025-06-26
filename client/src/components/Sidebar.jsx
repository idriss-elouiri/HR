import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import {
    FaTachometerAlt,
    FaUserTie,
    FaBriefcase,
    FaSignOutAlt,
} from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

const Sidebar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const isAdmin = currentUser?.isAdmin;
    const isStaff = currentUser?.isStaff;

    return (
        <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-800 to-indigo-800 text-white shadow-xl">
            <div className="p-6 border-b border-indigo-600 flex items-center gap-3">
                <div className="bg-white text-blue-800 p-2 rounded-full">
                    <FaUserTie size={24} />
                </div>
                <h2 className="text-xl font-bold">HR System</h2>
            </div>

            <nav className="p-4 space-y-3">
                {(isAdmin || isStaff) && (
                    <Link
                        href="/Dashboard"
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        <FaTachometerAlt />
                        <span>لوحة التحكم</span>
                    </Link>
                )}

                {isAdmin && (
                    <Link
                        href="/Employee"
                        className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        <MdPeopleAlt />
                        <span>الموظفون</span>
                    </Link>
                )}

                <Link
                    href="/Employees"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                    <FaBriefcase />
                    <span>بيانات الموظفين
                    </span>
                </Link>

                <button
                    className="flex items-center gap-3 py-2 px-4 w-full text-left rounded-lg hover:bg-red-600 transition"
                >
                    <FaSignOutAlt />
                    <span>تسجيل الخروج</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;