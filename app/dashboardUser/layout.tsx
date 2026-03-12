"use client";
import { Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
});
export default function DashboardUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-gray-50 font-sans relative ${comfortaa.variable}`}>
      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}