// components/SidebarUser.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

const menu = [
  { href: "/dashboardUser", label: "Beranda", icon: "🏠" },
  { href: "/dashboardUser/absensi", label: "Absensi", icon: "📍" },
  { href: "/dashboardUser/history", label: "History Absen", icon: "🕘"},
  { href: "/dashboardUser/cuti", label: "Cuti", icon: "📆" },
  { href: "/dashboardUser/lembur", label: "Lembur", icon: "⏰" },
  { href: "/dashboardUser/payroll", label: "Payroll", icon: "💸" },
  { href: "#", label: "Kasbon", icon: "🏦" },
];

export default function SidebarUser({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Fragment>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex bg-[#20653a] dark:bg-gray-900 w-56 min-h-screen shadow flex-col py-6 px-4">
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition ${
                (item.href === "/dashboardUser"
                  ? pathname === "/dashboardUser"
                  : pathname.startsWith(item.href)
                )
                  ? "bg-[#64A838] text-white"
                  : "text-white dark:text-gray-200 hover:bg-[#64A838] dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* SIDEBAR MOBILE: drawer/modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
          <aside className="relative bg-[#20653a] dark:bg-white w-64 h-full shadow-lg flex flex-col py-6 px-4">
            <button className="mb-6 text-left text-gray-400" onClick={onClose}>
              <span className="text-2xl text-white">&times;</span>
              <span className="ml-2 text-white">Tutup</span>
            </button>
            <nav className="flex flex-col gap-2">
              {menu.map((item) => (
                <button
                  key={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition text-left ${
                    (item.href === "/dashboardUser"
                      ? pathname === "/dashboardUser"
                      : pathname.startsWith(item.href)
                    )
                      ? "bg-[#64A838] text-white"
                      : "text-white dark:text-gray-200 hover:bg-[#64A838] dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    router.push(item.href);
                    if (onClose) onClose();
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </Fragment>
  );
}
