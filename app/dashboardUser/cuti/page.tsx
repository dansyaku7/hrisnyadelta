"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CircularProgress, TextField, MenuItem 
} from "@mui/material";

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

type Cuti = {
  id: number;
  employee_id: number;
  tgl_mulai: string;
  tgl_selesai: string;
  status: string;
  alasan?: string;
};

export default function CutiPage() {
  const [data, setData] = useState<Cuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [sisaCuti, setSisaCuti] = useState<number | null>(null);
  const [loadingCuti, setLoadingCuti] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [jenis, setJenis] = useState("Cuti Liburan");
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/logout", { method: "POST" }); router.push("/"); } 
    catch (error) { console.error(error); }
  };

  const fetchAllData = async () => {
    try {
        const userRes = await fetch("/api/me");
        const userData = await userRes.json();
        
        setEmployeeId(userData.employeeId);
        setDepartmentId(userData.departmentId);
        setUserName(userData.name);

        const cutiRes = await fetch("/api/cuti");
        const cutiData = await cutiRes.json();
        setData(cutiData.data || []);
        
        if (userData.employeeId) {
            setLoadingCuti(true);
            const jatahRes = await fetch("/api/jatah-cuti");
            const jatahData = await jatahRes.json();
            const cutiUser = (jatahData?.data || []).find((c: any) => c.employee_id === userData.employeeId);
            setSisaCuti(cutiUser?.sisa_cuti ?? 0);
            setLoadingCuti(false);
        }

    } catch (err) {
        setError("Gagal mengambil data cuti");
        setLoadingCuti(false);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const myCuti = data
    .filter((c) => c.employee_id === employeeId)
    .sort((a, b) => {
      if (a.status.toLowerCase() === "pending" && b.status.toLowerCase() !== "pending") return -1;
      if (a.status.toLowerCase() !== "pending" && b.status.toLowerCase() === "pending") return 1;
      return 0;
    });

  async function handleAjukanCuti() {
    setErrorForm("");
    if (!tglMulai || !tglSelesai || !alasan || !jenis) {
      setErrorForm("Semua field wajib diisi!");
      return;
    }
    setLoadingForm(true);

    try {
      const res = await fetch("/api/cuti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId,
          departmentId: departmentId,
          name: userName,
          tglMulai,
          tglSelesai,
          jenis,
          alasan,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengajukan cuti");
      
      setShowModal(false);
      setTglMulai(""); setTglSelesai(""); setAlasan(""); setJenis("Cuti Liburan");
      fetchAllData(); 

    } catch {
      setErrorForm("Gagal mengirim pengajuan cuti");
    } finally {
      setLoadingForm(false);
    }
  }

  function renderStatus(status: string) {
    const s = status.toLowerCase();
    if (s === "approve" || s === "approved") {
      return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">Disetujui</span>;
    }
    if (s === "pending") {
      return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-200">Menunggu</span>;
    }
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">Ditolak</span>;
  }

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden font-sans pb-24">
      
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

      <div className="relative z-10 px-6 pt-8 max-w-lg mx-auto min-h-screen flex flex-col">
        <div className="bg-gradient-to-br from-[#07ABE8] to-[#0047AD] rounded-[25px] p-6 shadow-lg shadow-green-200/50 mb-6 relative overflow-hidden text-white">
          {loading ? (
          <div className="flex justify-center py-6 text-white"><CircularProgress color="inherit" /></div>
          ) : (
            <>
            <div className="absolute -right-5 -top-5 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-3 border-b border-white/20 pb-3 mb-3">
                <div className="bg-white/20 p-2 rounded-xl shadow-inner">
                    <span className="text-2xl">📅</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-wide drop-shadow-sm">Cuti</h1>
                    <p className="text-[11px] text-green-50 opacity-90 font-comfortaa">Kelola Pengajuan Cuti</p>
                </div>
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="relative z-20 bg-white text-[#0047AD] px-4 py-2 rounded-xl ml-auto font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 hover:bg-gray-200"
                >
                    <span className="text-lg font-black leading-none">+</span> 
                    <span>Ajukan</span>
                </button>
            </div>
            
            <div className="flex justify-between items-center text-xs font-medium opacity-90 font-comfortaa">

                <span className="bg-white/20 px-3 py-0.5 rounded-full text-white font-bold shadow-sm border border-white/10">
                    {loadingCuti ? "..." : `Sisa Jatah Cuti: ${sisaCuti ?? "-"} Hari`}
                </span>
            </div>
            </>)}
        </div>

        <div className="flex-1 bg-white rounded-[30px] shadow-xl shadow-gray-100 p-6 min-h-[400px] relative border border-gray-50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <CircularProgress size={30} color="success" />
                    <span className="text-xs font-medium font-comfortaa">Memuat Data...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : myCuti.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                    <span className="text-4xl grayscale opacity-30">📅</span>
                    <span className="text-sm font-comfortaa">Belum ada riwayat cuti.</span>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                        <div className="col-span-5 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Tanggal
                        </div>
                        <div className="col-span-3 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Status
                        </div>
                        <div className="col-span-4 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Alasan
                        </div>
                    </div>

                    {myCuti.map((c, index) => (
                        <div 
                            key={c.id} 
                            className={`grid grid-cols-12 gap-5 items-center p-3 rounded-xl transition-all hover:shadow-md border border-transparent
                                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border-gray-100'}
                            `}
                        >
                            <div className="col-span-5 text-center flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Mulai</p>
                                <p className="text-xs font-bold text-gray-800 bg-white px-1 py-1 rounded shadow-sm inline-block border border-gray-100">{c.tgl_mulai}</p>
                                
                                <p className="text-[10px] font-bold text-gray-500 mb-1 mt-4">Selesai</p>
                                <p className="text-xs font-bold text-gray-800 bg-white px-1 py-1 rounded shadow-sm inline-block border border-gray-100">{c.tgl_selesai}</p>
                            </div>
                            <div className="col-span-3 text-center flex justify-center items-center">
                                {renderStatus(c.status)}
                            </div>

                            <div className="col-span-4 text-center">
                                <p className="text-[11px] text-gray-500 line-clamp-3 leading-tight italic" title={c.alasan}>
                                    "{c.alasan || "-"}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[30px] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                
                <div className="bg-gradient-to-r from-[#66BB6A] to-[#26A69A] h-32 relative flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="z-10 bg-white p-3 rounded-full shadow-lg mb-2">
                        <span className="text-3xl">🏝️</span>
                    </div>
                    <h2 className="text-xl font-bold text-white z-10 tracking-wide drop-shadow-sm">Form Cuti</h2>
                    <p className="text-xs text-green-100 z-10 font-medium mt-1 bg-white/20 px-3 py-0.5 rounded-full">
                        Sisa Cuti: {sisaCuti ?? "-"} Hari
                    </p>
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/40 text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Jenis Cuti</label>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={jenis}
                            onChange={(e) => setJenis(e.target.value)}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#f9fafb' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' }
                            }}
                        >
                            <MenuItem value="Cuti Liburan">Cuti Liburan</MenuItem>
                            <MenuItem value="Cuti Sakit">Cuti Sakit</MenuItem>
                            <MenuItem value="Cuti Khusus">Cuti Khusus</MenuItem>
                        </TextField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1">Mulai</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl px-3 py-3 border border-gray-200 focus-within:border-green-500 transition-all">
                                <input type="date" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1">Selesai</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl px-3 py-3 border border-gray-200 focus-within:border-green-500 transition-all">
                                <input type="date" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Alasan</label>
                        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-green-500 transition-all">
                            <textarea rows={3} placeholder="Contoh: Acara keluarga..." value={alasan} onChange={(e) => setAlasan(e.target.value)} className="bg-transparent w-full outline-none text-sm text-gray-700 placeholder-gray-400 resize-none" />
                        </div>
                    </div>

                    {errorForm && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                            <span>⚠️</span> {errorForm}
                        </div>
                    )}

                    <button onClick={handleAjukanCuti} disabled={loadingForm} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95 transition-all flex justify-center items-center gap-2 mt-2">
                        {loadingForm ? <CircularProgress size={20} color="inherit" /> : (
                            <><span>✉️</span> Kirim Pengajuan</>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className={`fixed bottom-26 right-5 z-50 w-16 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col items-center py-3 gap-3 transition-all duration-300 origin-bottom ${isMenuOpen ? 'scale-90 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}`}>
          <Link href="/dashboardUser" onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-teal-50 text-teal-600 hover:scale-110 transition-all group relative">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">Home</span>
          </Link>
          <div className="w-8 h-[1px] bg-gray-200 my-0.5"></div>
          {menuItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 group relative ${item.bg}`}>
                  <span className={`text-xl ${item.color}`}>{item.icon}</span>
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">{item.label}</span>
              </Link>
          ))}
          <div className="w-8 h-[1px] bg-gray-200 my-0.5"></div>
          <Link href="/dashboardUser/profile" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-full hover:bg-blue-50 text-blue-600 hover:scale-110 transition-all group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">Profile</span>
          </Link>
          <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-red-50 text-red-600 hover:scale-110 transition-all group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-bold">Logout</span>
          </button>
      </div>
      <div className="fixed bottom-10 right-6 z-50">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-14 h-14 rounded-full bg-[#07ABE8] text-white shadow-[0_0px_20px_rgba(38,166,154,0.4)] flex items-center justify-center border-[3px] border-white transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isMenuOpen ? 'rotate-90 bg-[#07ABE8]' : 'rotate-0 hover:scale-110'}`}>
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