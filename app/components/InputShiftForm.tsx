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

type Shift = { id: number; name: string };

export default function InputShiftForm({
  pegawai,
  onSuccess,
  onCancel,
}: {
  pegawai: { id: number; name: string; shiftId?: number | string };
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [shiftId, setShiftId] = useState(pegawai.shiftId || "");
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/shift")
      .then((res) => res.json())
      .then((json) => setShiftList(Array.isArray(json) ? json : json.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    if (!shiftId) {
      setMsg("Silakan pilih shift!");
      setSaving(false);
      return;
    }
    const shiftName = shiftList.find((s) => s.id === shiftId || String(s.id) === String(shiftId))?.name || "";
    // PATCH ke endpoint MySQL
    const res = await fetch(`/api/employee/${pegawai.id}/shift`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId }), // shiftName bisa diabaikan kalau backend tidak butuh
    });
    if (res.ok) {
      setMsg("Berhasil update shift pegawai.");
      setTimeout(() => onSuccess?.(), 700);
    } else {
      setMsg("Gagal update shift pegawai.");
    }
    setSaving(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 430,
        mx: "auto",
        mt: 4,
        borderRadius: 4,
        p: { xs: 2, sm: 4 },
      }}
      component="form"
      onSubmit={handleSubmit}
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
        Ganti Shift Pegawai
      </Typography>

      <Box mb={3}>
        <TextField
          label="Nama Pegawai"
          value={pegawai.name}
          fullWidth
          size="small"
          disabled
        />
      </Box>

      <Box mb={3}>
        <FormControl fullWidth size="small" required>
          <InputLabel id="shift-pegawai-label">Shift</InputLabel>
          <Select
            labelId="shift-pegawai-label"
            label="Shift"
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
          >
            <MenuItem value="">Pilih Shift</MenuItem>
            {shiftList.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
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
            "&:hover": { bgcolor: "#166534" },
            minWidth: 120,
          }}
          type="submit"
          disabled={saving}
          startIcon={saving && <CircularProgress size={18} color="inherit" />}
        >
          {saving ? "Menyimpan..." : "Simpan"}
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
          disabled={saving}
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
