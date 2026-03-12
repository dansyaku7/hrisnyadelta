"use client";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";

type PayrollDetailProps = {
  payroll: {
    employee_name: string;
    department_name: string;
    periode_mulai: string;
    periode_akhir: string;
    NIK?: string;
    gaji_pokok?: number | string;
    total_uang_makan?: number | string;
    tunjangan_jabatan?: number | string;
    tunjangan_lembur?: number | string;
    tunjangan_lain?: number | string;
    thr_bonus?: number | string;
    potongan_bpjs?: number | string;
    potongan_pajak?: number | string;
    potongan_kasbon?: number | string;
    status?: string;
    takeHomePay?: number | string;
    [key: string]: any;
  };
};

function safeNumber(val: any) {
  if (val === null || val === undefined || val === "") return 0;
  return typeof val === "string" ? Number(val.replace(/[^0-9.-]/g, "")) : Number(val);
}

function formatRp(value: any) {
  return `Rp ${safeNumber(value).toLocaleString("id-ID")}`;
}

function hitungTakeHomePay(row: any) {
  return (
    safeNumber(row.gaji_pokok) +
    safeNumber(row.total_uang_makan) +
    safeNumber(row.tunjangan_jabatan) +
    safeNumber(row.tunjangan_lembur) +
    safeNumber(row.tunjangan_lain) +
    safeNumber(row.thr_bonus) -
    safeNumber(row.potongan_bpjs) -
    safeNumber(row.potongan_pajak) -
    safeNumber(row.potongan_kasbon)
  );
}

export default function PayrollDetail({ payroll }: PayrollDetailProps) {
  const router = useRouter();

  if (!payroll)
    return (
      <Typography
        textAlign="center"
        py={8}
        color="text.secondary"
        variant="body1"
      >
        Data payroll tidak ditemukan.
      </Typography>
    );

  const takeHomePay = payroll.takeHomePay ?? hitungTakeHomePay(payroll);

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 4,
        mt: 10,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        color="primary.main"
        textAlign="center"
      >
        Detail Payroll
      </Typography>
      <Table size="small" aria-label="Detail payroll">
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Nama</TableCell>
            <TableCell>{payroll.employee_name}</TableCell>
          </TableRow>
          {payroll.NIK && (
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>NIK</TableCell>
              <TableCell>{payroll.NIK}</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
            <TableCell>{payroll.department_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Periode</TableCell>
            <TableCell>
              {payroll.periode_mulai} s/d {payroll.periode_akhir}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell>
              <span style={{
                fontWeight: 600,
                color:
                  payroll.status === "published" ? "#166534"
                    : payroll.status === "unpublished" ? "#b45309"
                    : "#444"
              }}>
                {payroll.status === "published" ? "Published"
                  : payroll.status === "unpublished" ? "Unpublished"
                  : (payroll.status || "-")}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Gaji Pokok</TableCell>
            <TableCell>{formatRp(payroll.gaji_pokok)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Total Uang Makan</TableCell>
            <TableCell>{formatRp(payroll.total_uang_makan)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Tunjangan Jabatan</TableCell>
            <TableCell>{formatRp(payroll.tunjangan_jabatan)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Tunjangan Lembur</TableCell>
            <TableCell>{formatRp(payroll.tunjangan_lembur)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Tunjangan Lain-lain</TableCell>
            <TableCell>{formatRp(payroll.tunjangan_lain)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>THR / Bonus</TableCell>
            <TableCell>{formatRp(payroll.thr_bonus)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Potongan BPJS</TableCell>
            <TableCell>{formatRp(payroll.potongan_bpjs)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Potongan Pajak</TableCell>
            <TableCell>{formatRp(payroll.potongan_pajak)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Potongan Kasbon</TableCell>
            <TableCell>{formatRp(payroll.potongan_kasbon)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ fontWeight: "bold", fontSize: 16, color: "success.main" }}
            >
              Take Home Pay
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", fontSize: 16, color: "success.main" }}
            >
              {formatRp(takeHomePay)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.back()}
          sx={{
            bgcolor: "#e5e7eb",
            color: "#444",
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": { bgcolor: "#cbd5e1" }
          }}
        >
          Kembali
        </Button>
      </Box>
    </Paper>
  );
}
