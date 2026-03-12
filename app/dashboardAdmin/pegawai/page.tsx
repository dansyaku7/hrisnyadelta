"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiEdit, FiKey, FiClock, FiMapPin, FiTrash2, FiPlus } from "react-icons/fi";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TablePagination, Typography
} from "@mui/material";

interface Employee {
  id: number;
  name: string;
  username: string;
  department: string;
  shift: string;
  lokasi: string;
}

type Department = {
  id: number;
  name: string;
  description?: string;
};

export default function PegawaiPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagePeg, setPagePeg] = useState(0);
  const [rowsPerPagePeg, setRowsPerPagePeg] = useState(5);
  const [pageDept, setPageDept] = useState(0);
  const [rowsPerPageDept, setRowsPerPageDept] = useState(5);

  useEffect(() => {
    fetch("/api/employee")
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus pegawai ini?")) return;
    const res = await fetch(`/api/employee/${id}`, { method: "DELETE" });
    if (res.ok) {
      setData(d => d.filter(emp => emp.id !== id));
    }
    await fetch(`/api/jatah-cuti/by-employee/${id}`, { method: "DELETE" });
  };

  const handleDeleteDepart = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus department ini?")) return;
    await fetch(`/api/department/${id}`, { method: "DELETE" });
    fetchDepartments();
  };

  const fetchDepartments = async () => {
    setLoading(true);
    const res = await fetch("/api/department");
    const json = await res.json();
    setDepartments(Array.isArray(json) ? json : json.data || []);
    setLoading(false);
  };

  const handleChangePagePeg = (event: unknown, newPage: number) => {
    setPagePeg(newPage);
  };
  const handleChangeRowsPerPagePeg = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPagePeg(parseInt(event.target.value, 10));
    setPagePeg(0);
  };

  const handleChangePageDept = (event: unknown, newPage: number) => {
    setPageDept(newPage);
  };
  const handleChangeRowsPerPageDept = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPageDept(parseInt(event.target.value, 10));
    setPageDept(0);
  };

  const pagedDataPeg = data.slice(pagePeg * rowsPerPagePeg, pagePeg * rowsPerPagePeg + rowsPerPagePeg);
  const pagedDataDept = departments.slice(pageDept * rowsPerPageDept, pageDept * rowsPerPageDept + rowsPerPageDept);

  function truncateText(text: any, maxLength = 20) {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  return (
    <div>
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
        Pegawai
      </Typography>
      <div style={{ display: "flex", gap: 32 , marginTop: 20}}>

      {/* Pegawai Table with Pagination */}
      <Paper sx={{ p: 2 , maxWidth: 800, borderRadius: 4, flex: 1}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: "bold", fontSize: 20, margin: 0 }}>List Pegawai</h2>
          <Link href="/dashboardAdmin/pegawai/tambahpegawai">
            <Button variant="contained" color="success" size="small" sx={{ borderRadius: 2 }} startIcon={<FiPlus />}>
              Tambah Pegawai
            </Button>
          </Link>
        </div>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#20653a" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>No</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nama</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Departemen</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Shift</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lokasi</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Tidak ada pegawai.</TableCell>
                </TableRow>
              ) : (
                pagedDataPeg.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{pagePeg * rowsPerPagePeg + idx + 1}</TableCell>
                    <TableCell>{truncateText(row.name)}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.shift}</TableCell>
                    <TableCell>{row.lokasi ? row.lokasi : "-"}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/dashboardAdmin/pegawai/edit/${row.id}`}>
                          <Button size="small" sx={{ minWidth: 0, padding: "4px" }}>
                            <FiEdit />
                          </Button>
                        </Link>
                        <Link href={`/dashboardAdmin/pegawai/gantipassword/${row.id}`}>
                          <Button size="small" color="warning" sx={{ minWidth: 0, padding: "4px" }}>
                            <FiKey />
                          </Button>
                        </Link>
                        <Link href={`/dashboardAdmin/pegawai/inputshift/${row.id}`}>
                          <Button size="small" color="secondary" sx={{ minWidth: 0, padding: "4px" }}>
                            <FiClock />
                          </Button>
                        </Link>
                        <Link href={`/dashboardAdmin/pegawai/inputlokasi/${row.id}`}>
                          <Button size="small" color="info" sx={{ minWidth: 0, padding: "4px" }}>
                            <FiMapPin />
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(row.id)}
                          sx={{ minWidth: 0, padding: "4px" }}
                        >
                          <FiTrash2 />
                        </Button>
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
            count={data.length}
            rowsPerPage={rowsPerPagePeg}
            page={pagePeg}
            onPageChange={handleChangePagePeg}
            onRowsPerPageChange={handleChangeRowsPerPagePeg}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>

      {/* Department Table with Pagination */}
      <Paper sx={{ maxWidth: 600, p: 2, mb: 5, borderRadius: 4 , flex: 2}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: "bold", fontSize: 20, margin: 0 }}>List Department</h2>
          <Link href="/dashboardAdmin/pegawai/tambahdepartment">
            <Button variant="contained" color="success" size="small" sx={{ borderRadius: 2 }} startIcon={<FiPlus />}>
              Tambah Department
            </Button>
          </Link>
        </div>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#20653a" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>No</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nama</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Deskripsi</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Loading...</TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Belum ada department.</TableCell>
                </TableRow>
              ) : (
                pagedDataDept.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{pageDept * rowsPerPageDept + idx + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{truncateText(row.description, 40)}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/dashboardAdmin/pegawai/editdepartment/${row.id}`}>
                          <Button size="small" sx={{ minWidth: 0, padding: "4px" }}>
                            <FiEdit />
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDepart(row.id)}
                          sx={{ minWidth: 0, padding: "4px" }}
                        >
                          <FiTrash2 />
                        </Button>
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
            count={departments.length}
            rowsPerPage={rowsPerPageDept}
            page={pageDept}
            onPageChange={handleChangePageDept}
            onRowsPerPageChange={handleChangeRowsPerPageDept}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>
      </div>
    </div>
  );
}
