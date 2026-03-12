"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, TablePagination
} from "@mui/material";

type LiburNasional = {
  id: number;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
};

function formatTanggal(tgl: string) {
  if (!tgl) return "-";
  // Tidak perlu parsing ke Date jika sudah format YYYY-MM-DD
  // Namun untuk tampilan lokal Indo:
  try {
    // Pakai split biar gak terdeteksi sebagai UTC
    const [y, m, d] = tgl.split("-");
    return `${d}-${m}-${y}`;
  } catch { return tgl; }
}

export default function LiburNasionalPage() {
  const [data, setData] = useState<LiburNasional[]>([]);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch data libur dari SQL
  async function fetchLibur() {
    const res = await fetch("/api/libur-nasional");
    const json = await res.json();
    setData(json.data || []);
  }

  useEffect(() => { fetchLibur(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErrMsg(""); setSuccess("");
    try {
      if (!tanggal || !keterangan) throw new Error("Semua field wajib diisi");
      let url = "/api/libur-nasional";
      let method = "POST";
      let body: any = { tanggal, keterangan };
      if (editId) {
        url = `/api/libur-nasional/${editId}`;
        method = "PATCH";
        body = { id: editId, tanggal, keterangan };
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal simpan");
      setSuccess(editId ? "Berhasil update hari libur" : "Berhasil tambah hari libur");
      setTanggal(""); setKeterangan(""); setEditId(null);
      fetchLibur();
    } catch (err: any) {
      setErrMsg(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("Hapus hari libur ini?")) return;
    setLoading(true);
    await fetch(`/api/libur-nasional/${id}`, { method: "DELETE" });
    fetchLibur();
    setLoading(false);
  }

  function onEdit(l: LiburNasional) {
    setTanggal(l.tanggal);
    setKeterangan(l.keterangan);
    setEditId(l.id);
    setSuccess("");
    setErrMsg("");
  }

  function cancelEdit() {
    setTanggal(""); setKeterangan(""); setEditId(null);
    setErrMsg(""); setSuccess("");
  }

  // Pagination slice
  const pagedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Header style
  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      {/* Judul */}
      <Typography
        fontWeight="bold"
        fontSize={32}
        sx={{
          mt: 2,
          color: "white",
          letterSpacing: 0.5,
          background: "#20653a",
          borderRadius: 3,
          px: 4,
          py: 2,
          display: "inline-block"
        }}
      >
        Manajemen Hari Libur
      </Typography>

      {/* Form Tambah/Edit */}
      <Paper sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <Box
          component="form"
          onSubmit={submit}
          sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}
        >
          <TextField
            type="date"
            value={tanggal}
            size="small"
            onChange={e => setTanggal(e.target.value)}
            label="Tanggal"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 130 }}
          />
          <TextField
            value={keterangan}
            size="small"
            onChange={e => setKeterangan(e.target.value)}
            label="Keterangan"
            sx={{ minWidth: 170 }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#20653a", color: "#fff", fontWeight: "bold",
              borderRadius: 2, px: 2, display: "flex", gap: 1, minWidth: 110,
              "&:hover": { bgcolor: "#166534" }
            }}
            startIcon={<FiPlus />}
            disabled={loading}
          >
            {editId ? "Update" : "Tambah"}
          </Button>
          {editId && (
            <Button
              type="button"
              variant="outlined"
              sx={{ borderRadius: 2, px: 2 }}
              onClick={cancelEdit}
            >
              Batal
            </Button>
          )}
        </Box>
        {errMsg && <Typography sx={{ color: "#b91c1c", mb: 1 }}>{errMsg}</Typography>}
        {success && <Typography sx={{ color: "#166534", mb: 1 }}>{success}</Typography>}
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>Tanggal</TableCell>
                <TableCell sx={headerCellStyle}>Keterangan</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.map(libur => (
                <TableRow key={libur.id}>
                  <TableCell>{formatTanggal(libur.tanggal)}</TableCell>
                  <TableCell sx={{
                    maxWidth: 180,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{libur.keterangan}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Button
                        size="small"
                        sx={{
                          minWidth: 0, p: "4px", color: "#06b6d4", borderRadius: 2,
                          "&:hover": { bgcolor: "#bae6fd" }
                        }}
                        title="Edit"
                        onClick={() => onEdit(libur)}
                      >
                        <FiEdit size={18} />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{
                          minWidth: 0, p: "4px",color: "#b91c1c", borderRadius: 2,
                          "&:hover": { bgcolor: "#fecaca" }
                        }}
                        title="Hapus"
                        onClick={() => onDelete(libur.id)}
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {pagedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: "#94a3b8" }}>
                    Belum ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
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
