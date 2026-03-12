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

// Tipe data lokasi kantor untuk MySQL
type LokasiKantor = {
  id: number;
  name: string;
};

export default function InputLokasiPegawaiForm({
  pegawai,
  onSuccess,
  onCancel,
}: {
  pegawai: { id: number; name: string; lokasiKantorId?: number | string };
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [lokasi, setLokasi] = useState(pegawai.lokasiKantorId || "");
  const [lokasiList, setLokasiList] = useState<LokasiKantor[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/lokasi")
      .then((res) => res.json())
      .then((json) => setLokasiList(Array.isArray(json) ? json : json.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const selectedLokasi = lokasiList.find((l) => l.id === lokasi || String(l.id) === String(lokasi));
    const lokasiName = selectedLokasi ? selectedLokasi.name : "";
    const res = await fetch(`/api/employee/${pegawai.id}/lokasi`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lokasiKantorId: lokasi, // ID saja cukup untuk update field relasi di SQL
        lokasi: lokasiName,      // hanya kalau backend ingin log/display nama
      }),
    });
    if (res.ok) {
      setMsg("Berhasil input lokasi pegawai.");
      setTimeout(() => onSuccess?.(), 700);
    } else {
      setMsg("Gagal input lokasi.");
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
        Input Lokasi Pegawai
      </Typography>

      <Box mb={3}>
        <TextField
          label="Nama Pegawai"
          value={pegawai.name}
          fullWidth
          size="small"
          disabled
          sx={{ mb: 0.5 }}
        />
      </Box>

      <Box mb={2}>
        <FormControl fullWidth size="small" required>
          <InputLabel id="lokasi-pegawai-label">Lokasi Pegawai</InputLabel>
          <Select
            labelId="lokasi-pegawai-label"
            label="Lokasi Pegawai"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
          >
            <MenuItem value="">Pilih Lokasi</MenuItem>
            {lokasiList.map((lok) => (
              <MenuItem key={lok.id} value={lok.id}>
                {lok.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
          Pilih lokasi kantor dari daftar yang tersedia.
        </Typography>
      </Box>

      <Box display="flex" gap={2} mt={2}>
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
