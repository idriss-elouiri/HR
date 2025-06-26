"use client";

import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const TopNavbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;
  const isStaff = currentUser?.isStaff;
  const isCustomer = currentUser?.isCustomer;

  const profileImage =
    (isAdmin && currentUser.profilePicture) ||
    (isStaff && currentUser.profilePictureStaff) ||
    (isCustomer && currentUser.profilePictureCustomer);

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-700 to-blue-600 shadow text-white">
      <h1 className="text-xl md:text-2xl font-semibold tracking-wide">لوحة تحكم نظام الموارد البشرية</h1>
      <Link
        href="/profile"
        className="flex items-center gap-3 hover:opacity-90 transition"
      >
        <span className="hidden md:inline-block text-sm font-medium">الملف الشخصي</span>
        <img
          src={profileImage || "/default-avatar.png"}
          alt="profile"
          className="w-9 h-9 rounded-full border-2 border-white"
        />
      </Link>
    </header>
  );
};

export default TopNavbar;