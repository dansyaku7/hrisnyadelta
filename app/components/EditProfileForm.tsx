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

interface EmployeeProfile {
  name: string;
  NIK: string;
  email: string;
  phone: string;
  birthdate: string;
  norek: string;
  atasNama: string;
  department: string;
  departmentId?: string;
  address: string;
}
type Department = { _id: string; name: string };
interface Props {
  initialData?: EmployeeProfile;
  onSubmit?: (data: EmployeeProfile) => void;
}

export default function EditProfileForm({ initialData, onSubmit }: Props) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profile, setProfile] = useState<EmployeeProfile>({
    name: "",
    NIK: "",
    email: "",
    phone: "",
    birthdate: "",
    norek: "",
    atasNama: "",
    department: "",
    departmentId: "",
    address: "",
    ...(initialData || {}),
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    fetch("/api/department")
      .then(res => res.json())
      .then(json => setDepartments(json.data || []));
  }, []);

  // Set initial profile data when departments are loaded and initialData exists
  useEffect(() => {
    if (!initialData) return;
    if (departments.length === 0) return;

    let deptId = initialData.departmentId || "";
    if (!deptId && initialData.department) {
      const dept = departments.find(d => d.name === initialData.department);
      if (dept) deptId = dept._id;
    }
    setProfile(prev => ({
      ...prev,
      ...initialData,
      departmentId: deptId,
    }));
    // eslint-disable-next-line
  }, [initialData, departments]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((f) => ({ ...f, [name]: value }));
  };

  const handleDepartmentChange = (e: any) => {
    const deptId = e.target.value;
    const selectedDept = departments.find(dep => dep._id === deptId);
    setProfile((f) => ({
      ...f,
      departmentId: deptId,
      department: selectedDept ? selectedDept.name : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Menyimpan...");
    setLoading(true);

    const res = await fetch("/api/employee/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      setMsg("Berhasil update profil");
      if (onSubmit) onSubmit(profile);
      setTimeout(() => {
        router.push("/dashboardAdmin");
      }, 800);
    } else {
      setMsg("Gagal update profil");
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Paper elevation={4} sx={{ maxWidth: 520, mx: "auto", mt: 6, p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} color="#20653a" mb={3}>
        Edit Profil
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nama"
          name="name"
          value={profile.name}
          onChange={handleChange}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={profile.email}
          disabled
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="NIK"
          name="NIK"
          value={profile.NIK}
          onChange={handleChange}
          fullWidth
          required
          inputProps={{ maxLength: 20 }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="No. HP"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tanggal Lahir"
          name="birthdate"
          type="date"
          value={profile.birthdate || ""}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Alamat"
          name="address"
          value={profile.address}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="departemen-label" shrink>
            Departemen
          </InputLabel>
          <Select
            labelId="departemen-label"
            name="departmentId"
            value={profile.departmentId || ""}
            label="Departemen"
            onChange={handleDepartmentChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">
              <em>Pilih Departemen</em>
            </MenuItem>
            {departments.map(dep => (
              <MenuItem key={dep._id} value={dep._id}>
                {dep.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="No. Rekening"
          name="norek"
          value={profile.norek}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Atas Nama"
          name="atasNama"
          value={profile.atasNama}
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
            disabled={loading}
          >
            Simpan
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
            onClick={() => router.push("/dashboardAdmin")}
            disabled={loading}
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
