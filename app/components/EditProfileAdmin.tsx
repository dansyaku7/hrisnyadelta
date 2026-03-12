"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
} from "@mui/material";

interface EmployeeProfile {
  name: string;
}

export default function EditProfileAdmin() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile>({ name: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Ambil employeeId dari /api/me
  useEffect(() => {
    async function fetchEmployeeId() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setEmployeeId(data.employeeId);
        setProfile({ name: data.name || "" }); // Prefill jika ada
      } catch (error) {
        setMsg("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeeId();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setMsg("Menyimpan...");
    setLoading(true);

    const res = await fetch(`/api/employee/${employeeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      setMsg("Berhasil update profil");
      setTimeout(() => {
        router.push("/dashboardAdmin");
      }, 800);
    } else {
      setMsg("Gagal update profil");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography fontWeight={600} color="#fff" fontSize={24}>
          Loading...
        </Typography>
      </Box>
    );
  if (!employeeId) return <div>Tidak dapat menemukan data pegawai.</div>;

  return (
    <Paper elevation={4} sx={{ maxWidth: 420, mx: "auto", mt: 6, p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} color="#20653a" mb={3}>
        Edit Nama
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nama"
          name="name"
          value={profile.name}
          onChange={handleChange}
          required
          fullWidth
          sx={{ mb: 3 }}
        />
        <Box display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              px: 4,
              "&:hover": { bgcolor: "#166534" }
            }}
            disabled={loading}
          >
            Simpan
          </Button>
          <Button
            type="button"
            variant="contained"
            sx={{
              bgcolor: "#e5e7eb",
              color: "#20653a",
              fontWeight: "bold",
              borderRadius: 2,
              px: 4,
              "&:hover": { bgcolor: "#d1d5db" }
            }}
            onClick={() => router.push("/dashboardAdmin")}
            disabled={loading}
          >
            Kembali
          </Button>
        </Box>
        {msg && (
          <Typography mt={3} color={msg.includes("Berhasil") ? "#166534" : "#b91c1c"}>
            {msg}
          </Typography>
        )}
      </form>
    </Paper>
  );
}
