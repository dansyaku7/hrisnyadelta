"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography
} from "@mui/material";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Shift = {
  id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
  days?: string[] | string; 
};

export default function ShiftPage() {
  const [loading, setLoading] = useState(true);
  const [shiftData, setShiftData] = useState<Shift[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/shift");
      const data = await res.json();
      setShiftData(Array.isArray(data) ? data : data.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleEdit = (id: number) => {
    window.location.href = `/dashboardAdmin/shift/edit/${id}`;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin hapus shift ini?")) return;
    await fetch(`/api/shift/${id}`, { method: "DELETE" });
    setShiftData(s => s.filter(d => d.id !== id));
  };

  const pagedData = shiftData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Header style
  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  // Helper: Format days (array atau string dari DB)
  function formatDays(days: any) {
    if (!days) return "-";
    if (Array.isArray(days)) return days.join(", ");
    if (typeof days === "string") return days;
    return "-";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Judul dan tambah */}
      <Typography
        fontWeight="bold"
        fontSize={32}
        sx={{
          mt: 4,
          color: "white",
          letterSpacing: 0.5,
          background: "#20653a",
          borderRadius: 3,
          px: 4,
          py: 2,
          display: "inline-block"
        }}
      >
        Daftar Shift
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>List Shift</div>
          <Link href="/dashboardAdmin/shift/tambah">
            <Button
              variant="contained"
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: "#20653a",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#166534" }
              }}
            >
              + Tambah Shift
            </Button>
          </Link>
        </div>
        <TableContainer sx={{ borderRadius: 2, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No</TableCell>
                <TableCell sx={headerCellStyle}>Nama Shift</TableCell>
                <TableCell sx={headerCellStyle}>Jam Masuk</TableCell>
                <TableCell sx={headerCellStyle}>Jam Pulang</TableCell>
                <TableCell sx={headerCellStyle}>Istirahat Mulai</TableCell>
                <TableCell sx={headerCellStyle}>Istirahat Selesai</TableCell>
                <TableCell sx={headerCellStyle}>Hari Berlaku</TableCell>
                <TableCell sx={headerCellStyle} align="left">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Memuat data...</TableCell>
                </TableRow>
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Tidak ada shift.</TableCell>
                </TableRow>
              ) : (
                pagedData.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.name}
                    </TableCell>
                    <TableCell>{row.start_time || "-"}</TableCell>
                    <TableCell>{row.end_time || "-"}</TableCell>
                    <TableCell>{row.break_start || "-"}</TableCell>
                    <TableCell>{row.break_end || "-"}</TableCell>
                    <TableCell style={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formatDays(row.days)}
                    </TableCell>
                    <TableCell align="left">
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button size="small" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleEdit(row.id)}>
                          <FiEdit />
                        </Button>
                        {!(row.name?.toLowerCase() === "kantor" || row.name?.toLowerCase() === "office") && (
                          <Button size="small" color="error" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleDelete(row.id)}>
                            <FiTrash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={shiftData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
