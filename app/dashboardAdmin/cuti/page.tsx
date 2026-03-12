"use client";
import { useEffect, useState } from "react";
import { FiEye, FiTrash2, FiCheckCircle, FiXCircle, FiEdit,FiMinusCircle,FiPlusCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

type Cuti = {
  id: number;
  employee_id: number;
  jenis: string;
  tgl_mulai: string;
  tgl_selesai: string;
  lama: number;
  alasan: string;
  status: string;
  employee_name?: string; 
  department_name: string;
};

type JatahCuti = {
  id: number | string;
  employee_id: number | string;
  employee_name: string;
  department: string;
  jatah_cuti: number;
  cuti_terpakai: number;
  sisa_cuti: number;
};

export default function CutiPage() {
  const [cutiData, setCutiData] = useState<Cuti[]>([]);
  const [jatahList, setJatahList] = useState<JatahCuti[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageCuti, setPageCuti] = useState(0);
  const [rowsPerPageCuti, setRowsPerPageCuti] = useState(10);
  const [pageJatah, setPageJatah] = useState(0);
  const [rowsPerPageJatah, setRowsPerPageJatah] = useState(5);
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedJatah, setSelectedJatah] = useState<JatahCuti | null>(null);
  const [editJatah, setEditJatah] = useState(0);
  const [editSisa, setEditSisa] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/cuti");
      const json = await res.json();
      setCutiData(json.data || []);

      const resJatah = await fetch("/api/jatah-cuti");
      const jsonJatah = await resJatah.json();
      setJatahList(jsonJatah.data || []);
      setLoading(false);
    };
    fetchData();
    setMounted(true);
  }, []);

  const handleDetail = (id: number | string) => router.push(`/dashboardAdmin/cuti/detail/${id}`);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Yakin hapus data cuti ini?")) return;
    await fetch(`/api/cuti/${id}`, { method: "DELETE" });
    setCutiData(cutiData.filter(d => d.id !== id));
  };

  const handleApprove = async (id: number | string) => {
    if (!window.confirm("Yakin Approve?")) return;
    const cuti = cutiData.find(d => d.id === id);
    if (!cuti) return alert("Data cuti tidak ditemukan.");

    const jatah = jatahList.find(j => String(j.employee_id) === String(cuti.employee_id));
    if (!jatah) return alert("Data jatah cuti tidak ditemukan berdasarkan pegawai.");

    const idJatah = jatah.id;
    const lamaCuti = cuti.lama;
    const newSisa = jatah.sisa_cuti - lamaCuti;
    const newTerpakai = jatah.cuti_terpakai + lamaCuti;

    if (newSisa < 0) {
      alert("Sisa cuti tidak mencukupi.");
      return;
    }

    await fetch(`/api/jatah-cuti/${idJatah}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sisa_cuti: newSisa,
        cuti_terpakai: newTerpakai,
      }),
    });

    await fetch(`/api/cuti/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });

    setCutiData(prev => prev.map(d => d.id === id ? { ...d, status: "approved" } : d));
    setJatahList(prev => prev.map(j =>
      j.id === idJatah
        ? { ...j, sisa_cuti: newSisa, cuti_terpakai: newTerpakai }
        : j
    ));
  };

  const handleReject = async (id: number | string) => {
    if (!window.confirm("Yakin Reject?")) return;
    await fetch(`/api/cuti/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    setCutiData(cutiData => cutiData.map(d => d.id === id ? { ...d, status: "rejected" } : d));
  };

  const handleOpenEdit = (row: JatahCuti) => {
    setSelectedJatah(row);
    setEditJatah(row.jatah_cuti);
    setEditSisa(row.sisa_cuti);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedJatah(null);
  };

  const handleEditTambah = () => {
    setEditJatah(j => j + 1);
    setEditSisa(s => s + 1);
  };

  const handleEditKurang = () => {
    if (editSisa > 0) {
      setEditJatah(j => j - 1);
      setEditSisa(s => s - 1);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedJatah) return;
    await fetch(`/api/jatah-cuti/${selectedJatah.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sisa_cuti: editSisa,
        jatah_cuti: editJatah,
        cuti_terpakai: selectedJatah.cuti_terpakai ?? 0,
      }),
    });
    setOpenEdit(false);
    window.location.reload();
  };

  const handleRefreshJatahCuti = async () => {
    await fetch("/api/jatah-cuti/refresh", { method: "POST" });
    window.location.reload();
  };

  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  const pagedJatah = jatahList.slice(pageJatah * rowsPerPageJatah, pageJatah * rowsPerPageJatah + rowsPerPageJatah);
  const sortedData = [...cutiData].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  const pagedCuti = sortedData.slice(pageCuti * rowsPerPageCuti, pageCuti * rowsPerPageCuti + rowsPerPageCuti);
  if (!mounted) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Judul Besar, Putih, Background Hijau */}
      <Typography
        fontWeight="bold"
        fontSize={32}
        sx={{
          mt: 3,
          color: "white",
          letterSpacing: 0.5,
          background: "#20653a",
          borderRadius: 3,
          px: 4,
          py: 2,
          display: "inline-block"
        }}
      >
        Data Pengajuan Cuti Pegawai
      </Typography>

      {/* Ringkasan Jatah Cuti Pegawai */}
      <Paper sx={{ p: 2, borderRadius: 4, maxWidth: 800 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: 18,
            color: "#20653a",
            marginBottom: 16,
          }}
        >
          <span>Daftar Jatah Cuti Pegawai</span>
          <button
            className="px-4 py-2 bg-[#20653a] text-white rounded hover:bg-cyan-600 font-semibold"
            onClick={handleRefreshJatahCuti}
          >
            Refresh Jatah Cuti Pegawai
          </button>
        </div>
        <TableContainer sx={{ borderRadius: 2, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No</TableCell>
                <TableCell sx={headerCellStyle}>Nama</TableCell>
                <TableCell sx={headerCellStyle}>Departemen</TableCell>
                <TableCell sx={headerCellStyle}>Jatah</TableCell>
                <TableCell sx={headerCellStyle}>Terpakai</TableCell>
                <TableCell sx={headerCellStyle}>Sisa</TableCell>
                <TableCell sx={headerCellStyle}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedJatah.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data pegawai.
                  </TableCell>
                </TableRow>
              ) : (
                pagedJatah.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{pageJatah * rowsPerPageJatah + idx + 1}</TableCell>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.jatah_cuti}</TableCell>
                    <TableCell>{row.cuti_terpakai}</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: row.sisa_cuti <= 0 ? "#b91c1c" : "#20653a"
                      }}
                    >
                      {row.sisa_cuti}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="secondary"
                        title="Edit Jatah Cuti"
                        onClick={() => handleOpenEdit(row)}
                      >
                        <FiEdit size={18} /> 
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={jatahList.length}
            rowsPerPage={rowsPerPageJatah}
            page={pageJatah}
            onPageChange={(_, newPage) => setPageJatah(newPage)}
            onRowsPerPageChange={e => { setRowsPerPageJatah(parseInt(e.target.value)); setPageJatah(0); }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>

      {/* Table Cuti Utama */}
      <Paper sx={{ p: 2, borderRadius: 4, mb: 2 }}>
        <div style={{ fontWeight: "bold", fontSize: 18, color: "#20653a", marginBottom: 16 }}>
          Daftar Pengajuan Cuti
        </div>
        <TableContainer sx={{ borderRadius: 2, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No</TableCell>
                <TableCell sx={headerCellStyle}>Nama</TableCell>
                <TableCell sx={headerCellStyle}>Departemen</TableCell>
                <TableCell sx={headerCellStyle}>Jenis</TableCell>
                <TableCell sx={headerCellStyle}>Tgl Mulai</TableCell>
                <TableCell sx={headerCellStyle}>Tgl Selesai</TableCell>
                <TableCell sx={headerCellStyle}>Lama</TableCell>
                <TableCell sx={headerCellStyle}>Alasan</TableCell>
                <TableCell sx={headerCellStyle}>Status</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ color: "#94a3b8" }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : pagedCuti.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data cuti.
                  </TableCell>
                </TableRow>
              ) : (
                pagedCuti.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{pageCuti * rowsPerPageCuti + idx + 1}</TableCell>
                    <TableCell style={{
                      maxWidth: 120, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis"
                    }}>{row.employee_name}</TableCell>
                    <TableCell>{row.department_name}</TableCell>
                    <TableCell>{row.jenis}</TableCell>
                    <TableCell>{row.tgl_mulai?.slice(0, 10)}</TableCell>
                    <TableCell>{row.tgl_selesai?.slice(0, 10)}</TableCell>
                    <TableCell>{row.lama} hari</TableCell>
                    <TableCell style={{
                      maxWidth: 200, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis"
                    }}>{row.alasan}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        fontSize: 12,
                        color:
                          row.status === "pending"
                            ? "#b45309"
                            : row.status === "approved"
                              ? "#166534"
                              : row.status === "rejected"
                                ? "#b91c1c"
                                : "#444",
                        background:
                          row.status === "pending"
                            ? "#fef08a"
                            : row.status === "approved"
                              ? "#dcfce7"
                              : row.status === "rejected"
                                ? "#fee2e2"
                                : "#f3f4f6"
                      }}>
                        {row.status === "pending"
                          ? "Pending"
                          : row.status === "approved"
                            ? "Disetujui"
                            : row.status === "rejected"
                              ? "Ditolak"
                              : row.status}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {row.status === "pending" && (
                          <>
                            <Button
                              size="small"
                              sx={{
                                minWidth: 0,
                                p: "4px",
                                bgcolor: "#dcfce7",
                                color: "#166534",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "#bbf7d0" }
                              }}
                              title="Approve"
                              onClick={() => handleApprove(row.id)}
                            >
                              <FiCheckCircle />
                            </Button>
                            <Button
                              size="small"
                              sx={{
                                minWidth: 0,
                                p: "4px",
                                bgcolor: "#fef08a",
                                color: "#b45309",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "#fde047" }
                              }}
                              title="Reject"
                              onClick={() => handleReject(row.id)}
                            >
                              <FiXCircle />
                            </Button>
                          </>
                        )}
                        {row.status === "rejected" && (
                          <Button
                            size="small"
                            sx={{
                              minWidth: 0,
                              p: "4px",
                              bgcolor: "#dcfce7",
                              color: "#166534",
                              borderRadius: 2,
                              "&:hover": { bgcolor: "#bbf7d0" }
                            }}
                            title="Approve"
                            onClick={() => handleApprove(row.id)}
                          >
                            <FiCheckCircle />
                          </Button>
                        )}
                        <Button
                          size="small"
                          sx={{
                            minWidth: 0,
                            p: "4px",
                            bgcolor: "#e0f2fe",
                            color: "#06b6d4",
                            borderRadius: 2,
                            "&:hover": { bgcolor: "#bae6fd" }
                          }}
                          title="Edit"
                          onClick={() => handleDetail(row.id)}
                        >
                          <FiEye />
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          sx={{
                            minWidth: 0,
                            p: "4px",
                            bgcolor: "#fee2e2",
                            color: "#b91c1c",
                            borderRadius: 2,
                            "&:hover": { bgcolor: "#fecaca" }
                          }}
                          title="Hapus"
                          onClick={() => handleDelete(row.id)}
                        >
                          <FiTrash2 />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={cutiData.length}
            rowsPerPage={rowsPerPageCuti}
            page={pageCuti}
            onPageChange={(_, newPage) => setPageCuti(newPage)}
            onRowsPerPageChange={e => { setRowsPerPageCuti(parseInt(e.target.value)); setPageCuti(0); }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Jatah Cuti Pegawai</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nama Pegawai"
            value={selectedJatah?.employee_name || ""}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{mt:2}}
          />
          <TextField
            label="Departemen"
            value={selectedJatah?.department || ""}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="Jatah Cuti"
              value={editJatah}
              InputProps={{ readOnly: true }}
              sx={{ width: 100 }}
            />
            <IconButton
              onClick={handleEditKurang}
              disabled={editSisa <= 0}
              color="error"
              sx={{ border: "1px solid #eee" }}
            >
              <FiMinusCircle />
            </IconButton>
            <IconButton
              onClick={handleEditTambah}
              color="success"
              sx={{ border: "1px solid #eee" }}
            >
              <FiPlusCircle />
            </IconButton>
          </Box>
          <TextField
            label="Sisa Cuti"
            value={editSisa}
            InputProps={{ readOnly: true }}
            sx={{ width: 150 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} sx={{
              bgcolor: "#e5e7eb",
              color: "#20653a",
              fontWeight: "bold",
              borderRadius: 2,
              px: 2,
              "&:hover": { bgcolor: "#d1d5db" }
            }}>Batal</Button>
          <Button onClick={handleSaveEdit} sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              px: 2,
              "&:hover": { bgcolor: "#166534" }
            }}variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
