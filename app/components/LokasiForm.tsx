"use client";
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface Props {
  mode?: "tambah" | "edit";
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LokasiForm({
  mode = "tambah",
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius: "100",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        latitude: initialData.latitude?.toString() || "",
        longitude: initialData.longitude?.toString() || "",
        radius: initialData.radius?.toString() || "100",
        note: initialData.note || "",
      });
    }
    if (mode === "tambah") {
      setForm({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        radius: "100",
        note: "",
      });
    }
  }, [mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    if (!form.name || !form.latitude || !form.longitude) {
      setMsg("Nama, Latitude dan Longitude wajib diisi.");
      setSaving(false);
      return;
    }
    // Data yang dikirim ke backend (pastikan tipe data benar)
    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius: parseFloat(form.radius) || 100,
    };

    let res;
    if (mode === "edit" && initialData && (initialData.id || initialData._id)) {
      const id = initialData.id || initialData._id;
      res = await fetch(`/api/lokasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/lokasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      setMsg("Berhasil menyimpan lokasi.");
      if (onSuccess) onSuccess();
      if (mode === "tambah") {
        setForm({
          name: "",
          address: "",
          latitude: "",
          longitude: "",
          radius: "100",
          note: "",
        });
      }
    } else {
      setMsg("Gagal menyimpan lokasi.");
    }
    setSaving(false);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 480, mx: "auto", mt: 4 }}>
      <Typography fontWeight="bold" fontSize={24} sx={{ color: "#20653a", mb: 2 }}>
        {mode === "edit" ? "Edit Lokasi" : "Tambah Lokasi Baru"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          name="name"
          value={form.name}
          onChange={handleChange}
          label="Nama Lokasi *"
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="address"
          value={form.address}
          onChange={handleChange}
          label="Alamat"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box display="flex" gap={2} mb={2}>
          <TextField
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            label="Latitude *"
            required
            fullWidth
            type="number"
          />
          <TextField
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            label="Longitude *"
            required
            fullWidth
            type="number"
          />
        </Box>
        <TextField
          name="radius"
          value={form.radius}
          onChange={handleChange}
          label="Radius (meter)"
          type="number"
          inputProps={{ min: 1 }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          name="note"
          value={form.note}
          onChange={handleChange}
          label="Catatan"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <Box mt={2} display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              "&:hover": { bgcolor: "#166534" }
            }}
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : mode === "edit"
              ? "Simpan Perubahan"
              : "Tambah Lokasi"}
          </Button>
          <Button
            type="button"
            sx={{
              bgcolor: "#e5e7eb",
              color: "#444",
              borderRadius: 2,
              fontWeight: "bold",
              "&:hover": { bgcolor: "#cbd5e1" }
            }}
            onClick={onCancel || (() => window.history.back())}
            disabled={saving}
          >
            Batal
          </Button>
        </Box>
        {msg && (
          <Box mt={2} color={msg.includes("Berhasil") ? "#16a34a" : "#b91c1c"} fontWeight="bold">
            {msg}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
