"use client";
import AdminSidebar from "../components/AdminSidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import React from "react";
import { Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
});

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-[#F5FFFD] relative font-sans selection:bg-indigo-100 ${comfortaa.variable}`}>
      <div className="fixed left-0 top-0 h-full z-[100] hidden md:block">
        <AdminSidebar />
      </div>
      <header className="absolute top-0 right-0 left-0 h-24 z-[90] flex items-center justify-end px-8 pt-6 pointer-events-none">
        <div className="pointer-events-auto">
          <ProfileDropdown />
        </div>
      </header>
      <div className="absolute top-0 right-0 left-0 md:left-75 h-65 bg-[#84C15D] rounded-b-[15px] z-0">
      </div>
      <main className="relative z-10 ml-0 md:ml-75 pt-32 px-8 pb-10">
        <div className="bg-[#EEFFF3] rounded-2xl shadow-2xl shadow-indigo-100/50 min-h-[calc(100vh-10rem)] p-6 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}