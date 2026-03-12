"use client";
import { useState, useEffect } from "react";
import { BsCashStack } from "react-icons/bs";
import InputGajiForm from "@/app/components/InputGajiForm";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl, TextField
} from "@mui/material";
import LaporanKehadiran, { KehadiranRow } from "@/app/components/LaporanKehadiran";

type LiburNasional = { id: string; tanggal: string; keterangan: string };
type Department = { id: string; name: string };
type RekapRow = {
  employeeId: number;
  username?: string;
  NIK: string;
  name: string;
  department: string;
  departmentId: number;
  totalHadir: number;
  totalTerlambatMenit: number;
  totalIzinCuti: number;
  totalAlfa: number;
  totalWFH: number;
  totalLembur: number;
  totalLemburFormatted: string;
  gajiPokok?: number;
  uangMakan: 0;
  totalUangMakan: 0;
  tunjanganJabatan?: number;
};

function toYMD(date: Date | string) {
  if (typeof date === "string") date = new Date(date);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateTanggalList(
  tglMulai: string,
  tglAkhir: string,
  liburArr: LiburNasional[]
) {
  if (!tglMulai || !tglAkhir) return [];
  const start = new Date(tglMulai);
  const end = new Date(tglAkhir);
  const liburSet = new Set(liburArr.map(l => toYMD(l.tanggal)));
  const liburMap = Object.fromEntries(
    liburArr.map(l => [toYMD(l.tanggal), l.keterangan])
  );
  const arr = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toYMD(d);
    const hari = d.getDay();
    const isWeekend = hari === 0 || hari === 6;
    const isLibur = liburSet.has(iso);
    arr.push({
      tanggal: iso,
      label: `${iso} (${["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][hari]}${isLibur ? " - " + liburMap[iso] : ""})`,
      isWeekend,
      isLibur,
      excluded: isWeekend || isLibur,
      keteranganLibur: isLibur ? liburMap[iso] : undefined,
    });
  }
  return arr;
}

export default function RekapPage() {
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RekapRow[]>([]);
  const [dataKehadiran, setDataKehadiran] = useState<KehadiranRow[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tanggalList, setTanggalList] = useState<any[]>([]);
  const [excludeDates, setExcludeDates] = useState<string[]>([]);
  const [liburNasional, setLiburNasional] = useState<LiburNasional[]>([]);
  const [selectedRow, setSelectedRow] = useState<RekapRow | null>(null);

  const [inputTTD, setInputTTD] = useState({
    dibuatOleh: "",
    disetujuiOleh: "",
    diperiksaOleh: "",
  });

  const [showPrint, setShowPrint] = useState(false);

  const [showInputTTD, setShowInputTTD] = useState(false);
  const [printLaporanData, setPrintLaporanData] = useState<{
    periode: string;
    dataKehadiran: KehadiranRow[];
    disetujuiOleh: string;
    diperiksaOleh: string;
    dibuatOleh: string;
    tanggal: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/department")
      .then((res) => res.json())
      .then((json) => setDepartments(json || []));
  }, []);

  useEffect(() => {
    async function getLibur() {
      if (tanggalMulai && tanggalAkhir) {
        const res = await fetch(
          `/api/libur-nasional?start=${tanggalMulai}&end=${tanggalAkhir}`
        );
        const json = await res.json();
        setLiburNasional(json.data || []);
      } else {
        setLiburNasional([]);
      }
    }
    getLibur();
  }, [tanggalMulai, tanggalAkhir]);

  useEffect(() => {
    const arr = generateTanggalList(tanggalMulai, tanggalAkhir, liburNasional);
    setTanggalList(arr);
    setExcludeDates(arr.filter((a) => a.excluded).map((a) => a.tanggal));
    console.log(liburNasional)
  }, [tanggalMulai, tanggalAkhir, liburNasional]);

  useEffect(() => {
    if (showPrint) {
      setTimeout(() => {
        window.print();
        setShowPrint(false);
        setPrintLaporanData(null);
      }, 400);
    }
  }, [showPrint]);

  function formatTanggalIndo(tgl: string): string {
    if (!tgl) return "-";
    const bulanIndo = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const date = new Date(tgl);
    if (isNaN(date.getTime())) return tgl;
    return `${date.getDate()} ${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;
  }

  function toggleExcludeDate(tanggal: string) {
    setExcludeDates((prev) =>
      prev.includes(tanggal)
        ? prev.filter((t) => t !== tanggal)
        : [...prev, tanggal]
    );
  }

  async function fetchRekap() {
    setLoading(true);
    setError("");
    setData([]);
    try {
      const params = new URLSearchParams();
      params.set("tanggalMulai", tanggalMulai);
      params.set("tanggalAkhir", tanggalAkhir);
      if (departmentId) params.set("departmentId", departmentId);
      if (searchNama) params.set("searchNama", searchNama);
      for (const tgl of excludeDates) {
        params.append("excludeDates", tgl);
      }
      const res = await fetch(`/api/rekap-absensi?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal fetch rekap");
      setData(json.data);
      setDataKehadiran(json.data);
      setPage(0);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const pagedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function handleCloseModal() {
    setSelectedRow(null);
  }
  function handleSuccess() {
    setSelectedRow(null);
  }

  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  async function handleCetak() {
    let dibuatOleh = "Admin HR";
    try {
      const userRes = await fetch("/api/me");
      if (userRes.ok) {
        const userJson = await userRes.json();
        if (userJson.name) dibuatOleh = userJson.name;
      }
    } catch {}
    setInputTTD({
      dibuatOleh,
      disetujuiOleh: "",
      diperiksaOleh: "",
    });
    setShowInputTTD(true);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
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
        Rekap Data Absensi Pegawai
      </Typography>

      {/* Filter */}
      <Paper sx={{ p: 2, mt: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "end" }}>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Tanggal Mulai</Typography>
            <TextField
              size="small"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              sx={{ minWidth: 140, background: "white" }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Tanggal Akhir</Typography>
            <TextField
              size="small"
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              sx={{ minWidth: 140, background: "white" }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Department</Typography>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
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
          <Button
            variant="contained"
            sx={{
              bgcolor: "#15b315ff",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              height: 40,
              px: 3,
              minWidth: 100,
              ml: 1,
              "&:hover": { bgcolor: "#166534" }
            }}
            onClick={fetchRekap}
            disabled={loading || !tanggalMulai || !tanggalAkhir}
          > 
            {loading ? "Loading..." : "Cari"}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#12afc4ff",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 2,
              height: 40,
              px: 3,
              minWidth: 100,
              ml: 1,
              "&:hover": { bgcolor: "#166534" }
            }}
            onClick={handleCetak}
            disabled={loading || !tanggalMulai || !tanggalAkhir || pagedData.length === 0}
          >
            {loading ? "Loading..." : "Cetak"}
          </Button>
        </Box>
        {/* Exclude tanggal */}
        {tanggalList.length > 0 && (
          <Box sx={{ background: "#f1f5f9", borderRadius: 2, mt: 3, p: 2 }}>
            <Typography fontSize={13} fontWeight={600} mb={1}>Exclude Tanggal dari Rekap:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {tanggalList.map((tgl) => (
                <label
                  key={tgl.tanggal}
                  style={{
                    fontWeight: tgl.isLibur ? 700 : 400,
                    color: tgl.isLibur
                      ? "#b91c1c"
                      : tgl.isWeekend
                        ? "#94a3b8"
                        : "#334155"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={excludeDates.includes(tgl.tanggal)}
                    onChange={() => toggleExcludeDate(tgl.tanggal)}
                    style={{ marginRight: 6 }}
                  />
                  {tgl.label}
                </label>
              ))}
            </Box>
          </Box>
        )}
        {error && <Typography sx={{ color: "#b91c1c", mt: 2 }}>{error}</Typography>}
      </Paper>

      {/* Table Data Rekap */}
      <Paper sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>Nama Pegawai</TableCell>
                <TableCell sx={headerCellStyle}>Department</TableCell>
                <TableCell sx={headerCellStyle} align="center">Hadir</TableCell>
                <TableCell sx={headerCellStyle} align="center">WFH</TableCell>
                <TableCell sx={headerCellStyle} align="center">Terlambat</TableCell>
                <TableCell sx={headerCellStyle} align="center">Izin/Cuti</TableCell>
                <TableCell sx={headerCellStyle} align="center">Alfa</TableCell>
                <TableCell sx={headerCellStyle} align="center">Lembur (jam)</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((row, i) => (
                  <TableRow key={row.employeeId || row.name + row.departmentId + i}>
                    <TableCell
                      style={{
                        maxWidth: 160, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                      }}
                    >{row.name}</TableCell>
                    <TableCell
                      style={{
                        maxWidth: 140, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                      }}
                    >{row.department}</TableCell>
                    <TableCell align="center">{row.totalHadir || 0}</TableCell>
                    <TableCell align="center">{row.totalWFH || 0}</TableCell>
                    <TableCell align="center">{row.totalTerlambatMenit || 0} menit</TableCell>
                    <TableCell align="center">{row.totalIzinCuti || 0}</TableCell>
                    <TableCell align="center">{row.totalAlfa || 0}</TableCell>
                    <TableCell align="center">{row.totalLemburFormatted || "-"}</TableCell>
                    <TableCell align="center">
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
                        title="Input/Edit Gaji"
                        onClick={() => setSelectedRow(row)}
                      >
                        <BsCashStack size={18} />
                      </Button>
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

      {/* Modal Input Gaji */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <InputGajiForm
            row={selectedRow}
            tanggalMulai={tanggalMulai}
            tanggalAkhir={tanggalAkhir}
            tanggalList={tanggalList}
            excludeDates={excludeDates}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      {showInputTTD && (
      <div
        style={{
          position: "fixed", zIndex: 999, left: 0, top: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <div style={{
          background: "#fff", borderRadius: 12, padding: 32, minWidth: 340,
          boxShadow: "0 4px 24px rgba(0,0,0,0.09)", position: "relative"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: 18, fontSize: 20, fontWeight: 700 }}>
            Input Nama Tanda Tangan
          </h3>
          <div style={{ marginBottom: 18 }}>
            <label>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Dibuat Oleh</div>
              <input
                type="text"
                value={inputTTD.dibuatOleh}
                onChange={e => setInputTTD(ttd => ({ ...ttd, dibuatOleh: e.target.value }))}
                style={{ width: "100%", padding: 6, marginBottom: 12, fontSize: 14, borderRadius: 5, border: "1px solid #ccc" }}
              />
            </label>
            <label>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Disetujui Oleh</div>
              <input
                type="text"
                required
                value={inputTTD.disetujuiOleh}
                onChange={e => setInputTTD(ttd => ({ ...ttd, disetujuiOleh: e.target.value }))}
                style={{ width: "100%", padding: 6, marginBottom: 12, fontSize: 14, borderRadius: 5, border: "1px solid #ccc" }}
              />
            </label>
            <label>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Diperiksa Oleh</div>
              <input
                type="text"
                required
                value={inputTTD.diperiksaOleh}
                onChange={e => setInputTTD(ttd => ({ ...ttd, diperiksaOleh: e.target.value }))}
                style={{ width: "100%", padding: 6, fontSize: 14, borderRadius: 5, border: "1px solid #ccc" }}
              />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={() => setShowInputTTD(false)}
              style={{
                border: "1px solid #e11d48", color: "#e11d48",
                background: "#fff", padding: "7px 18px", borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: "pointer"
              }}
            >Batal</button>
            <button
              onClick={() => {
                let periodeString = "-";
                if (tanggalMulai && tanggalAkhir) {
                  periodeString = `${formatTanggalIndo(tanggalMulai)} - ${formatTanggalIndo(tanggalAkhir)}`;
                }
                const now = new Date();
                const tanggalString = `Bekasi, ${formatTanggalIndo(now.toISOString())}`;
                setPrintLaporanData({
                  periode: periodeString,
                  dataKehadiran, 
                  ...inputTTD,
                  tanggal: tanggalString,
                });
                setShowInputTTD(false);
                setShowPrint(true);
              }}
              style={{
                border: "1px solid #20653a", color: "#fff", background: "#20653a",
                padding: "7px 18px", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer"
              }}
            >Cetak</button>
          </div>
        </div>
      </div>
    )}

    {showPrint && printLaporanData && (
    <div className="print-area">
      <LaporanKehadiran {...printLaporanData} />
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100vw;
            background: #fff;
            z-index: 9999;
          }
        }
        .print-area { display: none; }
        @media print {
          .print-area { display: block !important; }
        }
      `}</style>
    </div>
  )}

    </div>
  );
}
