"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Chip, Alert, CircularProgress} from "@mui/material";
import Link from "next/link";

const menuItems = [
  { 
    href: "/dashboardUser/absensi", 
    label: "Absensi", 
    icon: "📍", 
    color: "text-red-600", 
    bg: "bg-red-50", 
    hover: "hover:bg-red-100 hover:shadow-red-200" 
  },
  { 
    href: "/dashboardUser/history", 
    label: "History", 
    icon: "📂", 
    color: "text-fuchsia-500", 
    bg: "bg-fuchsia-50", 
    hover: "hover:bg-fuchsia-100 hover:shadow-fuchsia-200" 
  },
  { 
    href: "/dashboardUser/lembur", 
    label: "Lembur", 
    icon: "⏰", 
    color: "text-orange-600", 
    bg: "bg-orange-50", 
    hover: "hover:bg-orange-100 hover:shadow-orange-200" 
  },
  { 
    href: "/dashboardUser/payroll", 
    label: "Payroll", 
    icon: "💸", 
    color: "text-emerald-600", 
    bg: "bg-emerald-50", 
    hover: "hover:bg-emerald-100 hover:shadow-emerald-200"  
  },
  { 
    href: "/dashboardUser/cuti", 
    label: "Cuti", 
    icon: "📅", 
    color: "text-sky-600", 
    bg: "bg-sky-50", 
    hover: "hover:bg-sky-100 hover:shadow-sky-200" 
  },
  { 
    href: "/dashboardUser/kasbon", 
    label: "Kasbon", 
    icon: "💰", 
    color: "text-violet-600", 
    bg: "bg-violet-50", 
    hover: "hover:bg-violet-100 hover:shadow-violet-200" 
  },
];

type Announcement = {
  id: number | string;
  title: string;
  content: string;
  expired_at: string;
  priority: string;
  target?: string | string[] | null; 
  attachmentUrl?: string;
  createdBy?: string;
  status?: string;
  createdAt?: string;
};

export default function DashboardUser() {
  const [user, setUser] = useState<{ name: string; email?: string; employeeId?: number; department?: string }>({ 
    name: "User", 
    department: "Loading..." 
  });
  
  const [data, setData] = useState<Announcement[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [Now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<string>("");
  const router = useRouter();

  function pad(n: number) { return n.toString().padStart(2, "0"); }
  function getTanggalIndo(date: Date) {
    const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun","Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  }
  const jam = pad(Now.getHours());
  const menit = pad(Now.getMinutes());
  const detik = pad(Now.getSeconds());
  const tanggal = getTanggalIndo(Now);

  const handleLogout = async () => {
    try {
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
    } catch (error) {
        console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    async function fetchAll() {
      setLoading(true); 
      try {
        const [userRes, annRes] = await Promise.all([
          fetch("/api/me").then(res => {
             if (!res.ok) throw new Error("Gagal fetch user");
             return res.json();
          }),
          fetch("/api/announcements").then(res => {
             if (!res.ok) throw new Error("Gagal fetch pengumuman");
             return res.json();
          }) 
        ]);

        const userDeptId = userRes?.departmentId?.toString() || "";
        setDepartmentId(userDeptId);
        const annList = Array.isArray(annRes.data) ? annRes.data : (Array.isArray(annRes) ? annRes : []);
        setData(annList);

        let currentDepartment = "-";
        if (userRes?.employeeId) {
          try {
            const empRes = await fetch(`/api/employee/${userRes.employeeId}`).then(r => r.json());
            const emp = empRes.data;
            
            if (emp?.department) {
                currentDepartment = emp.department;
            } 
            if (
              !emp?.NIK ||
              !emp?.phone ||
              !emp?.norek ||
              !emp?.atasNama || 
              !emp?.address
            ) {
                setProfileIncomplete(true);
            }
          } catch (e) {
            console.error("Gagal fetch detail employee", e);
          }
        }

        setUser({ 
            name: userRes.name || "User", 
            email: userRes.email, 
            employeeId: userRes.employeeId,
            department: currentDepartment 
        });

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Gagal memuat data. Silakan refresh.");
      } finally {
        setLoading(false); 
      }
    }

    fetchAll();
  }, []);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  function matchTarget(ann: Announcement, deptId: string): boolean {
    if (!ann.target || (Array.isArray(ann.target) && ann.target.length === 0)) return true;
    if (typeof ann.target === "string") {
      if (ann.target.trim().toUpperCase() === "ALL") return true;
      try {
        const arr = JSON.parse(ann.target);
        if (Array.isArray(arr) && arr.includes(String(deptId))) return true;
      } catch {}
      if (ann.target === String(deptId)) return true;
      return false;
    }
    if (Array.isArray(ann.target)) {
      return ann.target.map(String).includes(String(deptId));
    }
    return false;
  }

  const now = new Date();
  const validAnnouncements = data.filter(
    ann =>
      (ann.expired_at || (ann as any).expiredAt) &&
      new Date(ann.expired_at || (ann as any).expiredAt) > now &&
      (ann.status?.toLowerCase() === "published") &&
      matchTarget(ann, departmentId)
  );

  function priorityColor(priority: string) {
    switch ((priority || "").toLowerCase()) {
      case "tinggi":
        return <Chip label="Tinggi" sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: "bold" }} size="small" />;
      case "sedang":
        return <Chip label="Sedang" sx={{ bgcolor: "#fef08a", color: "#b45309", fontWeight: "bold" }} size="small" />;
      case "rendah":
        return <Chip label="Rendah" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: "bold" }} size="small" />;
      default:
        return <Chip label={priority} size="small" />;
    }
  }

  if (!mounted) return null;

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-[220px] overflow-hidden z-0">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
          <defs>
             <linearGradient id="gradMain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#66BB6A" /> 
                <stop offset="100%" stopColor="#26A69A" /> 
             </linearGradient>
          </defs>
          <path d="M-5.07,73.50 C149.99,150.00 299.66,-49.98 502.25,73.50 L500.00,0.00 L0.00,0.00 Z" style={{ fill: "#A5D6A7", opacity: 0.5 }} />
          <path d="M0.00,49.98 C168.44,161.10 271.49,-49.98 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" style={{ fill: "url(#gradMain)" }} />
        </svg>
      </div>

      <div className="relative z-10 px-6 pt-12 max-w-lg mx-auto min-h-screen flex flex-col">
        
        <div className="bg-gradient-to-br from-[#07ABE8] to-[#0047AD] rounded-[35px] p-6 text-white shadow-[0_7px_18px_-5px_rgba(38,166,154,0.5)] mb-6 relative overflow-hidden group transform hover:scale-[1.01] transition-transform duration-300">
          {loading ? (
            <div className="flex justify-center py-6 text-white"><CircularProgress color="inherit" /></div>
          ) : (
            <>
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute -left-10 bottom-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>

           <div className="relative z-10 flex justify-between items-start mb-4 border-b border-white/10 pb-4">
              
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/40 text-lg font-bold backdrop-blur-sm shadow-sm">
                    {user.name.charAt(0)}
                 </div>
                 <div>
                    <p className="text-xs text-green-50 font-medium opacity-90 uppercase tracking-wider">
                        {loading ? "..." : user.department || "-"}
                    </p>
                    <h1 className="text-l font-bold tracking-wide leading-tight line-clamp-1 w-40">
                        {loading ? "..." : user.name}
                    </h1>
                 </div>
              </div>
              
              <div className="bg-white p-1.5 pt-0.5 rounded-2xl shadow-lg shadow-green-900/20 cursor-pointer flex items-center justify-center h-13 w-20 group">
                 <img 
                    src="/templates/delta.png" 
                    alt="Delta Logo" 
                    className="w-full h-full object-contain filter drop-shadow-sm transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:scale-125 group-hover:rotate-[15deg]"
                 />
              </div>
           </div>

           <div className="relative z-10 flex justify-between items-end">
              <div>
                 <div className="flex items-baseline">
                    <h2 className="text-4xl font-bold tracking-tighter font-mono drop-shadow-sm">{jam}:{menit}</h2>
                    <span className="text-l font-mono opacity-80 font-medium ml-1">:{detik}</span>
                 </div>
                 <p className="text-xs text-green-100 mt-1 pl-1 font-comfortaa">Waktu Indonesia Barat</p>
              </div>
              
              <div className="text-right">
                 <div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                    <p className="text-sm font-bold">{tanggal}</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-5 relative z-10">
               <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#EDFF69] h-1.5 rounded-full w-[100%] shadow-[0_0_12px_#EDFF69]"></div>
               </div>
           </div>
           </>
           )}
        </div>

        {profileIncomplete && !loading && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 3, boxShadow: 1, fontSize: '0.8rem' }}>
                Profil belum lengkap. Silakan lengkapi di menu Profile.
            </Alert>
        )}
        {!loading && (
            <>
        <div className="grid grid-cols-2 gap-3 mb-6">
           {menuItems.map((item) => (
             <Link href={item.href} key={item.label} className="block group active:scale-95 transition-all duration-300">
               <div className={`
                  h-24 rounded-[24px] flex flex-col justify-center items-center gap-2 border-0 shadow-sm transition-all duration-300
                  ${item.bg} ${item.hover} hover:-translate-y-1 hover:shadow-md
               `}>
                  <span className={`text-3xl filter drop-shadow-sm ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </span>
                  <span className={`font-bold text-sm ${item.color.replace('text-', 'text-opacity-80 text-')} group-hover:text-opacity-100`}>
                    {item.label}
                  </span>
               </div>
             </Link>
           ))}
        </div>

        <div className="mb-4">
            <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Pengumuman
                </h3>
            </div>

            <div className="bg-white rounded-[30px] shadow-xl shadow-gray-100 p-5 min-h-auto relative border border-gray-50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
                        <CircularProgress size={24} color="success" />
                        <span className="text-xs font-medium font-comfortaa">Memuat...</span>
                    </div>
                ) : validAnnouncements.length === 0 ? ( 
                    <div className="flex flex-col items-center justify-center h-auto text-gray-400 gap-2">
                        <span className="text-3xl grayscale opacity-30">📢</span>
                        <span className="text-xs font-comfortaa">Tidak ada pengumuman baru.</span>
                    </div>
                ) : (
                    <div className="space-y-3">

                        {validAnnouncements.map((ann, index) => (
                            <div 
                                key={ann.id} 
                                className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl transition-all hover:shadow-md border border-transparent
                                    ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border-gray-100'}
                                `}
                            >
                                <div className="col-span-5 text-center flex flex-col justify-center">
                                    <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight text-left pl-1" title={ann.title}>
                                        {ann.title}
                                    </p>
                                </div>

                                <div className="col-span-4 text-center flex justify-center items-center">
                                    {priorityColor(ann.priority)} 
                                </div>

                                <div className="col-span-3 text-center">
                                    <button 
                                        onClick={() => router.push(`/dashboardUser/detail/${ann.id}`)}
                                        className="bg-white border border-emerald-200 text-emerald-600 text-[9px] font-bold py-1.5 px-3 rounded-lg hover:bg-emerald-50 active:scale-95 transition shadow-sm"
                                    >
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>)}
      </div>

      <div className={`
          fixed bottom-26 right-5 z-50 w-16 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100
          flex flex-col items-center py-3 gap-3
          transition-all duration-300 origin-bottom
          ${isMenuOpen ? 'scale-90 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
      `}>
          <Link href="/dashboardUser" onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-teal-50 text-teal-600 hover:scale-110 transition-all group relative">
             
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
             </svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">
                Home
             </span>
          </Link>

          <div className="w-8 h-[1px] bg-gray-200 my-0.5"></div>
          {menuItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 group relative ${item.bg}`}>
                  <span className={`text-xl ${item.color}`}>{item.icon}</span>
                  
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">
                    {item.label}
                  </span>
              </Link>
          ))}

          <div className="w-8 h-[1px] bg-gray-200 my-0.5"></div>

          <Link href="/dashboardUser/profile" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-full hover:bg-blue-50 text-blue-600 hover:scale-110 transition-all group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">
                Profile
             </span>
          </Link>
          
          <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-red-50 text-red-600 hover:scale-110 transition-all group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">
                Logout
             </span>
          </button>
      </div>

      <div className="fixed bottom-10 right-6 z-50">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              w-14 h-14 rounded-full bg-[#07ABE8] text-white shadow-[0_0px_20px_rgba(38,166,154,0.4)] 
              flex items-center justify-center border-[3px] border-white 
              transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
              ${isMenuOpen ? 'rotate-90 bg-[#07ABE8]' : 'rotate-0 hover:scale-110'}
            `}
          >
              <div className="flex flex-col gap-1.5 items-center justify-center">
                 <span className={`block w-6 h-1 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-1' : 'w-6'}`}></span>
                 <span className="block w-6 h-1 bg-white rounded-full"></span>
                 <span className={`block w-6 h-1 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-1' : 'w-6'}`}></span>
              </div>
          </button>
      </div>
    
    </div>
    
  );
}