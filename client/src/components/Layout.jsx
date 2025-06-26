"use client"

import {useState} from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function Layout({children}) {
  const [showNav,setShowNav] = useState(false);

  // Import the Sidebar component dynamically with SSR disabled
  return (
    <div className="flex">
    <Sidebar />
    <div className="flex-1">
      <TopNavbar />
      <main className="p-6 space-y-6 bg-gray-100">
       {children}
      </main>
    </div>
  </div>
  );
}