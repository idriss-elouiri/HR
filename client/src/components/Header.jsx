"use client";

import React from "react";
import { useSelector } from "react-redux";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="bg-indigo-100 text-indigo-900 px-4 py-2 text-sm font-medium rounded shadow">
      المستخدم الحالي: {currentUser?.email || "غير معروف"}
    </div>
  );
};

export default Header;
