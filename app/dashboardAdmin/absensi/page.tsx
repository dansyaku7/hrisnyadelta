"use client";
import { useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  IconButton, 
  CircularProgress
} from "@mui/material";
import dynamic from "next/dynamic";

type Absensi = {
  id: number;
  employeeId: number | string;
  name: string;
  departmentId: number | string;
  department_name?: string;
  date: string;
  time: string;
  status: string;
  foto?: string;
  longitude: number;
  latitude: number;
};

type Department = {
  id: number;
  name: string;
};

const PER_PAGE = 5;

const WFHMap = dynamic(() => import("@/app/components/WFHMapInner"), {
  ssr: false,
});

export default function AbsensiPage() {
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [pageHadir, setPageHadir] = useState(1);

  function getTodayLocalString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }
  const today = getTodayLocalString();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/employee").then(r => r.json()),
      fetch(`/api/absensi?date=${today}`).then(r => r.json()),
      fetch("/api/department").then(r => r.json()),
    ]).then(([emp, abs, dep]) => {
      setAbsensiList(
        (abs.data || []).map((a: any) => ({
          ...a,
          employeeId: a.employeeId || a.employee_id,
          departmentId: a.departmentId || a.department_id,
          name: a.name || a.employee_name || "-",
          id: a.id || a.absen_id,
        }))
      );
      const depMap: Record<string, string> = {};
      (dep.data || []).forEach((d: Department) => {
        depMap[d.id] = d.name;
      });
      setDepartmentMap(depMap);
      setLoading(false);
    });
  }, [today]);

  const pegawaiHadir = absensiList.map(row => ({
    ...row,
    department: departmentMap[row.departmentId] || "-",
  }));

  const maxPageHadir = Math.ceil(pegawaiHadir.length / PER_PAGE) || 1;

  const dataHadirPage = pegawaiHadir.slice((pageHadir - 1) * PER_PAGE, pageHadir * PER_PAGE);

  const headerCellStyleHadir = { color: "white", fontWeight: "bold" as const };
  const headerRowSxHadir = { backgroundColor: "#20653a" };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress color="primary" />
    </Box>
  );
  return (
    <Box>
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
        Data Absen Hari Ini
      </Typography>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Kiri: Tabel Hadir & Belum Hadir */}
        <Box flex={1} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* --- Tabel Sudah Hadir --- */}
          <Paper sx={{ borderRadius: 4, p: 3, minHeight: 340 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography fontWeight="bold" fontSize={18} color="#20653a">
                Sudah Hadir ({pegawaiHadir.length})
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPageHadir(p => Math.max(1, p - 1))}
                  disabled={pageHadir === 1}
                  sx={{ minWidth: 36, borderRadius: 2, textTransform: "none" }}
                >Prev</Button>
                <Typography fontSize={14}>{pageHadir}/{maxPageHadir}</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPageHadir(p => Math.min(maxPageHadir, p + 1))}
                  disabled={pageHadir === maxPageHadir}
                  sx={{ minWidth: 36, borderRadius: 2, textTransform: "none" }}
                >Next</Button>
              </Box>
            </Box>
            <TableContainer sx={{ borderRadius: 2, boxShadow: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={headerRowSxHadir}>
                    <TableCell sx={headerCellStyleHadir}>No</TableCell>
                    <TableCell sx={headerCellStyleHadir}>Nama</TableCell>
                    <TableCell sx={headerCellStyleHadir}>Departemen</TableCell>
                    <TableCell sx={headerCellStyleHadir}>Tanggal Absen</TableCell>
                    <TableCell sx={headerCellStyleHadir}>Jam Masuk</TableCell>
                    <TableCell sx={headerCellStyleHadir}>Status</TableCell>
                    <TableCell sx={headerCellStyleHadir} align="center">Lihat Foto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#94a3b8" }}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : dataHadirPage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#94a3b8" }}>
                        Belum ada pegawai yang hadir hari ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataHadirPage.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>{(pageHadir - 1) * PER_PAGE + idx + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</TableCell>
                        <TableCell sx={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.department_name}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>
                          <span style={{
                            padding: "2px 10px",
                            borderRadius: 7,
                            fontWeight: "bold",
                            fontSize: 13,
                            color: row.status === "Hadir" ? "#166534" : "#b45309",
                            background: row.status === "Hadir" ? "#dcfce7" : "#fef08a",
                          }}>
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell align="center">
                          {row.foto ? (
                            <IconButton
                              onClick={() => setFotoPreview(row.foto ?? null)}
                              title="Lihat Foto"
                              sx={{
                                color: "#20653a",
                                borderRadius: 2,
                                "&:hover": { bgcolor: "#b9e6fe" }
                              }}
                            >
                              <FiImage />
                            </IconButton>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ borderRadius: 4, p: 2, minHeight: 340 }}>
            <Typography fontWeight="bold" fontSize={22} color="#166534" mb={2}>
              Peta Lokasi Pegawai WFH / Sampling
            </Typography>
            <Box sx={{ height: 400, width: "100%" }}>
              <WFHMap data={absensiList} />
            </Box>
          </Paper>
        </Box>

        {/* Kanan: Preview Foto */}
        <Box
          sx={{
            width: { xs: "100%", md: 380 },
            maxWidth: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: { xs: 2, md: 1 }
          }}
        >
          <Paper
            sx={{
              borderRadius: 4,
              p: 3,
              width: "100%",
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Selfie Absen"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  objectFit: "contain",
                  boxShadow: "0 2px 8px rgba(30, 64, 175, 0.07)",
                }}
              />
            ) : (
              <Box textAlign="center" color="#94a3b8">
                <Box display="flex" justifyContent="center">
                  <FiImage size={52} style={{ marginBottom: 8 }} /> 
                </Box>
                <Typography>Preview Foto Kehadiran</Typography>
                <Typography fontSize={13} color="#bdbdbd" mt={1}>
                  Klik tombol <FiImage style={{ display: "inline" }} /> di tabel hadir untuk melihat foto absen.
                </Typography>
              </Box>
            )}
          </Paper>
          {fotoPreview && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#fff",
                color: "black",
                fontWeight: "bold",
                borderRadius: 2,
                "&:hover": { bgcolor: "#526359ff" }
              }}
              onClick={() => setFotoPreview(null)}
            >
              Tutup Preview
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
