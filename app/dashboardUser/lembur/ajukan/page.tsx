"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, TextField, Button } from "@mui/material";

export default function AjukanLemburPage() {
  const [tanggal, setTanggal] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [alasan, setAlasan] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);

  const router = useRouter();

  async function handleAjukanLembur() {
    setErrorForm("");
    if (!tanggal || !startTime || !endTime || !alasan) {
      setErrorForm("Semua field wajib diisi!");
      return;
    }
    setLoadingForm(true);

    // Fetch user info (employee_id, department_id)
    let user: any = {};
    try {
      user = await fetch("/api/me").then(res => res.json());
    } catch {
      setErrorForm("Gagal mengambil data user.");
      setLoadingForm(false);
      return;
    }

    try {
      const res = await fetch("/api/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: user.employeeId,
          department_id: user.departmentId,
          tanggal,
          start_time: startTime,
          end_time: endTime,
          alasan,
          // status: "pending", // opsional, API default "pending"
        }),
      });
      if (!res.ok) throw new Error("Gagal mengajukan lembur");
      router.push("/dashboardUser/lembur");
    } catch {
      setErrorForm("Gagal mengirim pengajuan lembur");
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
            Ajukan Lembur
          </span>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboardUser/lembur")}
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
            handleAjukanLembur();
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "10px"
          }}>
            <TextField
              label="Tanggal"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Jam Mulai"
              type="time"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Jam Selesai"
              type="time"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              sx={{ mb: 2 }}
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
