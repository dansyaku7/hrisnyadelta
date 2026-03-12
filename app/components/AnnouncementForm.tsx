"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";

const CkRichTextEditor = dynamic(() => import("@/app/components/CkRichTextEditor"), { ssr: false });

type Department = {
  id: number;
  name: string;
};
type Announcement = {
  title: string;
  content: string;
  expiredAt: string;
  priority: "tinggi" | "sedang" | "rendah";
  target: "ALL" | number[]; 
};

interface Props {
  mode: "tambah" | "edit";
  initialData?: Announcement;
}

function getSafeForm(data?: Partial<Announcement>): Announcement {
  return {
    title: data?.title ?? "",
    content: data?.content ?? "",
    expiredAt: data?.expiredAt ?? "",
    priority: data?.priority ?? "sedang",
    target: data?.target ?? "ALL",
  };
}

export default function AnnouncementForm({ mode, initialData }: Props) {
  const [form, setForm] = useState<Announcement>(() => getSafeForm(initialData));
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetch("/api/department")
      .then(res => res.json())
      .then(json => {
        setDepartments(Array.isArray(json) ? json : []);
      })
      .catch(() => setDepartments([]))
      .finally(() => setDeptLoading(false));
  }, []);

  useEffect(() => {
    setForm(getSafeForm(initialData));
  }, [initialData]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const userRes = await fetch("/api/me");
    const user = await userRes.json();

    // Convert expiredAt to MySQL 'YYYY-MM-DD' string
    let expiredAtStr = "";
    if (form.expiredAt) {
      // Bisa dari input type="date" => sudah 'YYYY-MM-DD', jika tidak convert dulu
      if (form.expiredAt.length > 10) {
        // Misal: "2025-08-21T00:00:00.000Z"
        expiredAtStr = form.expiredAt.slice(0, 10);
      } else {
        expiredAtStr = form.expiredAt;
      }
    }

    // Target: jika array, pastikan INT semua
    let targetPayload: string | number[] = "ALL";
    if (form.target !== "ALL" && Array.isArray(form.target)) {
      // Convert string[] (dari checkbox) ke number[]
      targetPayload = (form.target as any[]).map((x) => typeof x === "string" ? parseInt(x) : x).filter(Boolean);
      if (!targetPayload.length) targetPayload = "ALL";
    } else if (form.target === "ALL") {
      targetPayload = "ALL";
    }

    const url =
      mode === "edit"
        ? `/api/announcements/${params.id}`
        : `/api/announcements`;

    const payload = {
      title: form.title,
      content: form.content,
      expiredAt: expiredAtStr,
      priority: form.priority,
      target: targetPayload,
      [mode === "edit" ? "updatedBy" : "createdBy"]: user.name,
    };

    const res = await fetch(url, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // coba baca error dari response
      let msg = "Gagal menyimpan pengumuman";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {}
      throw new Error(msg);
    }
    router.push("/dashboardAdmin/pengumuman");
  } catch (err: any) {
    setError(err.message || "Terjadi kesalahan.");
  }
  setLoading(false);
};


const handleTargetChange = (val: number | "ALL") => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (val === "ALL") {
    setForm(f => ({
      ...f,
      target: e.target.checked ? "ALL" : [],
    }));
  } else {
    let curr = form.target === "ALL" ? [] : Array.isArray(form.target) ? [...form.target] : [];
    if (e.target.checked) {
      if (!curr.includes(val as number)) curr.push(val as number);
    } else {
      curr = curr.filter(t => t !== val);
    }
    setForm(f => ({
      ...f,
      target: curr.length === 0 ? "ALL" : curr,
    }));
  }
};

const isTargetChecked = (val: number | "ALL") => {
  if (form.target === "ALL") return val === "ALL";
  if (Array.isArray(form.target)) return form.target.includes(val as number);
  return false;
};

  return (
    <Paper elevation={4} sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 5, borderRadius: 3 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
        sx={{ color: "#20653a" }}
      >
        {mode === "tambah" ? "Tambah Pengumuman" : "Edit Pengumuman"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>

        <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
          <TextField
            id="title"
            label="Judul Pengumuman"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            fullWidth
            disabled={loading}
            size="medium"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
              sx: { fontWeight: "bold", color: "#20653a", background: "#fff", px: 0.5 }
            }}
            sx={{
              "& label": {
                fontWeight: "bold",
                color: "#20653a"
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel sx={{ mb: 1, fontWeight: "bold", color: "#20653a" }}>Isi Pengumuman</FormLabel>
          <CkRichTextEditor
            value={form.content}
            onChange={val => setForm(f => ({ ...f, content: val }))}
            disabled={loading}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
          <TextField
            id="expiredAt"
            type="date"
            label="Tanggal Kadaluarsa"
            value={form.expiredAt}
            onChange={e => setForm(f => ({ ...f, expiredAt: e.target.value }))}
            required
            disabled={loading}
            fullWidth
            InputLabelProps={{
              shrink: true,
              sx: { fontWeight: "bold", color: "#20653a", background: "#fff", px: 0.5 }
            }}
            sx={{
              "& label": {
                fontWeight: "bold",
                color: "#20653a"
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel
            shrink
            id="priority-label"
            sx={{ fontWeight: "bold", color: "#20653a", background: "#fff", px: 0.5 }}
          >
            Prioritas
          </InputLabel>
          <Select
            labelId="priority-label"
            id="priority"
            value={form.priority}
            label="Prioritas"
            onChange={e => setForm(f => ({ ...f, priority: e.target.value as Announcement["priority"] }))}
            required
            disabled={loading}
            sx={{
              "& .MuiSelect-select": { color: "#20653a", fontWeight: "bold" },
              "& fieldset": { borderColor: "#20653a" }
            }}
          >
            <MenuItem value="tinggi">Tinggi</MenuItem>
            <MenuItem value="sedang">Sedang</MenuItem>
            <MenuItem value="rendah">Rendah</MenuItem>
          </Select>
        </FormControl>

       <FormControl component="fieldset" margin="normal" fullWidth>
  <FormLabel>Target Departemen</FormLabel>
  {deptLoading ? (
    <CircularProgress size={20} />
  ) : departments.length === 0 ? (
    <Typography variant="body2">Tidak ada department</Typography>
  ) : (
    <FormGroup row>
      <FormControlLabel
        control={
          <Checkbox
            checked={isTargetChecked("ALL")}
            onChange={handleTargetChange("ALL")}
            name="allDept"
          />
        }
        label="Semua"
      />
      {departments.map((dept) => (
        <FormControlLabel
          key={dept.id}
          control={
            <Checkbox
              checked={isTargetChecked(dept.id)}
              onChange={handleTargetChange(dept.id)}
              name={`dept-${dept.id}`}
              disabled={form.target === "ALL"}
            />
          }
          label={dept.name}
        />
      ))}
    </FormGroup>
  )}
</FormControl>


        {error && (
          <Typography mb={2} color="#b91c1c" fontWeight="bold">
            {error}
          </Typography>
        )}

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
            onClick={() => router.push("/dashboardAdmin/pengumuman")}
            disabled={loading}
          >
            Batal
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
