"use client";
import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

type Department = { id: number; name: string };

export default function AddPegawaiForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/department")
      .then((res) => res.json())
      .then((json) =>
        setDepartments(Array.isArray(json) ? json : json.data || [])
      );
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name as string]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name!]: value }));
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    if (!form.name || !form.username || !form.email || !form.password || !form.departmentId) {
      setMsg("Semua field wajib diisi!");
      setLoading(false);
      return;
    }
    if (form.password.length < 5) {
      setMsg("Password minimal 5 karakter!");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        departmentId: Number(form.departmentId),
      }),
    });
    const data = await res.json();

    if (res.ok) {
      setMsg("Berhasil menambah pegawai.");
      setTimeout(() => onSuccess?.(), 500);
    } else {
      setMsg(data.message || "Gagal menambah pegawai.");
    }
    setLoading(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 460,
        mx: "auto",
        mt: 4,
        borderRadius: 4,
        p: { xs: 2, sm: 4 },
      }}
      component="form"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <Typography
        fontWeight="bold"
        fontSize={28}
        sx={{
          color: "#20653a",
          letterSpacing: 0.5,
          borderRadius: 2,
          px: 2,
          py: 1,
          mb: 3,
          display: "inline-block",
        }}
      >
        Tambah Pegawai
      </Typography>
      <Box mb={3}>
        <TextField
          label="Nama Lengkap"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          size="small"
          required
          disabled={loading}
          autoFocus
        />
      </Box>
      <Box mb={3}>
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          size="small"
          required
          disabled={loading}
        />
      </Box>
      <Box mb={3}>
        <TextField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          size="small"
          required
          disabled={loading}
        />
      </Box>
      <Box mb={3}>
        <TextField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          size="small"
          required
          disabled={loading}
          inputProps={{ minLength: 5 }}
        />
      </Box>
      <Box mb={3}>
        <FormControl fullWidth size="small" required>
        <InputLabel id="department-label">Departemen</InputLabel>
        <Select
            labelId="department-label"
            label="Departemen"  
            name="departmentId"
            value={form.departmentId}
            onChange={handleSelectChange}
            disabled={loading}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
        >
            <MenuItem value="">Pilih Departemen</MenuItem>
            {departments.map((dep) => (
            <MenuItem key={dep.id} value={dep.id}>
                {dep.name}
            </MenuItem>
            ))}
        </Select>
        </FormControl>
      </Box>

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#20653a",
            color: "white",
            borderRadius: 2,
            fontWeight: "bold",
            minWidth: 120,
            "&:hover": { bgcolor: "#166534" },
          }}
          type="submit"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#e0e7ef",
            color: "#333",
            borderRadius: 2,
            fontWeight: "bold",
            minWidth: 120,
            "&:hover": { bgcolor: "#cfd8dc" },
          }}
          type="button"
          onClick={onCancel || (() => window.history.back())}
          disabled={loading}
        >
          Batal
        </Button>
      </Box>
      {msg && (
        <Typography
          sx={{
            mt: 3,
            fontSize: 14,
            color: msg.includes("Berhasil") ? "#166534" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          {msg}
        </Typography>
      )}
    </Paper>
  );
}
