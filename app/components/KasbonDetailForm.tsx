"use client";
import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";

export type KasbonDetail = {
  id: number;
  employeeName: string;
  employeeId: number;
  department: string;
  departmentId: number;
  tanggalPengajuan: string;
  jumlahPinjaman: number;
  alasan: string;
  status: string;
  sisaPinjaman: number;
  cicilanPerBulan?: number;
};

type Props = {
  kasbon: KasbonDetail;
  onCancel: () => void;
};

export default function KasbonDetailForm({ kasbon, onCancel }: Props) {
  // Fungsi untuk kapitalisasi status
  const statusLabel = (s: string) => {
    if (!s) return "-";
    if (s.toLowerCase() === "approved") return "Disetujui";
    if (s.toLowerCase() === "pending") return "Pending";
    if (s.toLowerCase() === "rejected") return "Ditolak";
    if (s.toLowerCase() === "cicil") return "Cicil";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

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
        Detail Kasbon Pegawai
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2, width: 200 }}>
              Nama : <span style={{ fontWeight: 400 }}>{kasbon.employeeName}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Department : <span style={{ fontWeight: 400 }}>{kasbon.department}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Tanggal Pengajuan : <span style={{ fontWeight: 400 }}>{kasbon.tanggalPengajuan}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Jumlah Pinjaman : <span style={{ fontWeight: 400 }}>Rp {Number(kasbon.jumlahPinjaman).toLocaleString("id-ID")}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Sisa Pinjaman : <span style={{ fontWeight: 400 }}>Rp {Number(kasbon.sisaPinjaman).toLocaleString("id-ID")}</span>
            </TableCell>
          </TableRow>
          {kasbon.cicilanPerBulan !== undefined && (
            <TableRow>
              <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
                Cicilan Per Bulan : <span style={{ fontWeight: 400 }}>Rp {Number(kasbon.cicilanPerBulan).toLocaleString("id-ID")}</span>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Status Pengajuan : <span style={{ fontWeight: 400 }}>{statusLabel(kasbon.status)}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, border: 0, pr: 2 }}>
              Alasan : <span style={{ fontWeight: 400 }}>{kasbon.alasan}</span>
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
        onClick={onCancel}
      >
        Kembali
      </Button>
    </Paper>
  );
}
