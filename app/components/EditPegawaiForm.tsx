"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from "@mui/material";

export interface EditPegawaiData {
  id?: number; 
  name: string;
  username: string;
  email: string;
  department: string;
  departmentId?: number | string;
  phone?: string;
  birthdate?: string;
  address?: string;
  norek?: string;
  atasNama?: string;
  gajiPokok?: string;
  uangMakan?: string;
  tunjanganJabatan?: string;
  NIK?: string;
}

type Department = { id: number; name: string };

interface Props {
  initialData: EditPegawaiData;
  onSubmit?: (data: EditPegawaiData) => void;
}

export default function EditPegawaiForm({ initialData, onSubmit }: Props) {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<EditPegawaiData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/department")
      .then(res => res.json())
      .then(json => setDepartments(Array.isArray(json) ? json : json.data || []));
  }, []);

  useEffect(() => {
    if (!initialData || departments.length === 0) return;

    let deptId = initialData.departmentId || "";

    if (!deptId && initialData.department) {
      const dept = departments.find(d => d.name === initialData.department);
      if (dept) deptId = dept.id;
    }

    const departmentName = deptId
      ? departments.find(d => d.id === deptId)?.name || ""
      : "";

    setForm(prev => ({
      ...prev,
      ...initialData,
      departmentId: deptId,
      department: departmentName
    }));
  }, [initialData, departments]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e: any) => {
    const deptId = e.target.value;
    const selectedDept = departments.find(dep => dep.id === deptId || dep.id === Number(deptId));
    setForm({
      ...form,
      departmentId: deptId,
      department: selectedDept ? selectedDept.name : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const id = form.id;
    if (!id) {
      setMsg("ID pegawai tidak ditemukan.");
      setSaving(false);
      return;
    }
    const res = await fetch(`/api/employee/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMsg("Berhasil update data pegawai.");
      if (onSubmit) onSubmit(form);
      setTimeout(() => {
        router.push("/dashboardAdmin/pegawai");
      }, 800);
    } else {
      setMsg("Gagal update data pegawai.");
    }
    setSaving(false);
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 520, mx: "auto", mt: 6, p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} color="#20653a" mb={3}>
        Edit Data Pegawai
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nama"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Username"
          name="username"
          value={form.username}
          disabled
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          type="email"
          onChange={handleChange}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="departemen-label">Departemen</InputLabel>
          <Select
            labelId="departemen-label"
            name="departmentId"
            value={form.departmentId || ""}
            label="Departemen"
            onChange={handleDepartmentChange}
            fullWidth
          >
            <MenuItem value="">Pilih Departemen</MenuItem>
            {departments.map(dep => (
              <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="No. HP"
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tanggal Lahir"
          name="birthdate"
          type="date"
          value={form.birthdate || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Alamat"
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="No. Rekening"
          name="norek"
          value={form.norek || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Atas Nama"
          name="atasNama"
          value={form.atasNama || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Gaji Pokok"
          name="gajiPokok"
          type="number"
          value={form.gajiPokok || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Uang Makan / Hari"
          name="uangMakan"
          type="number"
          value={form.uangMakan || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tunjangan Jabatan"
          name="tunjanganJabatan"
          type="number"
          value={form.tunjanganJabatan || ""}
          onChange={handleChange}
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
              px: 4,
              "&:hover": { bgcolor: "#d1d5db" }
            }}
            onClick={() => router.push("/dashboardAdmin/pegawai")}
            disabled={saving}
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
