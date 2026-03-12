"use client";
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  TablePagination,
  Button,
} from "@mui/material";

type Overtime = {
  id: number;
  employee_name: string;
  department: string;
  tanggal: string;
  start_time: string;
  end_time: string;
  alasan: string;
  status: string;
};
type Department = { id: number; name: string };

export default function OvertimePage() {
  const [data, setData] = useState<Overtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/overtime");
    const json = await res.json();
    setData(json.data || []);

    const resDept = await fetch("/api/department");
    const jsonDept = await resDept.json();
    setDepartments(jsonDept.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getDepartmentName = (id: number | string) =>
    departments.find(dept => dept.id === id || String(dept.id) === String(id))?.name || "-";

  const handleEdit = (id: number) => router.push(`/dashboardAdmin/overtime/edit/${id}`);
  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin hapus data lembur ini?")) return;
    await fetch(`/api/overtime/${id}`, { method: "DELETE" });
    fetchData();
  };
  const handleApprove = async (id: number) => {
    if (!window.confirm("Yakin Approve?")) return;
    await fetch(`/api/overtime/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    fetchData();
  };
  const handleReject = async (id: number) => {
    if (!window.confirm("Yakin Reject?")) return;
    await fetch(`/api/overtime/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    fetchData();
  };
  const hitungDurasi = (start: string, end: string) => {
    if (!start || !end) return "-";
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    let dur = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (dur < 0) dur += 24;
    return `${dur % 1 === 0 ? dur : dur.toFixed(1)} Jam`;
  };

  const sortedData = [...data].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0; 
  });

  const pagedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  return (
    <Box>
      {/* Judul putih di atas */}
      <Typography
        fontWeight="bold"
        fontSize={32}
        sx={{
          mt: 4,
          mb: 3,
          color: "white",
          letterSpacing: 0.5,
          background: "#20653a",
          borderRadius: 3,
          px: 4,
          py: 2,
          display: "inline-block"
        }}
      >
        Data Overtime Pegawai
      </Typography>

      {/* Table Overtime */}
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No</TableCell>
                <TableCell sx={headerCellStyle}>Nama Pegawai</TableCell>
                <TableCell sx={headerCellStyle}>Departemen</TableCell>
                <TableCell sx={headerCellStyle}>Tanggal</TableCell>
                <TableCell sx={headerCellStyle}>Jam Mulai</TableCell>
                <TableCell sx={headerCellStyle}>Jam Selesai</TableCell>
                <TableCell sx={headerCellStyle}>Durasi</TableCell>
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
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data lembur.
                  </TableCell>
                </TableRow>
              ) : pagedData.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell sx={{
                    maxWidth: 140, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {row.employee_name}
                  </TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.tanggal?.slice(0, 10)}</TableCell>
                  <TableCell>{row.start_time}</TableCell>
                  <TableCell>{row.end_time}</TableCell>
                  <TableCell>{hitungDurasi(row.start_time, row.end_time)}</TableCell>
                  <TableCell sx={{
                    maxWidth: 210, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {row.alasan}
                  </TableCell>
                  <TableCell>
                    <span style={{
                      padding: "2px 10px",
                      borderRadius: 8,
                      fontWeight: "bold",
                      fontSize: 13,
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
                      <Button
                        size="small"
                        sx={{
                          minWidth: 0,
                          p: "4px",
                          color: "#06b6d4",
                          borderRadius: 2,
                        }}
                        title="Edit"
                        onClick={() => handleEdit(row.id)}
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{
                          minWidth: 0,
                          p: "4px",
                          color: "#b91c1c",
                          borderRadius: 2,
                        }}
                        title="Hapus"
                        onClick={() => handleDelete(row.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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
    </Box>
  );
}
