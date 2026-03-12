"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CircularProgress, FormControl, Select, MenuItem
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

type Absensi = {
  id: number;
  employee_id: number;
  date: string;
  time: string;
  status: string;
  total_terlambat: number;
};

function getMonthName(month: number) {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return bulan[month];
}

export default function HistoryAbsenPage() {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [filtered, setFiltered] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulan, setBulan] = useState<number>(new Date().getMonth());
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [listBulan, setListBulan] = useState<number[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/logout", { method: "POST" }); router.push("/"); } 
    catch (error) { console.error(error); }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const resMe = await fetch("/api/me");
        const dataMe = await resMe.json();
        if (!dataMe.employeeId) throw new Error("Gagal mendapatkan data user");

        const resAbsensi = await fetch("/api/absensi");
        const dataAbsensi = await resAbsensi.json();

        const todayStr = new Date().toISOString().slice(0, 10);

        let myAbsen = (dataAbsensi.data || []).filter(
          (a: Absensi) =>
            a.employee_id === dataMe.employeeId &&
            a.date !== todayStr
        );

        myAbsen = myAbsen.sort((a: { date: any; }, b: { date: string; }) => b.date.localeCompare(a.date));

        setAbsensi(myAbsen);

        const uniqueBulanTahun = Array.from(
        new Set(
            myAbsen.map((x: Absensi) => {
            const [y, m] = x.date.split("-");
            return `${y}-${m}`;
            })
        )
        ) as string[];
        const bulanTersedia = uniqueBulanTahun.map(x => Number(x.split("-")[1]) - 1);
        setListBulan(bulanTersedia);
      } catch (e: any) {
        setError(e.message || "Gagal memuat data absensi");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filterByBulan = absensi.filter(a => {
      const [y, m] = a.date.split("-");
      return Number(m) - 1 === bulan && Number(y) === tahun;
    });
    setFiltered(filterByBulan);
  }, [bulan, tahun, absensi]);

  const tahunTersedia = Array.from(new Set(absensi.map(x => Number(x.date.split("-")[0]))));

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
        <div className="bg-gradient-to-br from-[#07ABE8] to-[#0047AD] rounded-[35px] p-6 text-white shadow-[0_15px_35px_-5px_rgba(38,166,154,0.5)] mb-6 relative overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-6 text-white"><CircularProgress color="inherit" /></div>
            ) : (
             <>
               <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl shadow-inner">
                      <span className="text-2xl">📂</span>
                  </div>
                  <div>
                      <h1 className="text-xl font-bold uppercase tracking-wide drop-shadow-sm">Riwayat Absensi</h1>
                      <p className="text-[11px] text-green-50 opacity-90 font-comfortaa" >Riwayat Absen Perbulan</p>
                  </div>
               </div>
               <div className="flex flex-1 gap-4 items-center">
                  <div className="flex-1">
                      <FormControl fullWidth size="small" variant="standard">
                          <Select
                              value={bulan}
                              onChange={e => setBulan(Number(e.target.value))}
                              disableUnderline
                              className="font-bold text-white font-comfortaa"
                              sx={{ 
                                  fontSize: '1rem', 
                                  color: 'white',
                                  fontWeight: 'bold',
                                  '& .MuiSelect-icon': { color: 'white' } 
                              }}
                              MenuProps={{ PaperProps: { style: { fontFamily: "var(--font-comfortaa), sans-serif" } } }}
                          >
                              {[...Array(12)].map((_, i) => (
                                  <MenuItem key={i} value={i} className="text-gray-800 font-comfortaa">
                                      {getMonthName(i)}
                                  </MenuItem>
                              ))}
                          </Select>
                      </FormControl>
                      <p className="text-[10px] text-green-100 font-bold uppercase tracking-wide mt-1 opacity-80 font-comfortaa">Bulan</p>
                  </div>
                  <div className="w-[1px] h-8 bg-white/30"></div>
                  <div className="w-24">
                      <FormControl fullWidth size="small" variant="standard">
                          <Select
                              value={tahun}
                              onChange={e => setTahun(Number(e.target.value))}
                              disableUnderline
                              className="font-bold text-white"
                              sx={{ 
                                  fontSize: '1rem', 
                                  color: 'white',
                                  fontFamily: "var(--font-comfortaa), sans-serif",
                                  fontWeight: 'bold',
                                  '& .MuiSelect-icon': { color: 'white' } 
                              }}
                              MenuProps={{ PaperProps: { style: { fontFamily: "var(--font-comfortaa), sans-serif" } } }}
                          >
                              {tahunTersedia.length > 0 ? tahunTersedia.map(t => (
                                  <MenuItem key={t} value={t} className="text-gray-800 font-comfortaa">
                                      {t}
                                  </MenuItem>
                              )) : <MenuItem value={new Date().getFullYear()} className="text-gray-800 font-comfortaa">
                                      {new Date().getFullYear()}
                                   </MenuItem>
                              }
                          </Select>
                      </FormControl>
                      <p className="text-[10px] text-green-100 font-bold uppercase tracking-wide mt-1 opacity-80 font-comfortaa">Tahun</p>
                  </div>

               </div>
               </>)}
        </div>

        <div className="flex-1 bg-white rounded-[30px] shadow-xl shadow-gray-100 p-6 min-h-[400px] relative border border-gray-50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <CircularProgress size={30} color="success" />
                    <span className="text-xs font-medium">Memuat Data...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                    <span className="text-4xl grayscale opacity-30">📅</span>
                    <span className="text-sm">Tidak ada data absensi.</span>
                </div>
            ) : (
                <div className="space-y-0">
                    <div className="grid grid-cols-12 gap-2 mb-4 px-1">
                        <div className="col-span-4 bg-gray-900 text-white py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Tanggal
                        </div>
                        <div className="col-span-5 bg-gray-900 text-white py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Waktu / Status
                        </div>
                        <div className="col-span-3 bg-gray-900 text-white py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-sm">
                           Ket
                        </div>
                    </div>

                    {filtered.map((absen, index) => (
                        <div 
                            key={absen.id} 
                            className={`grid grid-cols-12 gap-2 items-center p-4 rounded-xl mb-2 transition-all hover:shadow-md
                                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-100'}
                            `}
                        >
                            <div className="col-span-4 text-center">
                                <p className="text-xs font-bold text-gray-700">{absen.date}</p>
                            </div>
                            <div className="col-span-5 text-center">
                                <p className="text-xs text-gray-500 font-medium mb-1">{absen.time}</p>
                                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold 
                                    ${absen.status === 'Terlambat' ? 'bg-red-100 text-red-600' : 
                                      absen.status === 'Izin' ? 'bg-orange-100 text-orange-600' : 
                                      'bg-emerald-100 text-emerald-600'}
                                `}>
                                    {absen.status}
                                </div>
                            </div>

                            <div className="col-span-3 text-right flex justify-center">
                                {absen.total_terlambat > 0 ? (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg whitespace-nowrap">
                                        +{absen.total_terlambat}m
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg whitespace-nowrap border border-emerald-100">
                                        On Time
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

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