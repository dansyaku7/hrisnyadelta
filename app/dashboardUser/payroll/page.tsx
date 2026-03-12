"use client";
import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
} from "@mui/material";
import SlipGaji from "@/app/components/SlipGaji";
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

type Department = {
  id: number;
  name: string;
  description?: string;
};

export default function PayrollPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mounted, setMounted] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/logout", { method: "POST" }); router.push("/"); } 
    catch (error) { console.error(error); }
  };

  useEffect(() => {
    setMounted(true);
    
    async function fetchAllData() {
      setLoadingPage(true);
      setLoading(true);
      try {
        const [resUser, resPayroll, resDepart] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/payroll"),
          fetch("/api/department")
        ]);

        const userData = await resUser.json();
        const payrollData = await resPayroll.json();
        const departmentData = await resDepart.json();

        setEmployeeId(userData.employeeId || "");
        setData(payrollData.data || []);
        
        const deptList = Array.isArray(departmentData) ? departmentData : (departmentData.data || []);
        setDepartments(deptList);

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal mengambil data.");
        setLoading(false);
      } finally {
        setLoadingPage(false);
      }
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    if (showPrint) {
      const timer = setTimeout(() => {
        window.print();
        setShowPrint(false);
        setPrintData(null);
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [showPrint]);

  const getDepartmentName = (deptId: number) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : "-";
  };

  const publishedPayroll = data.filter(
    (row) => row.status === "published" && String(row.employee_id) === String(employeeId)
  );

  const totalPages = Math.ceil(publishedPayroll.length / rowsPerPage) || 1;
  const pagedData = publishedPayroll.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (direction: "prev" | "next") => {
    if (direction === "prev" && page > 0) setPage(page - 1);
    if (direction === "next" && page < totalPages - 1) setPage(page + 1);
  };

  const handleRowsPerPageChange = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function formatRupiah(nom: any) {
    return Number(nom || 0).toLocaleString("id-ID");
  }
  function getTanggalSekarang() {
    const now = new Date();
    const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni","Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;
  }
  function formatTanggalIndo(tgl: string): string {
    if (!tgl) return "-";
    const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni","Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const date = new Date(tgl);
    if (isNaN(date.getTime())) return tgl;
    return `${date.getDate()} ${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;
  }

  async function prepareSlipData(payrollId: number) {
    const resPayroll = await fetch(`/api/payroll/${payrollId}`);
    if (!resPayroll.ok) {
      alert("Gagal mengambil data payroll!");
      return null;
    }
    const response = await resPayroll.json();
    const row = response.data;

    const dibuatOleh = row.nama_pembuat || "Admin HR";

    const totalPenerimaan = [
      row.gaji_pokok, row.total_uang_makan, row.tunjangan_jabatan,
      row.tunjangan_lembur, row.tunjangan_lain, row.thr_bonus,
    ].map(Number).filter(Boolean).reduce((a, b) => a + b, 0);

    const totalPotongan = [
      row.potongan_pajak, row.potongan_bpjs, row.potongan_kasbon,
    ].map(Number).filter(Boolean).reduce((a, b) => a + b, 0);

    const takeHomePay = totalPenerimaan - totalPotongan;
    let periodeString = `${formatTanggalIndo(row.periode_mulai)} s/d ${formatTanggalIndo(row.periode_akhir)}`;
    
    const deptName = row.department_name || getDepartmentName(row.department_id);

    return {
      ...row,
      gajiPokok: formatRupiah(row.gaji_pokok),
      totalUangMakan: formatRupiah(row.total_uang_makan),
      tunjanganJabatan: formatRupiah(row.tunjangan_jabatan),
      tunjanganLembur: formatRupiah(row.tunjangan_lembur),
      tunjanganLain: formatRupiah(row.tunjangan_lain),
      thr: formatRupiah(row.thr_bonus),
      pajak: formatRupiah(row.potongan_pajak),
      bpjs: formatRupiah(row.potongan_bpjs),
      kasbon: formatRupiah(row.potongan_kasbon),
      totalPenerimaan: formatRupiah(totalPenerimaan),
      totalPotongan: formatRupiah(totalPotongan),
      takeHomePay: formatRupiah(takeHomePay),
      dibuatOleh,
      tanggal: getTanggalSekarang(),
      diterimaOleh: row.employee_name,
      periode: periodeString,
      department: deptName, 
      NIK: row.NIK || "-",
    };
  }

  async function handleDownload(payrollId: number) {
    const dataSlip = await prepareSlipData(payrollId);
    if (dataSlip) {
      setPrintData(dataSlip);
      setShowPrint(true);
    }
  }

  async function handlePreview(payrollId: number) {
    const dataSlip = await prepareSlipData(payrollId);
    if (dataSlip) {
      setPreviewData(dataSlip);
    }
  }

  if (!mounted) return null;

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
            <div className="absolute -right-5 -top-5 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col gap-4">
               
                <div className="flex items-center gap-3 border-b border-white/20 pb-3">
                    <div className="bg-white/20 p-2 rounded-xl shadow-inner">
                       <span className="text-2xl">💸</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wide drop-shadow-sm">Riwayat Payroll</h1>
                        <p className="text-[11px] text-green-50 opacity-90 font-comfortaa">Daftar Slip Gaji & Pendapatan</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-start gap-3 border border-white/20">
                    <span className="text-lg">💡</span>
                    <p className="text-xs font-medium leading-relaxed opacity-90 font-comfortaa">
                        <strong className="block mb-0.5 text-white">Tips:</strong>
                        Gunakan desktop/laptop untuk mengunduh slip gaji agar format PDF lebih rapi.
                    </p>
                </div>
            </div>
            </>)}
        </div>

        <div className="flex-1 bg-white rounded-[30px] shadow-xl shadow-gray-100 p-6 min-h-[400px] relative border border-gray-50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <CircularProgress size={30} color="success" />
                    <span className="text-xs font-medium font-comfortaa">Memuat Data Payroll...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : pagedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                    <span className="text-4xl grayscale opacity-30">🧾</span>
                    <span className="text-sm font-comfortaa">Belum ada data payroll.</span>
                </div>
            ) : (
                <div className="space-y-0">
                    <div className="grid grid-cols-12 gap-2 mb-4 px-1">
                        <div className="col-span-5 bg-gray-900 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center shadow-sm">
                           Periode
                        </div>
                        <div className="col-span-3 bg-gray-900 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center shadow-sm">
                           Dept
                        </div>
                        <div className="col-span-4 bg-gray-900 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center shadow-sm">
                           Aksi
                        </div>
                    </div>

                    {pagedData.map((row, index) => (
                        <div 
                            key={row.id} 
                            className={`grid grid-cols-12 gap-2 items-center p-4 rounded-xl mb-3 transition-all hover:shadow-md border border-transparent
                                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border-gray-100'}
                            `}
                        >
                            <div className="col-span-5 text-center flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-gray-500 mb-1">Mulai</p>
                                <p className="text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm inline-block border border-gray-100">{row.tanggal_mulai}</p>
                                
                                <p className="text-[10px] font-bold text-gray-500 mb-1 mt-4">Selesai</p>
                                <p className="text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm inline-block border border-gray-100">{row.tanggal_akhir}</p>
                            </div>

                            <div className="col-span-3 text-center">
                                <span className="inline-block bg-violet-100 text-violet-700 text-[12px] font-bold px-2 py-1 rounded-lg truncate max-w-full">
                                   {row.department_name || getDepartmentName(row.department_id)}
                                </span>
                            </div>

                            <div className="col-span-4 text-center flex flex-col gap-2">
                                <button 
                                  onClick={() => handlePreview(row.id)}
                                  className="bg-white border border-blue-200 text-blue-600 text-[12px] font-bold py-2 rounded-lg hover:bg-blue-50 active:scale-95 transition flex items-center justify-center gap-1"
                                >Lihat
                                </button>
                                <button 
                                  onClick={() => handleDownload(row.id)}
                                  className="bg-red-700 text-white text-[12px] font-bold py-2 rounded-lg shadow-sm hover:bg-red-600 active:scale-95 transition flex items-center justify-center gap-1"
                                >Unduh
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && publishedPayroll.length > 0 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => handleChangePage("prev")}
                        disabled={page === 0}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Halaman {page + 1} / {totalPages}</span>
                        <div className="h-4 w-[1px] bg-gray-300"></div>
                        <select 
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="bg-gray-50 text-xs font-bold text-gray-600 border border-gray-200 rounded px-1 py-1 outline-none focus:border-blue-500"
                        >
                            <option value={5}>5 baris</option>
                            <option value={10}>10 baris</option>
                            <option value={25}>25 baris</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => handleChangePage("next")}
                        disabled={page >= totalPages - 1}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                </div>
            )}

        </div>
      </div>

      {previewData && (
         <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200 overflow-hidden">
             <div className="bg-white w-full max-w-3xl rounded-[25px] shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800">Preview Slip Gaji</h3>
                    <button onClick={() => setPreviewData(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500">
                        ✕
                    </button>
                </div>
                <div className="p-4 overflow-y-auto bg-gray-50 flex-1">
                    <SlipGaji {...previewData} />
                </div>
                <div className="p-4 border-t border-gray-100 bg-white rounded-b-[25px] flex justify-end">
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => setPreviewData(null)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Tutup Preview
                    </Button>
                </div>
             </div>
         </div>
      )}

      {showPrint && printData && (
        <div className="print-area">
          <SlipGaji {...printData} />
          <style jsx global>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-area, .print-area * {
                visibility: visible !important;
                color: #000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-area {
                position: absolute;
                left: 0; top: 0;
                width: 100vw;
                background: #fff;
                z-index: 9999;
              }
            }
            .print-area { display: none; }
            @media print {
              .print-area { display: block !important; }
            }
          `}</style>
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