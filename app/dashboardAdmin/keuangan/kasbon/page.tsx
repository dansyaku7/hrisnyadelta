"use client";
import { useEffect, useState } from "react";
import { FiEye, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Button, Select, MenuItem, TextField, FormControl, InputLabel
} from "@mui/material";

type KasbonRow = {
  id: number;             
  employee_id: string;
  employee_name: string;
  department: string;
  tanggal_pengajuan: string;
  jumlah_pinjaman: number;
  sisa_pinjaman: number;
  status: string;
};

export default function KasbonPage() {
  const [data, setData] = useState<KasbonRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetch("/api/department")
      .then(res => res.json())
      .then(json => setDepartments(json.data || []));
  }, []);

  useEffect(() => {
    fetchKasbon();
    // eslint-disable-next-line
  }, []);

  async function fetchKasbon() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchNama) params.set("searchNama", searchNama);
      if (statusFilter) params.set("status", statusFilter);
      if (department) params.set("departmentId", department);

      const res = await fetch(`/api/kasbon?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal fetch kasbon");
      setData(json.data || []);
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const getDepartmentName = (id: string) => {
    return departments.find(dept => dept.id === id)?.name || '-';
  };

  function statusBadge(status: string) {
    if (status === "approved")
      return <span style={{
        background: "#dcfce7", color: "#166534", fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 8
      }}>Approved</span>;
    if (status === "rejected")
      return <span style={{
        background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 8
      }}>Rejected</span>;
    if (status === "pending")
      return <span style={{
        background: "#fef08a", color: "#b45309", fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 8
      }}>Pending</span>;
    return <span style={{
      background: "#f3f4f6", color: "#444", fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 8
    }}>{status}</span>;
  }

  function handleApprove(row: KasbonRow) {
    if (!confirm(`Yakin ingin APPROVE kasbon ${row.employee_name} sejumlah Rp ${Number(row.jumlah_pinjaman).toLocaleString("id-ID")}?`)) return;
    fetch(`/api/kasbon/${row.id}/approve`, { method: "PATCH" })
      .then(res => res.json())
      .then(() => fetchKasbon());
  }

  function handleReject(row: KasbonRow) {
    if (!confirm(`Tolak pengajuan kasbon dari ${row.employee_name}?`)) return;
    fetch(`/api/kasbon/${row.id}/reject`, { method: "PATCH" })
      .then(res => res.json())
      .then(() => fetchKasbon());
  }

  function handleDelete(row: KasbonRow) {
    if (!confirm("Hapus data kasbon ini?")) return;
    fetch(`/api/kasbon/${row.id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => fetchKasbon());
  }

  function goToDetail(row: KasbonRow) {
    window.location.href = `/dashboardAdmin/keuangan/kasbon/${row.id}`;
  }

  const sortedData = [...data].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0; 
  });

  const pagedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
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
        Daftar Kasbon Pegawai
      </Typography>

      <Paper sx={{ p: 2, mt: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "end" }}>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Department</Typography>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Semua</MenuItem>
                {departments.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Cari Nama</Typography>
            <TextField
              size="small"
              value={searchNama}
              onChange={e => setSearchNama(e.target.value)}
              placeholder="Nama pegawai"
              sx={{ minWidth: 170, background: "white" }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Status</Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              height: 40,
              px: 3,
              minWidth: 100,
              ml: 1,
              "&:hover": { bgcolor: "#166534" }
            }}
            onClick={fetchKasbon}
            disabled={loading}
          >
            {loading ? "Loading..." : "Cari"}
          </Button>
        </Box>
        {error && <Typography sx={{ color: "#b91c1c", mt: 2 }}>{error}</Typography>}
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No.</TableCell>
                <TableCell sx={headerCellStyle}>Nama Pegawai</TableCell>
                <TableCell sx={headerCellStyle}>Department</TableCell>
                <TableCell sx={headerCellStyle}>Tanggal Pengajuan</TableCell>
                <TableCell sx={headerCellStyle}>Jumlah Pinjaman</TableCell>
                <TableCell sx={headerCellStyle}>Sisa Pinjaman</TableCell>
                <TableCell sx={headerCellStyle}>Status</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell style={{
                      maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{row.employee_name}</TableCell>
                    <TableCell style={{
                      maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{row.department}</TableCell>
                    <TableCell>{row.tanggal_pengajuan}</TableCell>
                    <TableCell>Rp {Number(row.jumlah_pinjaman || 0).toLocaleString("id-ID")}</TableCell>
                    <TableCell>Rp {Number(row.sisa_pinjaman || 0).toLocaleString("id-ID")}</TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {row.status === "pending" && (
                          <>
                            <Button
                              size="small"
                              sx={{
                                minWidth: 0, p: "4px", bgcolor: "#dcfce7", color: "#166534", borderRadius: 2,
                                "&:hover": { bgcolor: "#bbf7d0" }
                              }}
                              title="Approve"
                              onClick={() => handleApprove(row)}
                            >
                              <FiCheck />
                            </Button>
                            <Button
                              size="small"
                              sx={{
                                minWidth: 0, p: "4px", bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2,
                                "&:hover": { bgcolor: "#fecaca" }
                              }}
                              title="Reject"
                              onClick={() => handleReject(row)}
                            >
                              <FiX />
                            </Button>
                          </>
                        )}
                        <Button
                          size="small"
                          sx={{
                            minWidth: 0, p: "4px", bgcolor: "#e0f2fe", color: "#06b6d4", borderRadius: 2,
                            "&:hover": { bgcolor: "#bae6fd" }
                          }}
                          title="Detail"
                          onClick={() => goToDetail(row)}
                        >
                          <FiEye />
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          sx={{
                            minWidth: 0, p: "4px", bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2,
                            "&:hover": { bgcolor: "#fecaca" }
                          }}
                          title="Hapus"
                          onClick={() => handleDelete(row)}
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
