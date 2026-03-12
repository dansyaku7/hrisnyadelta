"use client";
import { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  TextField
} from "@mui/material";
import { useRouter } from "next/navigation";
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

type KasbonRow = {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  tanggal_pengajuan: string;
  jumlah_pinjaman: number;
  sisa_pinjaman: number;
  status: string;
};

type Department = {
  _id: string;
  name: string;
};

export default function KasbonPage() {
  const [data, setData] = useState<KasbonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [jumlahPinjaman, setJumlahPinjaman] = useState("");
  const [alasan, setAlasan] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const handleLogout = async () => {
    try { await fetch("/api/logout", { method: "POST" }); router.push("/"); } 
    catch (error) { console.error(error); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/kasbon");
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Gagal fetch kasbon");
        setData(json.data || []);

        const resDept = await fetch("/api/department");
        const jsonDept = await resDept.json();
        setDepartments(jsonDept.data || []);
    } catch (err) {
        setError("Gagal mengambil data kasbon");
    } finally {
        setLoading(false);
        setLoadingPage(false);
    }
  };

  useEffect(() => {
    setLoadingPage(true);
    fetch("/api/me")
      .then(res => res.json())
      .then(setUser);
    
    fetchData();
  }, []);

  const getDepartmentName = (id: string) => {
    return departments.find(dept => dept._id === id)?.name || '-';
  };

  function badgeStatus(stat: string) {
    const s = stat.toLowerCase();
    if (s === "pending") return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-200">Pending</span>;
    if (s === "approve" || s === "approved") return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">Disetujui</span>;
    if (s === "rejected" || s === "reject") return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">Ditolak</span>;
    return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200">{stat}</span>;
  }

  const kasbonUser = user?.employeeId
    ? data.filter(k => k.employee_id === user.employeeId)
    : [];

  const sortedKasbon = [...kasbonUser].sort((a, b) => {
    const getRank = (status: string) => {
      const s = status?.toLowerCase();
      if (s === "pending") return 1;
      if (s === "approved" || s === "approve") return 2;
      return 3;
    };
    return getRank(a.status) - getRank(b.status);
  });

  const kasbonAktif = sortedKasbon.find(
    k =>
      (k.status.toLowerCase() === "pending" ||
        k.status.toLowerCase() === "cicil" ||
        k.status.toLowerCase() === "approved" ||
        k.status.toLowerCase() === "approve") &&
      Number(k.sisa_pinjaman) > 0
  );

  async function handleAjukanKasbon() {
    setErrorForm("");
    if (!jumlahPinjaman || !alasan) {
      setErrorForm("Nominal pinjaman dan alasan wajib diisi!");
      return;
    }
    if (!user) {
      setErrorForm("Gagal mengambil data user.");
      return;
    }
    setLoadingForm(true);

    try {
      const res = await fetch("/api/kasbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.employeeId,
          departmentId: user.departmentId,
          tanggalPengajuan: new Date().toISOString().slice(0, 10),
          jumlahPinjaman: Number(jumlahPinjaman),
          alasan,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengajukan kasbon");
      
      setShowModal(false);
      setJumlahPinjaman(""); setAlasan("");
      fetchData(); 

    } catch {
      setErrorForm("Gagal mengirim pengajuan kasbon");
    } finally {
      setLoadingForm(false);
    }
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
                    <span className="text-2xl">💰</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-wide drop-shadow-sm">Kasbon</h1>
                    <p className="text-[11px] text-green-50 opacity-90 font-comfortaa" >Pinjaman Karyawan</p>
                </div>
                
                {!kasbonAktif && (
                    <button 
                        //onClick={() => setShowModal(true)}
                        className="relative z-20 bg-white text-[#0047AD] px-4 py-2 rounded-xl ml-auto font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 hover:bg-gray-100"
                    >
                        <span className="text-lg font-black leading-none">+</span> 
                        <span>Ajukan</span>
                    </button>
                )}
            </div>
            
            <div className="flex justify-between items-center text-xs font-medium opacity-90">
                {kasbonAktif && (
                    <span className="bg-white/20 px-3 py-0.5 rounded-full text-white font-bold shadow-sm border border-white/10 font-comfortaa" >
                        Sedang Berjalan
                    </span>
                )}
            </div>
            </>)}
        </div>

        <div className="flex-1 bg-white rounded-[30px] shadow-xl shadow-gray-100 p-6 min-h-[400px] relative border border-gray-50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <CircularProgress size={30} color="success" />
                    <span className="text-xs font-medium font-comfortaa" >Memuat Data...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : sortedKasbon.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                    <span className="text-4xl grayscale opacity-30">💸</span>
                    <span className="text-sm font-comfortaa" >Belum ada riwayat kasbon.</span>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                        <div className="col-span-4 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Tanggal
                        </div>
                        <div className="col-span-5 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Nominal & Sisa
                        </div>
                        <div className="col-span-3 bg-gray-900 text-white py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Status
                        </div>
                    </div>

                    {sortedKasbon.map((row, index) => (
                        <div 
                            key={row.id} 
                            className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl transition-all hover:shadow-md border border-transparent
                                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border-gray-100'}
                            `}
                        >
                            <div className="col-span-4 text-center">
                                <p className="text-xs font-bold text-gray-800">{row.tanggal_pengajuan}</p>
                            </div>
                            <div className="col-span-5 text-center flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Pinjaman</p>
                                <p className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    Rp {Number(row.jumlah_pinjaman).toLocaleString("id-ID")}
                                </p>
                                <p className="text-[10px] font-bold text-gray-500 mt-2">Sisa</p>
                                <p className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                    Rp {Number(row.sisa_pinjaman).toLocaleString("id-ID")}
                                </p>
                            </div>

                            <div className="col-span-3 text-center flex justify-center items-center">
                                {badgeStatus(row.status)}
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
                        <span className="text-3xl">💰</span>
                    </div>
                    <h2 className="text-xl font-bold text-white z-10 tracking-wide drop-shadow-sm">Form Kasbon</h2>
                    <p className="text-xs text-green-100 z-10 font-medium mt-1">Isi data dengan benar</p>
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/40 text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Nominal Pinjaman (Rp)</label>
                        <div className="flex items-center bg-gray-50 rounded-2xl px-3 py-3 border border-gray-200 focus-within:border-green-500 transition-all">
                            <span className="text-gray-400 mr-2 font-bold">Rp</span>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={jumlahPinjaman} 
                                onChange={(e) => setJumlahPinjaman(e.target.value)} 
                                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Alasan Pinjaman</label>
                        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-green-500 transition-all">
                            <textarea rows={3} placeholder="Contoh: Biaya pengobatan..." value={alasan} onChange={(e) => setAlasan(e.target.value)} className="bg-transparent w-full outline-none text-sm text-gray-700 placeholder-gray-400 resize-none" />
                        </div>
                    </div>

                    {errorForm && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                            <span>⚠️</span> {errorForm}
                        </div>
                    )}

                    <button onClick={handleAjukanKasbon} disabled={loadingForm} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95 transition-all flex justify-center items-center gap-2 mt-2">
                        {loadingForm ? <CircularProgress size={20} color="inherit" /> : (
                            <><span>📩</span> Kirim Pengajuan</>
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