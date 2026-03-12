"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paper, TextField, Button } from "@mui/material";

export default function AjukanKasbonUserPage() {
  const [jumlahPinjaman, setJumlahPinjaman] = useState("");
  const [alasan, setAlasan] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(json => setUser(json));
  }, []);

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
      router.push("/dashboardUser/kasbon");
    } catch {
      setErrorForm("Gagal mengirim pengajuan kasbon");
    } finally {
      setLoadingForm(false);
    }
  }

  return (
    <div className="p-4">
      <Paper
        elevation={4}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            width: "100%",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: 22, color: "#fff" }}>
            Ajukan Kasbon
          </span>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboardUser/kasbon")}
            sx={{
              bgcolor: "#fff",
              color: "#20653a",
              fontWeight: "bold",
              borderRadius: 2,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              '&:hover': { bgcolor: "#e5e7eb" },
              minWidth: 100,
            }}
          >
            Kembali
          </Button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAjukanKasbon();
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "10px"
          }}>
            <TextField
              label="Nominal Pinjaman"
              type="number"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={jumlahPinjaman}
              onChange={e => setJumlahPinjaman(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Alasan"
              multiline
              rows={2}
              fullWidth
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              sx={{ mb: 2 }}
            />
            {errorForm && (
              <div style={{ color: "#b91c1c", marginBottom: 10 }}>{errorForm}</div>
            )}
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
