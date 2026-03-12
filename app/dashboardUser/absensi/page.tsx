"use client";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type MeData = {
  name: string;
  shiftId: string | number;
  lokasiKantorId: string | number;
  employeeId: string | number;
  departmentId: string | number;
};
type Shift = {
  id: string | number;
  name: string;
  start_time: string;
  end_time: string;
};
type LokasiKantor = {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

export default function AbsensiMenu() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [lokasi, setLokasi] = useState<LokasiKantor | null>(null);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [absenType, setAbsenType] = useState<"Hadir" | "WFH" | "Izin" | "Terlambat" | null>(null);
  const webcamRef = useRef<any>(null);
  const [absenHariIni, setAbsenHariIni] = useState<any>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
    } catch (error) {
        console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/me")
      .then(res => res.json())
      .then(async (user: MeData) => {
        setMe(user);
        if (!user?.shiftId || !user?.lokasiKantorId) {
          setLoading(false);
          return;
        }
        const shiftRes = await fetch(`/api/shift/${user.shiftId}`);
        const shiftJson = await shiftRes.json();
        setShift(shiftJson.data);

        const lokasiRes = await fetch(`/api/lokasi/${user.lokasiKantorId}`);
        const lokasiJson = await lokasiRes.json();
        setLokasi(lokasiJson.data);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    const today = new Date();
    const todayStr = today.getFullYear() + "-" +
                  String(today.getMonth() + 1).padStart(2, "0") + "-" +
                  String(today.getDate()).padStart(2, "0");
    fetch(`/api/absensi?employeeId=${me.employeeId}&date=${todayStr}`)
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          setAbsenHariIni(json.data[0]);
        } else {
          setAbsenHariIni(null);
        }
      });
  }, [me]);

  async function resizeBase64(base64: string, maxSize = 200, quality: number ): Promise<string> {
    return new Promise(resolve => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      };
      img.src = base64;
    });
  }

  async function handleAbsenClick(type: "Hadir" | "WFH" | "Izin") {
    setError("");
    setSuccess("");
    setAbsenType(type);

    if (!navigator.geolocation) {
      setError("Browser tidak support GPS.");
      return;
    }
    setLoadingLokasi(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setLoadingLokasi(false);
        if (type === "Hadir") {
          if (!lokasi) {
            setError("Data lokasi kantor tidak ditemukan.");
            return;
          }
          const toRad = (deg: number) => (deg * Math.PI) / 180;
          const earthRadius = 6371e3;
          const dLat = toRad(latitude - lokasi.latitude);
          const dLon = toRad(longitude - lokasi.longitude);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lokasi.latitude)) *
              Math.cos(toRad(latitude)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = earthRadius * c;
          if (distance > lokasi.radius) {
            setError(
              `Kamu berada di luar radius lokasi (${distance.toFixed(1)} m > ${lokasi.radius} m)`
            );
            return;
          }
        }
        setShowCamera(true);
      },
      (err) => {
        setLoadingLokasi(false);
        setError("Gagal ambil lokasi. Mohon absen menggunakan Mobile / HP dan izinkan GPS");
      }
    );
  }

  const handleCapture = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();

    setSuccess("Memproses foto...");
    let fotoBase64 = imageSrc;

    const now = new Date();
    const jamAbsen = now.toTimeString().slice(0, 5);
    const tglAbsen = now.getFullYear() + "-" +
                  String(now.getMonth() + 1).padStart(2, "0") + "-" +
                  String(now.getDate()).padStart(2, "0");

    let status = absenType || "Hadir";
    let totalTerlambat = 0;

    if ((absenType === "Hadir" || absenType === "WFH") && shift) {
      const [jamMasukH, jamMasukM] = shift.start_time.split(":").map(Number);
      const [absenH, absenM] = jamAbsen.split(":").map(Number);
      const waktuShift = jamMasukH * 60 + jamMasukM;
      const waktuAbsen = absenH * 60 + absenM;

      if (waktuAbsen > waktuShift) {
        totalTerlambat = waktuAbsen - waktuShift;
        if (absenType === "Hadir" ) {
          status = "Terlambat";
        }
      } else {
        totalTerlambat = 0;
        status = absenType;
      }
    }

    if (absenType === "Izin") {
      fotoBase64 = await resizeBase64(imageSrc, 800, 0.95);
      totalTerlambat = 0;
    } else {
      fotoBase64 = await resizeBase64(imageSrc, 200, 0.5);
    }

    setSuccess("Mengirim absensi...");
    const absenPayload = {
      name: me?.name,
      shiftId: me?.shiftId,
      employeeId: me?.employeeId,
      departmentId: me?.departmentId,
      lokasiKantorId: me?.lokasiKantorId,
      date: tglAbsen,
      time: jamAbsen,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      status,
      totalTerlambat,
      foto: fotoBase64,
    };
    const res = await fetch("/api/absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(absenPayload),
    });
    if (res.ok) {
      setSuccess(`Absen berhasil! Status: ${status}`);
      setShowCamera(false);
      setIsSubmitting(false);
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      setError("Gagal simpan absensi.");
      setShowCamera(false);
      setIsSubmitting(false);
    }
  };

  async function handleCheckout() {
    if (!me || !absenHariIni || !absenHariIni.id || !shift) return;
    setIsCheckoutLoading(true);
    setCheckoutError("");

    const now = new Date();
    const jamSekarang = now.toTimeString().slice(0, 5);
    const jamStringToMenit = (jam:any) => {
      const [h, m] = jam.split(":").map(Number);
      return h * 60 + m;
    };
    const sudahLewatShift = jamStringToMenit(jamSekarang) >= jamStringToMenit(shift.end_time);

    try {
      const payload:any = {
        checkOutTime: jamSekarang
      };
      if (!sudahLewatShift) {
        payload.status = "Izin";
      }
      const res = await fetch(`/api/absensi/${absenHariIni.id}`, {  
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setIsCheckoutLoading(false);
        setSuccess(
          !sudahLewatShift
            ? "Status absensi hari ini diubah menjadi Izin."
            : "Check-out berhasil."
        );
        setTimeout(() => window.location.reload(), 800);
      } else {
        setIsCheckoutLoading(false);
        setCheckoutError(data?.error || "Gagal update status absensi.");
      }
    } catch {
      setIsCheckoutLoading(false);
      setCheckoutError("Gagal update status absensi.");
    }
  }

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
        <div className="bg-gradient-to-br from-[#07ABE8] to-[#0047AD] rounded-[35px] p-6 text-white shadow-[0_15px_35px_-5px_rgba(38,166,154,0.5)] mb-6 relative overflow-hidden">
           {loading ? (
             <div className="flex justify-center py-6 text-white"><CircularProgress color="inherit" /></div>
           ) : (
             <>
                <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl shadow-inner">
                      <span className="text-2xl">📍</span>
                  </div>
                  <div>
                      <h1 className="text-xl font-bold uppercase tracking-wide drop-shadow-sm">Absensi</h1>
                      <p className="text-[11px] text-green-50 opacity-90 font-comfortaa">Portal Absensi dan Kehadiran</p>
                  </div>
               </div>
                <div className="relative z-10">
                   
                   <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-sm border border-white/10">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                             <p className="text-xs text-green-50 font-medium mb-0.5 opacity-90">Waktu Shift</p>
                             <p className="text-white font-bold text-lg tracking-wide">
                                {shift ? `${shift.start_time} - ${shift.end_time}` : "-"}
                             </p>
                             <p className="text-[10px] text-white/80">{shift?.name}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-sm border border-white/10">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                          </div>
                          <div>
                             <p className="text-xs text-green-50 font-medium mb-0.5 opacity-90">Lokasi</p>
                             <p className="text-white font-bold text-base">
                                {lokasi ? lokasi.name : "-"}
                             </p>
                          </div>
                       </div>
                   </div>
                </div>
             </>
           )}
        </div>

        <div className="mb-6">
            {loadingLokasi && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-blue-100 animate-pulse">
                    <CircularProgress size={20} color="inherit" />
                    <span className="text-sm font-bold">Mencari Lokasi GPS...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl shadow-sm flex items-start gap-3">
                   <span className="text-xl">⚠️</span>
                   <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl shadow-sm flex items-start gap-3">
                   <span className="text-xl">✅</span>
                   <span className="text-sm font-medium">{success}</span>
                </div>
            )}
        </div>

        {!loading && (
            <>
               {absenHariIni && absenHariIni.status !== "Izin" ? (
                   <div className="bg-white p-6 rounded-[30px] shadow-lg border border-gray-100 text-center relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce">
                           <span className="text-4xl">🎉</span>
                       </div>
                       <h3 className="text-gray-800 font-bold text-xl mb-1">Halo, {me?.name}</h3>
                       <p className="text-gray-500 text-sm mb-5">Kamu sudah absen hari ini.</p>
                       
                       <div className={`inline-flex px-6 py-2.5 rounded-full text-sm font-bold shadow-sm items-center gap-2 
                          ${absenHariIni.status === 'Terlambat' ? 'bg-red-100 text-red-700 mb-4' : 'bg-emerald-100 text-emerald-700 mb-4'}
                        `}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            {absenHariIni.status} 
                            {absenHariIni.status === "WFH" && absenHariIni.total_terlambat > 0 && " (Terlambat)"}
                        </div>

                        {absenHariIni.status === 'Terlambat' && (
                            <p className="text-red-500 font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-2" >
                                Yuk lebih rajin lagi kedepannya.
                            </p>
                        )}
                        {absenHariIni.status === "Hadir" && (
                          <p className="text-green-700 font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-2">
                            Pertahankan kedisiplinanmu, tetap semangat bekerja! 🚀
                          </p>
                        )}

                       {absenHariIni.check_out_time == null && (
                          <div>
                              <button 
                                 onClick={async () => {
                                    setCheckoutError("");
                                    if (!shift) return;
                                    const now = new Date();
                                    const jamSekarang = now.toTimeString().slice(0,5);
                                    const jamStringToMenit = (jam: string) => {
                                      const [h, m] = jam.split(":").map(Number);
                                      return h * 60 + m;
                                    };
                                    if (jamStringToMenit(jamSekarang) < jamStringToMenit(shift.end_time)) {
                                      setShowCheckoutConfirm(true); 
                                      return;
                                    }
                                    await handleCheckout(); 
                                  }}
                                 disabled={isCheckoutLoading}
                                 className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                              >
                                 {isCheckoutLoading ? <CircularProgress size={20} color="inherit"/> : (
                                     <>
                                        <span>👋</span> Check-Out Pulang
                                     </>
                                 )}
                              </button>
                              {checkoutError && <p className="text-red-500 text-xs mt-2 font-medium">{checkoutError}</p>}
                          </div>
                       )}
                   </div>
               ) : (
                   !absenHariIni && !loadingLokasi && (
                     <div className="grid grid-cols-1 gap-5">
                        <button 
                          onClick={() => handleAbsenClick("Hadir")}
                          className="relative overflow-hidden h-24 rounded-[28px] shadow-lg shadow-blue-200/50 group active:scale-95 transition-all duration-300"
                        >
                           <div className="absolute inset-0 bg-white border-2 border-blue-100 transition-transform"></div>
                           
                           <div className="relative z-10 flex items-center px-6 h-full">
                              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl border border-blue-100 mr-4">
                                 🏢
                              </div>
                              <div className="text-left text-blue-700">
                                 <p className="font-bold text-lg leading-tight">Absen Kantor</p>
                                 <p className="text-xs text-blue-400">Foto Wajah Di Lokasi</p>
                              </div>
                              <div className="ml-auto bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md text-white group-hover:translate-x-1 transition-transform">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                 </svg>
                              </div>
                           </div>
                        </button>

                        <button 
                          onClick={() => handleAbsenClick("WFH")}
                          className="relative overflow-hidden h-24 rounded-[28px] shadow-lg shadow-purple-200/50 group active:scale-95 transition-all duration-300"
                        >
                           <div className="absolute inset-0 bg-white border-2 border-purple-100 transition-transform"></div>
                           
                           <div className="relative z-10 flex items-center px-6 h-full">
                              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl border border-purple-100 mr-4">
                                 🏠
                              </div>
                              <div className="text-left text-purple-700">
                                 <p className="font-bold text-lg leading-tight">Absen WFH</p>
                                 <p className="text-xs text-purple-400">Dinas Luar / Sampling</p>
                              </div>
                              <div className="ml-auto bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md text-white group-hover:translate-x-1 transition-transform">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                 </svg>
                              </div>
                           </div>
                        </button>

                        <button 
                          onClick={() => handleAbsenClick("Izin")}
                          className="relative overflow-hidden h-24 rounded-[28px] shadow-lg shadow-orange-200/50 group active:scale-95 transition-all duration-300"
                        >
                           <div className="absolute inset-0 bg-white border-2 border-orange-100 transition-transform"></div>
                           
                           <div className="relative z-10 flex items-center px-6 h-full">
                              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl border border-orange-100 mr-4">
                                 🤒
                              </div>
                              <div className="text-left text-orange-700">
                                 <p className="font-bold text-lg leading-tight">Izin / Sakit</p>
                                 <p className="text-xs text-orange-400">Lampirkan Bukti</p>
                              </div>
                              <div className="ml-auto bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md text-white group-hover:translate-x-1 transition-transform">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                 </svg>
                              </div>
                           </div>
                        </button>
                     </div>
                   )
               )}

               {absenHariIni && absenHariIni.status === "Izin" && (
                   <div className="bg-orange-50 text-orange-800 p-6 rounded-[24px] shadow-sm border border-orange-100 text-center font-bold">
                      Anda sedang Izin hari ini.
                   </div>
               )}
            </>
        )}

        {showCamera && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[60] p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-[32px] shadow-2xl w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Ambil Foto</h3>
                
                {absenType === "Izin" && (
                   <p className="mb-4 text-xs font-bold text-orange-600 bg-orange-100 px-4 py-1.5 rounded-full">
                     📸 Foto Bukti / Surat Dokter
                   </p>
                )}

                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100 mb-6 w-full bg-black aspect-[3/4] relative">
                   <Webcam
                     audio={false}
                     ref={webcamRef}
                     screenshotFormat="image/jpeg"
                     width="100%"
                     height="100%"
                     videoConstraints={{ facingMode: "user" }}
                     className="w-full h-full object-cover scale-x-[-1]"
                   />
                </div>

                <div className="flex gap-3 w-full">
                   <button 
                     onClick={() => setShowCamera(false)}
                     className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                   >
                     Batal
                   </button>
                   <button 
                     onClick={handleCapture} 
                     disabled={isSubmitting}
                     className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95"
                   >
                     {isSubmitting ? "Mengirim..." : "📸 Absen"}
                   </button>
                </div>
              </div>
            </div>
        )}

        {showCheckoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[60] p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-[32px] shadow-2xl max-w-xs w-full text-center animate-in fade-in zoom-in duration-200">
                 <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Pulang Cepat?</h3>
                 <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Belum waktunya jam pulang. Yakin ingin check-out sekarang?
                 </p>
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setShowCheckoutConfirm(false)}
                       className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                       Batal
                    </button>
                    <button 
                       onClick={async () => {
                         setShowCheckoutConfirm(false);
                         await handleCheckout();
                       }}
                       className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition active:scale-95"
                    >
                       Ya
                    </button>
                 </div>
              </div>
            </div>
        )}

      </div>

      
      <div className={`
          fixed bottom-26 right-5 z-50 w-16 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100
          flex flex-col items-center py-3 gap-3
          transition-all duration-300 origin-bottom
          ${isMenuOpen ? 'scale-90 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'}
      `}>
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
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-14 h-14 rounded-full bg-[#07ABE8] text-white shadow-[0_0px_20px_rgba(38,166,154,0.4)] flex items-center justify-center border-[3px] border-white transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isMenuOpen ? 'rotate-90 bg-[#07ABE8]' : 'rotate-0 hover:scale-110'}`}
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