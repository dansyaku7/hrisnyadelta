"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserType = {
  name?: string;
  email?: string;
  photoURL?: string;
  role?: string;
};

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType>({});
  const router = useRouter();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    });
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); 
  };

  return (
    <div 
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition-all">
        <div className="text-right hidden sm:block text-white">
           <p className="text-xl font-bold font-comfortaa">{user.name || "User"}</p>
           <p className="text-l opacity-80 font-comfortaa">Administrator</p>
        </div>
        
        <div className="relative">
          <img
            className="w-11 h-11 rounded-full object-cover border-[3px] group-hover:border-white transition-all shadow-md"
            src={user.photoURL || "/profile.svg"} 
            alt="profile"
          />
        </div>
      </div>

      <div 
        className={`
          absolute right-0 top-full pt-2 w-64 z-[200]
          transform transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}
        `}
      >
        <div className="relative">
            
            <div className="absolute top-[-6px] right-6 w-4 h-4 bg-[#07ABE8] rotate-45 shadow-sm z-10"></div>

            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden text-left z-0">
            
            <div className="bg-[#07ABE8] px-6 py-5 text-white">
                <p className="text-xs opacity-80 tracking-wider mb-1">
                {user.email || "loading..."}
                </p>
                <h3 className="text-lg font-bold leading-tight font-comfortaa">
                {user.name || "User"}
                </h3>
            </div>

            <ul className="py-2 text-gray-600 text-sm font-medium">
                <li>
                <Link
                    href="/dashboardAdmin/profile"
                    className="block px-6 py-3 hover:text-[#07ABE8] hover:bg-cyan-50 transition-colors"
                >
                    Profile
                </Link>
                </li>
                <li className="border-t border-gray-100 mt-1">
                <button
                    onClick={handleLogout}
                    className="block w-full text-left px-6 py-3 text-red-500 hover:bg-red-50 transition-colors"
                >
                    Log Out
                </button>
                </li>
            </ul>
            </div>
        </div>
      </div>
    </div>
  );
}