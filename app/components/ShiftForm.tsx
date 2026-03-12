"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export type Shift = {
  id?: number;       
  name: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  days?: string[];
};

interface Props {
  mode: "tambah" | "edit";
  initialData?: Shift;
}

const HARI = [
  "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
];

export default function ShiftForm({ mode, initialData }: Props) {
  const [form, setForm] = useState<Shift>({
    name: "",
    startTime: "",
    endTime: "",
    breakStart: "",
    breakEnd: "",
    days: [],
    ...(initialData || {}),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDayChange = (day: string) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days?.includes(day)
        ? prev.days?.filter((d) => d !== day)
        : [...(prev.days || []), day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi sederhana
    if (!form.name || !form.startTime || !form.endTime || !form.days || form.days.length === 0) {
      setError("Nama, jam masuk, jam pulang, dan hari wajib diisi.");
      setLoading(false);
      return;
    }

    // Persiapkan body agar sesuai MySQL (backend handle days: array atau string)
    const body = {
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      breakStart: form.breakStart || null,
      breakEnd: form.breakEnd || null,
      days: form.days,
    };

    try {
      const url =
        mode === "edit"
          ? `/api/shift/${form.id}`
          : `/api/shift`;

      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal menyimpan shift");
      router.push("/dashboardAdmin/shift");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
    setLoading(false);
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 540, mx: "auto", mt: 5, p: 4, borderRadius: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} sx={{ color: "#20653a" }}>
        {mode === "tambah" ? "Tambah Shift" : "Edit Shift"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <TextField
            name="name"
            label="Nama Shift"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            variant="outlined"
            InputLabelProps={{
              shrink: true,
              sx: { color: "#20653a", fontWeight: "bold", background: "#fff", px: 0.5 }
            }}
            sx={{
              "& label": { color: "#20653a", fontWeight: "bold" }
            }}
          />
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            type="time"
            name="startTime"
            label="Jam Masuk"
            value={form.startTime}
            onChange={handleChange}
            required
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { color: "#20653a", fontWeight: "bold" }
            }}
          />
          <TextField
            type="time"
            name="endTime"
            label="Jam Pulang"
            value={form.endTime}
            onChange={handleChange}
            required
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { color: "#20653a", fontWeight: "bold" }
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            type="time"
            name="breakStart"
            label="Istirahat Mulai"
            value={form.breakStart || ""}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { color: "#20653a", fontWeight: "bold" }
            }}
          />
          <TextField
            type="time"
            name="breakEnd"
            label="Istirahat Selesai"
            value={form.breakEnd || ""}
            onChange={handleChange}
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { color: "#20653a", fontWeight: "bold" }
            }}
          />
        </Box>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <Typography fontWeight="bold" mb={1} sx={{ color: "#20653a" }}>
            Hari Berlaku
          </Typography>
          <FormGroup row>
            {HARI.map((day) => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={form.days?.includes(day)}
                    onChange={() => handleDayChange(day)}
                    disabled={loading}
                    sx={{
                      color: "#20653a",
                      "&.Mui-checked": { color: "#20653a" }
                    }}
                  />
                }
                label={<Typography sx={{ color: "#20653a" }}>{day}</Typography>}
              />
            ))}
          </FormGroup>
        </FormControl>

        {error && (
          <Typography color="#b91c1c" mb={2} fontWeight="bold">
            {error}
          </Typography>
        )}

        <Box display="flex" gap={2} mt={2}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              px: 4,
              fontSize: 17,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              "&:hover": { bgcolor: "#166534" }
            }}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
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
              fontSize: 17,
              "&:hover": { bgcolor: "#d1d5db" }
            }}
            onClick={() => router.push("/dashboardAdmin/shift")}
            disabled={loading}
          >
            Batal
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
