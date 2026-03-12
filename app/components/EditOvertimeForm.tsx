"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";

interface OvertimeData {
  id?: number | string; // pakai id (SQL)
  name: string;
  department: string;
  tanggal: string;
  startTime: string;
  endTime: string;
  alasan: string;
  status: string;
}

interface Props {
  mode?: "edit";
  initialData: OvertimeData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

export default function EditOvertimeForm({
  mode = "edit",
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState<OvertimeData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  // Handler for TextField/TextArea
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler for MUI Select
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    if (!form.tanggal || !form.startTime || !form.endTime || !form.alasan) {
      setMsg("Semua field wajib diisi.");
      setSaving(false);
      return;
    }
    if (form.endTime <= form.startTime) {
      setMsg("Jam selesai harus lebih besar dari jam mulai.");
      setSaving(false);
      return;
    }

    // Use id from SQL, fallback to _id if needed
    const overtimeId = form.id ?? (initialData as any)._id;
    const res = await fetch(`/api/overtime/${overtimeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tanggal: form.tanggal,
        startTime: form.startTime,
        endTime: form.endTime,
        alasan: form.alasan,
        status: form.status,
      }),
    });

    if (res.ok) {
      setMsg("Berhasil menyimpan perubahan!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } else {
      setMsg("Gagal menyimpan perubahan.");
    }
    setSaving(false);
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 500, mx: "auto", mt: 6, p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} color="#20653a" mb={3}>
        Edit Data Lembur
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Nama Pegawai"
          value={form.name}
          disabled
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{ style: { background: "#f3f4f6" } }}
        />
        <TextField
          label="Departemen"
          value={form.department}
          disabled
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{ style: { background: "#f3f4f6" } }}
        />
        <TextField
          label="Tanggal"
          name="tanggal"
          type="date"
          value={form.tanggal ? form.tanggal.slice(0, 10) : ""}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Jam Mulai"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleInputChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Jam Selesai"
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleInputChange}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <TextField
          label="Alasan"
          name="alasan"
          value={form.alasan}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ mb: 3 }}
        />
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel id="status-lembur" shrink>Status</InputLabel>
          <Select
            labelId="status-lembur"
            name="status"
            value={form.status}
            label="Status"
            onChange={handleSelectChange}
            fullWidth
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#166534" }
            }}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="contained"
            sx={{
              bgcolor: "#e5e7eb",
              color: "#20653a",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#d1d5db" }
            }}
            onClick={onCancel || (() => window.history.back())}
            disabled={saving}
          >
            Batal
          </Button>
        </Box>
        {msg && (
          <Typography mt={3} color={msg.includes("Berhasil") ? "#166534" : "#b91c1c"}>
            {msg}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
