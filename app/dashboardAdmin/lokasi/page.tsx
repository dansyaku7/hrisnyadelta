"use client";
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import Link from "next/link";
import { Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography } from "@mui/material";

type Lokasi = {
  id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number;
  note?: string;
};

export default function LokasiPage() {
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLokasi = async () => {
    setLoading(true);
    const res = await fetch("/api/lokasi");
    const json = await res.json();
    setLokasiList(json || []); 
    setLoading(false);
  };

  useEffect(() => {
    fetchLokasi();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus lokasi ini?")) return;
    await fetch(`/api/lokasi/${id}`, { method: "DELETE" });
    fetchLokasi();
  };

  const pagedData = lokasiList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Header style
  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Judul & Tombol */}
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
        Daftar Lokasi
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 4, mb: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>Daftar Lokasi Kantor</div>
          <Link href="/dashboardAdmin/lokasi/tambah">
            <Button
              variant="contained"
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: "#20653a",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#166534" },
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
              startIcon={<FiPlus />}
            >
              Tambah Lokasi
            </Button>
          </Link>
        </div>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No</TableCell>
                <TableCell sx={headerCellStyle}>Nama Lokasi</TableCell>
                <TableCell sx={headerCellStyle}>Alamat</TableCell>
                <TableCell sx={headerCellStyle}>Latitude</TableCell>
                <TableCell sx={headerCellStyle}>Longitude</TableCell>
                <TableCell sx={headerCellStyle}>Radius (m)</TableCell>
                <TableCell sx={headerCellStyle}>Catatan</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Loading...</TableCell>
                </TableRow>
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Belum ada lokasi.</TableCell>
                </TableRow>
              ) : (
                pagedData.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell style={{ maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.name}
                    </TableCell>
                    <TableCell style={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.address || "-"}
                    </TableCell>
                    <TableCell>{row.latitude}</TableCell>
                    <TableCell>{row.longitude}</TableCell>
                    <TableCell>{row.radius}</TableCell>
                    <TableCell style={{ maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.note || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <Link href={`/dashboardAdmin/lokasi/edit/${row.id}`} passHref>
                          <Button
                            size="small"
                            sx={{ minWidth: 0, p: "4px" }}
                            title="Edit"
                          >
                            <FiEdit />
                          </Button>
                        </Link>
                        {!["kantor", "office"].includes(row.name?.toLowerCase()) && (
                          <Button
                            size="small"
                            color="error"
                            sx={{ minWidth: 0, p: "4px" }}
                            title="Hapus"
                            onClick={() => handleDelete(row.id)}
                          >
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
            count={lokasiList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
