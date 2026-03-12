"use client";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
  CircularProgress
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type CutiDetail = {
  id: number;
  employee_name?: string;
  department_name?: string;
  jenis?: string;
  tgl_mulai?: string;
  tgl_selesai?: string;
  lama?: number;
  alasan?: string;
  status?: string;
};

function statusLabel(status?: string) {
  if (!status) return "-";
  if (status === "approved") return "Disetujui";
  if (status === "pending") return "Pending";
  if (status === "rejected") return "Ditolak";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DetailCutiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState<CutiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/cuti/${id}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Memuat data...</Typography>
      </Box>
    );
  }
  if (!data) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">Data cuti tidak ditemukan.</Typography>
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 450,
        mx: "auto",
        mt: 4,
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
      }}
    >
      <Typography
        fontWeight="bold"
        fontSize={28}
        sx={{
          color: "#20653a",
          borderRadius: 2,
          px: 2,
          py: 1,
          display: "inline-block",
          letterSpacing: 0.5,
        }}
      >
        Detail Cuti Pegawai
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2, width: 180 }}>
              Nama : <span style={{ fontWeight: 400 }}>{data.employee_name || "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Departemen : <span style={{ fontWeight: 400 }}>{data.department_name || "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Jenis Cuti : <span style={{ fontWeight: 400 }}>{data.jenis || "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Tanggal Mulai : <span style={{ fontWeight: 400 }}>{data.tgl_mulai || "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Tanggal Selesai : <span style={{ fontWeight: 400 }}>{data.tgl_selesai || "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Lama : <span style={{ fontWeight: 400 }}>{typeof data.lama === "number" ? `${data.lama} hari` : "-"}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Status : <span style={{ fontWeight: 400 }}>{statusLabel(data.status)}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Alasan : <span style={{ fontWeight: 400 }}>{data.alasan || "-"}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
        onClick={() => router.back()}
      >
        Kembali
      </Button>
    </Paper>
  );
}
