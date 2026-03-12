"use client";
import { useState } from "react";
import { Box, Button, TextField, Typography, Alert, Stack } from "@mui/material";

export default function GantiPasswordForm({
  id,
  onSuccess,
}: {
  id: number | string;  
  onSuccess?: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!password || !confirm) {
      setMsg("Semua field wajib diisi.");
      return;
    }
    if (password !== confirm) {
      setMsg("Konfirmasi password tidak sesuai.");
      return;
    }
    if (password.length < 6) {
      setMsg("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);

    const res = await fetch(`/api/employee/${id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    if (res.ok) {
      setMsg("Berhasil mengganti password!");
      setPassword("");
      setConfirm("");
      if (onSuccess) setTimeout(onSuccess, 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error || "Gagal mengganti password.");
    }
    setLoading(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 420,
        mx: "auto",
        mt: 4,
        p: 4,
        bgcolor: "white",
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          color: "#20653a",
          mb: 3,
          letterSpacing: 0.5,
        }}
      >
        Ganti Password Pegawai
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Password Baru"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{ minLength: 6 }}
          sx={{ borderRadius: 2, bgcolor: "#f6fefb" }}
        />
        <TextField
          label="Konfirmasi Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          sx={{ borderRadius: 2, bgcolor: "#f6fefb" }}
        />
        <Box display="flex" gap={2} mt={1}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#20653a",
              "&:hover": { backgroundColor: "#166534" },
              fontWeight: "bold",
              borderRadius: 2,
              boxShadow: "none"
            }}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Ganti Password"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              fontWeight: "bold",
              borderRadius: 2,
              bgcolor: "#f3f4f6",
              color: "#444",
              borderColor: "#ddd",
              "&:hover": { bgcolor: "#e5e7eb", borderColor: "#bbb" }
            }}
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Batal
          </Button>
        </Box>
        {msg && (
          <Alert
            severity={msg.includes("Berhasil") ? "success" : "error"}
            sx={{
              mt: 1,
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            {msg}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
