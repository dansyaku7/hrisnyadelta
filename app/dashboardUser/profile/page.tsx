"use client";
import { useEffect, useState } from "react";
import { 
  TextField,
  CircularProgress, 
  Avatar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await fetch("/api/me").then(res => res.json());
        if (!user?.employeeId) {
          setErrorMsg("Data tidak ditemukan.");
          setLoading(false);
          return;
        }
        const empRes = await fetch(`/api/employee/${user.employeeId}`);
        const empJson = await empRes.json();
        if (empJson?.data) setProfile(empJson.data);
        else setErrorMsg("Gagal mengambil data profil");
      } catch {
        setErrorMsg("Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    if (!profile?.name || !profile?.email || !profile?.NIK) {
      setErrorMsg("Nama, Email, dan NIK wajib diisi!");
      return;
    }
    try {
      const id = profile.id || profile.employeeId;
      const res = await fetch(`/api/employee/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSuccessMsg("Profil berhasil diperbarui!");
        setTimeout(() => router.push("/dashboardUser"), 800);
      } else {
        setErrorMsg("Gagal menyimpan profil.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat menyimpan.");
    }
  }

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', 
      backgroundColor: '#ffffff', 
      '& fieldset': { borderColor: '#E2E8F0' }, 
      '&:hover fieldset': { borderColor: '#10B981' }, 
      '&.Mui-focused fieldset': { borderColor: '#10B981' }, 
    },
    '& .MuiInputLabel-root': { color: '#64748B', fontSize: '0.9rem', fontFamily: "var(--font-comfortaa), sans-serif" }, 
    '& .MuiInputLabel-root.Mui-focused': { color: '#10B981' }, 
    '& input': { fontFamily: "var(--font-comfortaa), sans-serif", color: '#334155' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative font-sans" style={{ fontFamily: "var(--font-comfortaa), sans-serif" }}>
         <div className="relative z-10 flex flex-col items-center">
            <CircularProgress size={50} thickness={4} sx={{ color: '#10B981' }} />
            <p className="mt-4 text-gray-500 font-bold animate-pulse">Memuat Profil...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden font-sans pb-20" style={{ fontFamily: "var(--font-comfortaa), sans-serif" }}>
      
      <div className="absolute top-0 left-0 w-full h-[250px] overflow-hidden z-0">
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

      <div className="relative z-10 px-6 pt-6 max-w-md mx-auto min-h-screen flex flex-col">
        
        <div className="flex items-center justify-end mb-9 text-white">
           <Link href="/dashboardUser" className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 backdrop-blur-sm transition border border-white/30 shadow-sm active:scale-95">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
           </Link>
        </div>

        <div className="bg-white rounded-[30px] shadow-2xl shadow-gray-200 relative pt-14 pb-8 px-6 border border-white/50">
            
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="p-1.5 rounded-full bg-white shadow-lg">
                    <Avatar 
                        sx={{ 
                            width: 90, 
                            height: 90, 
                            bgcolor: '#07ABE8', 
                            fontSize: '2.2rem', 
                            fontWeight: 'bold',
                            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1)' 
                        }}
                    >
                        {profile?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                </div>
            </div>

            <form onSubmit={handleSave} autoComplete="off" className="space-y-4 mt-2">
                
                <TextField
                    label="Nama Lengkap"
                    variant="outlined"
                    value={profile?.name || ""}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    required
                    fullWidth
                    size="medium"
                    sx={inputStyle}
                />

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <TextField
                        label="Tanggal Lahir"
                        type="date"
                        variant="outlined"
                        value={profile?.birthdate || ""}
                        onChange={e => setProfile({ ...profile, birthdate: e.target.value })}
                        fullWidth
                        size="medium"
                        InputLabelProps={{ shrink: true }}
                        sx={inputStyle}
                    />
                    <TextField
                        label="No. HP"
                        variant="outlined"
                        value={profile?.phone || ""}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        fullWidth
                        size="medium"
                        sx={inputStyle}
                    />
                </div>

                <TextField
                    label="NIK (Nomor Induk)"
                    variant="outlined"
                    value={profile?.NIK || ""}
                    onChange={e => setProfile({ ...profile, NIK: e.target.value })}
                    required
                    fullWidth
                    size="medium"
                    sx={inputStyle}
                />

                <div className="relative mt-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    
                    <div className="p-4 pl-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-600">💳</span>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data Rekening</p>
                        </div>

                        <div className="space-y-3">
                            <TextField
                                label="Nomor Rekening"
                                variant="outlined"
                                value={profile?.norek || ""}
                                onChange={e => setProfile({ ...profile, norek: e.target.value })}
                                fullWidth
                                size="small" 
                                sx={inputStyle}
                            />
                            <TextField
                                label="Atas Nama"
                                variant="outlined"
                                value={profile?.atasNama || ""}
                                onChange={e => setProfile({ ...profile, atasNama: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{...inputStyle, mt: 2}}
                            />
                        </div>
                    </div>
                </div>

                <TextField
                    label="Alamat Lengkap"
                    variant="outlined"
                    value={profile?.address || ""}
                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                    size="medium"
                    sx={inputStyle}
                />

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl text-center font-bold border border-red-100">
                        ⚠️ {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-xl text-center font-bold border border-emerald-100">
                        ✅ {successMsg}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#10B981] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-[#059669] active:scale-95 transition-all flex justify-center items-center gap-2 mt-6"
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : (
                        <>
                            Simpan Perubahan
                        </>
                    )}
                </button>

            </form>
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );
}