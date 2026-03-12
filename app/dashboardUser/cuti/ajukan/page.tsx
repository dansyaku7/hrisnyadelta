"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paper, TextField, Button, MenuItem} from "@mui/material";

export default function AjukanCutiPage() {
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [jenis, setJenis] = useState("Cuti Liburan");
  const [sisaCuti, setSisaCuti] = useState<number | null>(null);
  const [loadingCuti, setLoadingCuti] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchSisaCuti() {
      setLoadingCuti(true);
      try {
        // 1. Ambil data user untuk dapatkan employeeId
        const user = await fetch("/api/me").then(res => res.json());
        if (!user?.employeeId) {
          setSisaCuti(null);
          setLoadingCuti(false);
          return;
        }
        // 2. Fetch jatah cuti semua karyawan
        const res = await fetch("/api/jatah-cuti");
        const data = await res.json();
        // 3. Cari sisaCuti dari data yang cocok dengan employeeId
        const cuti = (data?.data || []).find((c: any) => c.employee_id === user.employeeId);
        if (mounted) setSisaCuti(cuti?.sisa_cuti ?? 0);
      } catch {
        if (mounted) setSisaCuti(null);
      } finally {
        if (mounted) setLoadingCuti(false);
      }
    }
    fetchSisaCuti();
    return () => { mounted = false; };
  }, []);

  async function handleAjukanCuti() {
    setErrorForm("");
    if (!tglMulai || !tglSelesai || !alasan || !jenis) {
        setErrorForm("Semua field wajib diisi!");
        return;
    }
    setLoadingForm(true);

    let user: any = {};
    try {
        user = await fetch("/api/me").then(res => res.json());
    } catch {
        setErrorForm("Gagal mengambil data user.");
        setLoadingForm(false);
        return;
    }

    try {
      const res = await fetch("/api/cuti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.employeeId,    // camelCase sesuai response API
          departmentId: user.departmentId,
          name: user.name,
          tglMulai,
          tglSelesai,
          jenis,
          alasan,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengajukan cuti");
      router.push("/dashboardUser/cuti");
    } catch {
      setErrorForm("Gagal mengirim pengajuan cuti");
    } finally {
      setLoadingForm(false);
    }
  }


  return (
    <div className="p-4">
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 3,
        borderRadius: 3,
        boxShadow: 3,
        background: "#20653a",
        color: "white",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        width: "100%",
      }}>
        <span style={{ fontWeight: "bold", fontSize: 22, color: "white" }}>
          Ajukan Cuti
        </span>
        <Button
        variant="contained"
        onClick={() => router.push("/dashboardUser/cuti")}
        sx={{
            bgcolor: "#fff",
            color: "#20653a",
            fontWeight: "bold",
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            mr: 1,
            '&:hover': {
            bgcolor: "#e5e7eb",
            color: "#20653a",
            },
            minWidth: 100,
        }}
        >
        Kembali
        </Button>
      </div>
      <span style={{ fontWeight: 500, fontSize: 16, color: "#ffe066", marginTop: 3 }}>
        {loadingCuti ? "Memuat sisa cuti..." : (
          sisaCuti !== null ? `Sisa cuti Anda: ${sisaCuti}` : "Sisa cuti tidak tersedia"
        )}
      </span>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleAjukanCuti();
        }}
      >
        <div style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "10px",
        marginTop: "10px"
        }}>
        <TextField
        label="Jenis Cuti"
        select
        fullWidth
        size="small"
        value={jenis}
        onChange={e => setJenis(e.target.value)}
        sx={{ mb: 2 }}
        >
        <MenuItem value="Cuti Liburan">Cuti Liburan</MenuItem>
        <MenuItem value="Cuti Sakit">Cuti Sakit</MenuItem>
        <MenuItem value="Cuti Khusus">Cuti Khusus</MenuItem>
        </TextField>
        <TextField
          label="Tanggal Mulai"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true, style: { color: "black" } }}
          value={tglMulai}
          onChange={e => setTglMulai(e.target.value)}
          sx={{ mb: 2, input: { color: "black" }, label: { color: "black" } }}
        />
        <TextField
          label="Tanggal Selesai"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true, style: { color: "black" } }}
          value={tglSelesai}
          onChange={e => setTglSelesai(e.target.value)}
          sx={{ mb: 2, input: { color: "black" }, label: { color: "black" } }}
        />
        <TextField
          label="Alasan"
          multiline
          rows={2}
          fullWidth
          value={alasan}
          onChange={e => setAlasan(e.target.value)}
          sx={{ mb: 2, input: { color: "black" }, label: { color: "black" } }}
        />
        {errorForm && <div style={{ color: "#ffcdd2", marginBottom: 10 }}>{errorForm}</div>}
        </div>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#fff",
            color: "#20653a",
            fontWeight: "bold",
            py: 1.2,
            borderRadius: 2,
            "&:hover": { bgcolor: "#e5e7eb" },
          }}
          disabled={loadingForm}
        >
          {loadingForm ? "Mengirim..." : "Ajukan"}
        </Button>
      </form>
    </Paper>
    </div>
  );
}
