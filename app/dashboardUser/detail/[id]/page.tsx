"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CircularProgress, 
  Button 
} from "@mui/material";
import Link from "next/link";

type Announcement = {
  id: string | number;
  title: string;
  content: string;
  expired_at: string;
  priority: string;
  attachmentUrl?: string;
  createdBy?: string;
  status?: string;
  createdAt?: string;
  target?: any;
};

export default function PengumumanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [data, setData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingPage, setLoadingPage] = useState(true); 

  useEffect(() => {
    if (!id) return;
    setLoadingPage(true);
    fetch(`/api/announcements/${id}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error(json.message || "Gagal fetch pengumuman");
        setData(json.data);
        setLoading(false);
        setLoadingPage(false);
      })
      .catch(() => {
        setError("Gagal mengambil data pengumuman");
        setLoading(false);
        setLoadingPage(false);
      });
  }, [id]);

  function priorityColor(priority: string) {
    const p = (priority || "").toLowerCase();
    let bgClass = "bg-gray-100 text-gray-600 border-gray-200";
    if (p === "tinggi") bgClass = "bg-red-50 text-red-600 border-red-100";
    if (p === "sedang") bgClass = "bg-yellow-50 text-yellow-600 border-yellow-100";
    if (p === "rendah") bgClass = "bg-emerald-50 text-emerald-600 border-emerald-100";

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${bgClass} uppercase tracking-wide`}>
        {priority}
      </span>
    );
  }

  function formatTanggalIndo(tgl: string) {
    if (!tgl) return "-";
    const [y, m, d] = tgl.split("-");
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni","Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${d} ${bulan[parseInt(m, 10) - 1]} ${y}`;
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans font-comfortaa">
         <div className="relative z-10 flex flex-col items-center">
            <CircularProgress size={60} thickness={4} sx={{ color: '#0047AD' }} />
            <p className="mt-4 text-gray-500 font-bold animate-pulse">Memuat Pengumuman...</p>
         </div>
      </div>
    );
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

      <div className="relative z-10 px-6 pt-8 max-w-2xl mx-auto min-h-screen flex flex-col">
        
        <div className="flex items-center justify-end mb-9 text-white">
           <Link href="/dashboardUser" className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 backdrop-blur-sm transition border border-white/30 shadow-sm active:scale-95">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
           </Link>
        </div>

        <div className="bg-white rounded-[30px] shadow-2xl shadow-green-900/10 relative overflow-hidden min-h-[400px]">
            
            {loading ? (
               <div className="flex flex-col items-center justify-center h-80 text-gray-400 gap-3">
                  <CircularProgress size={30} color="success" />
                  <span className="text-xs font-medium">Memuat Data...</span>
               </div>
            ) : error ? (
               <div className="flex flex-col items-center justify-center h-80 text-red-500 gap-2">
                  <span className="text-4xl">⚠️</span>
                  <span className="font-bold">{error}</span>
               </div>
            ) : !data ? (
               <div className="flex flex-col items-center justify-center h-80 text-gray-400 gap-2">
                  <span className="text-4xl grayscale opacity-30">📭</span>
                  <span className="text-sm">Pengumuman tidak ditemukan.</span>
               </div>
            ) : (
               <>
                  <div className="bg-gradient-to-br from-[#07ABE8] to-[#0047AD] p-6 relative overflow-hidden text-white">
    
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>

                      <div className="relative z-10">
                          <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-sm border border-white/20">
                                  <span className="text-3xl">📢</span>
                              </div>
                              
                              <div className="flex-1 pt-1">
                                  <div className="mb-2 opacity-90">
                                      {priorityColor(data.priority)}
                                  </div>
                                  <h2 className="text-md font-bold text-white leading-snug drop-shadow-sm">
                                      {data.title}
                                  </h2>
                              </div>
                          </div>

                          <div className="inline-flex items-center gap-2 text-xs text-green-50 font-medium bg-black/10 px-3 py-1.5 rounded-xl border border-white/10 font-comfortaa">
                              <span>Berlaku sampai:</span>
                              <span className="text-white font-bold">
                                  {data.expired_at ? formatTanggalIndo(data.expired_at) : "-"}
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 text-gray-600 text-sm leading-relaxed">
                      <div 
                        className="prose prose-sm max-w-none text-justify" 
                        dangerouslySetInnerHTML={{ __html: data.content || "" }}
                        style={{ wordBreak: "break-word" }}
                      />
                  </div>

                  {data.attachmentUrl && (
                      <div className="px-6 pb-8 pt-2">
                          <a 
                            href={data.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-3 rounded-xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-colors w-full justify-center sm:w-auto"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                             </svg>
                             Lihat Lampiran Dokumen
                          </a>
                      </div>
                  )}
               </>
            )}
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );
}