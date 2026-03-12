"use client";
import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";

export default function DepartmentForm({
  mode = "tambah",
  initialData,
  onSuccess,
  onCancel,
}: {
  mode?: "tambah" | "edit";
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    }
    if (mode === "tambah") {
      setName("");
      setDescription("");
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    if (!name.trim()) {
      setMsg("Nama departemen wajib diisi.");
      setSaving(false);
      return;
    }
    let res;
    if (mode === "edit" && initialData && initialData.id) {
      res = await fetch(`/api/department/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    } else {
      res = await fetch("/api/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    }
    if (res.ok) {
      setMsg("Berhasil menyimpan departemen.");
      if (onSuccess) onSuccess();
      if (mode === "tambah") {
        setName("");
        setDescription("");
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      setMsg(
        errJson?.error ||
        errJson?.message ||
        "Gagal menyimpan departemen."
      );
    }
    setSaving(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 480,
        mx: "auto",
        mt: 10,
        mb: 5,
        borderRadius: 3,
        p: 4,
        boxShadow: 3
      }}
    >
      <Typography
        fontWeight={700}
        fontSize={22}
        mb={2}
        sx={{ color: "#20653a" }}
      >
        {mode === "edit" ? "Edit Departemen" : "Tambah Departemen"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nama Departemen"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          fullWidth
          size="small"
          margin="normal"
          InputLabelProps={{
            shrink: true,
            sx: { fontWeight: "bold", color: "#20653a" }
          }}
        />
        <TextField
          label="Deskripsi"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          size="small"
          margin="normal"
          InputLabelProps={{
            shrink: true,
            sx: { fontWeight: "bold", color: "#20653a" }
          }}
        />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#0891b2" }
            }}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : (mode === "edit" ? "Simpan Perubahan" : "Tambah Departemen")}
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
          onClick={onCancel}
          disabled={saving}
        >
          Batal
        </Button>
        </Box>
        {msg && (
          <Typography
            sx={{
              mt: 2,
              color: msg.includes("Berhasil") ? "#166534" : "#b91c1c",
              fontWeight: "bold"
            }}
            variant="body2"
          >
            {msg}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
