
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavbarUser({
  user,
  onMenuClick,
}: {
  user: { name: string; avatar?: string; email?: string };
  onMenuClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="bg-[#188fd4ff] dark:bg-gray-900 sticky top-0 z-30 w-full max-w-none">
      <div className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* HAMBURGER hanya di mobile */}
          <button
            className="md:hidden mr-2 p-2 rounded hover:bg-gray-100"
            aria-label="Open sidebar"
            onClick={onMenuClick}
          >
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a href="/dashboardUser" className="flex items-center gap-3">
            <div style={{
                background: "#fff",
                borderRadius: 10,
                padding: 8,
                paddingTop: 3,
                display: "inline-block",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
              <img src="/templates/DIL.png" className="h-12 w-22" alt="Logo" />
            </div>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"></span>
          </a>
        </div>
        {/* Profil kanan atas */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex text-sm bg-white rounded-full focus:ring-2 focus:ring-[#64A838]"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-9 h-9 rounded-full object-cover"
                src={"/profile.svg"}
                alt="user photo"
              />
            </button>
            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow z-20 text-gray-900 dark:bg-gray-700 dark:text-white">
                <div className="px-4 py-3 border-b dark:border-gray-600">
                  <div className="font-bold text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                <ul className="py-2">
                  <li>
                    <a
                      href="/dashboardUser/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Profil
                    </a>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={async () => {
                        await fetch("/api/logout", { method: "POST" });
                        router.push("/");
                      }}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
