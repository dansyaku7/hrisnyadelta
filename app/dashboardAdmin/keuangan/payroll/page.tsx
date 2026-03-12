"use client";
import { useState, useEffect } from "react";
import { FiEye, FiDownload, FiTrash2, FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import SlipGaji from "@/app/components/SlipGaji";
import LaporanGaji, { LaporanGajiRow } from "@/app/components/LaporanGaji";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Typography, Select, MenuItem, InputLabel, FormControl, TextField,Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, Box, Alert, Stack
} from "@mui/material";
import { FiAlertTriangle } from "react-icons/fi";

type PayrollRow = {
  id: number;           
  kasbon_id: number;
  employee_id: number;
  employee_name: string;
  department_id: string;
  department_name: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  takeHomePay: number;
  status: string;
  potongan_kasbon: number;
};

export default function PayrollPage() {
  const [data, setData] = useState<PayrollRow[]>([]);
  const [periode, setPeriode] = useState("");
  const [department, setDepartment] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printData, setPrintData] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [showPrintLaporan, setShowPrintLaporan] = useState(false);
  const [printDataLaporan, setPrintDataLaporan] = useState<{
    periode: string;
    tanggal: string;
    dataGaji: LaporanGajiRow[];
  } | null>(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingEmployees, setMissingEmployees] = useState<{ name: string; department?: string }[]>([]);
  const [pendingPrintRows, setPendingPrintRows] = useState<LaporanGajiRow[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/department")
      .then(res => res.json())
      .then(json => setDepartments(json.data || []));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showPrint) {
      setTimeout(() => {
        window.print();
        setShowPrint(false);
        setPrintData(null);
      }, 400);
    }
  }, [showPrint]);

  useEffect(() => {
    if (showPrintLaporan) {
      const t = setTimeout(() => {
        window.print();
        setShowPrintLaporan(false);
        setPrintDataLaporan(null);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [showPrintLaporan]);

  async function fetchPayroll() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (periode) {
        const [year, month] = periode.split("-");
        const tglMulai = `${year}-${month}-01`;
        const tglAkhir = new Date(Number(year), Number(month), 0).toISOString().slice(0, 10);
        params.set("tanggalMulai", tglMulai);
        params.set("tanggalAkhir", tglAkhir);
      }
      if (department) params.set("departmentId", department);
      if (searchNama) params.set("searchNama", searchNama);

      const res = await fetch(`/api/payroll?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal fetch payroll");
      setData(json.data || []);
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayroll();
    setMounted(true);
  }, []);

  function hitungTakeHomePay(row: any) {
    return (
      Number(row.gajiPokok || 0) +
      Number(row.totalUangMakan || 0) +
      Number(row.tunjanganJabatan || 0) +
      Number(row.tunjanganLembur || 0) +
      Number(row.thrBonus || 0) +
      Number(row.tunjanganLain || 0) -
      Number(row.potonganBpjs || 0) -
      Number(row.potonganPajak || 0) -
      Number(row.potonganKasbon || 0)
    );
  }

  async function handleDownload(payrollId: number) {
    const resPayroll = await fetch(`/api/payroll/${payrollId}`);
    if (!resPayroll.ok) {
      alert("Gagal mengambil data payroll!");
      return;
    }
    const { data: row } = await resPayroll.json();

    let dibuatOleh = "Admin HR";
    try {
      const userRes = await fetch("/api/me");
      if (userRes.ok) {
        const userJson = await userRes.json();
        if (userJson.name) dibuatOleh = userJson.name;
      }
    } catch {}

    const totalPenerimaan = [
      row.gaji_pokok,
      row.total_uang_makan,
      row.tunjangan_jabatan,
      row.tunjangan_lembur,
      row.tunjangan_lain,
      row.thr_bonus,
    ]
      .map(Number)
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

    const totalPotongan = [
      row.potongan_pajak,
      row.potongan_bpjs,
      row.potongan_kasbon,
    ]
      .map(Number)
      .filter(Boolean)
      .reduce((a, b) => a + b, 0);

    const takeHomePay = totalPenerimaan - totalPotongan;

    function formatRupiah(nom: any) {
      return Number(nom || 0).toLocaleString("id-ID");
    }
    function getTanggalSekarang() {
      const now = new Date();
      const bulanIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;
    }

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

    let periodeString = `${formatTanggalIndo(row.periode_mulai)} s/d ${formatTanggalIndo(row.periode_akhir)}`;

    const dataSlip = {
      ...row,
      gajiPokok: formatRupiah(row.gaji_pokok),
      totalUangMakan: formatRupiah(row.total_uang_makan),
      tunjanganJabatan: formatRupiah(row.tunjangan_jabatan),
      tunjanganLembur: formatRupiah(row.tunjangan_lembur),
      tunjanganLain: formatRupiah(row.tunjangan_lain),
      thr: formatRupiah(row.thr_bonus),
      pajak: formatRupiah(row.potongan_pajak),
      bpjs: formatRupiah(row.potongan_bpjs),
      kasbon: formatRupiah(row.potongan_kasbon),
      totalPenerimaan: formatRupiah(totalPenerimaan),
      totalPotongan: formatRupiah(totalPotongan),
      takeHomePay: formatRupiah(takeHomePay),
      dibuatOleh,
      tanggal: getTanggalSekarang(),
      diterimaOleh: row.employee_name,
      periode: periodeString || "-",
      department: row.department || "-",
      NIK: row.NIK || "-",
    };

    setPrintData(dataSlip);
    setShowPrint(true);
  }

  const handlePublish = async (row: PayrollRow) => {
    if (!confirm(`Publish payroll untuk ${row.employee_name}?`)) return;
    const userMe = await fetch("/api/me").then(res => res.json());
    const namaPembuat = userMe?.name || "-";

    if (row.potongan_kasbon > 0) {
      const potongRes = await fetch(`/api/kasbon/potong`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: row.employee_id,
          jumlahPotong: row.potongan_kasbon,
        }),
      });
      if (!potongRes.ok) {
        alert("Gagal patch kasbon/potong!");
        return;
      }
    }

    if (row.potongan_kasbon > 0) {
      const kasbonRes = await fetch(`/api/kasbon/${row.kasbon_id}/input-bayar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nominal: row.potongan_kasbon,
        }),
      });
      if (!kasbonRes.ok) {
        alert("Gagal patch kasbon/input-bayar!");
        return;
      }
    }

    const res = await fetch(`/api/payroll/${row.id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namaPembuat })
    });
    if (res.ok) {
      fetchPayroll();
    } else {
      alert("Gagal publish payroll!");
    }
  };

  function handleDelete(row: PayrollRow) {
    if (!confirm("Hapus payroll ini?")) return;
    fetch(`/api/payroll/${row.id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => fetchPayroll());
  }

  const pagedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const headerCellStyle = { color: "white", fontWeight: "bold" as const };
  const headerRowSx = { backgroundColor: "#20653a" };

  function endOfMonthYmd(year: number, month1to12: number) {
    const d = new Date(year, month1to12, 0); 
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function periodeStringDariMonth(inputMonth: string): string {
    if (!inputMonth) return "-";
    const [yStr, mStr] = inputMonth.split("-");
    const y = Number(yStr);
    const m = Number(mStr);

    const bulanIndo = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember"
    ];

    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return inputMonth; 
    }

    return `${bulanIndo[m - 1]} ${y}`;
  }

  function tanggalCetakSekarang() {
    const now = new Date();
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return `${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  }

  async function handleCetakLaporan() {
    if (!periode) {
      alert("Pilih periode terlebih dahulu");
      return;
    }

    const [year, month] = periode.split("-");
    const tglMulai = `${year}-${month}-01`;
    const tglAkhir = endOfMonthYmd(Number(year), Number(month));

    const pParams = new URLSearchParams();
    pParams.set("tanggalMulai", tglMulai);
    pParams.set("tanggalAkhir", tglAkhir);
    if (department) pParams.set("departmentId", department);
    if (searchNama) pParams.set("searchNama", searchNama);
    pParams.set("all", "true"); 

    const eParams = new URLSearchParams();
    if (department) eParams.set("departmentId", department);

    setLoading(true);
    try {
      const [resPayroll, resEmp] = await Promise.all([
        fetch(`/api/payroll?${pParams.toString()}`),
        fetch(`/api/employee?${eParams.toString()}`),
      ]);

      const jsonPayroll = await resPayroll.json();
      const jsonEmp = await resEmp.json();

      if (!resPayroll.ok || jsonPayroll.success === false) {
        throw new Error(jsonPayroll.message || "Gagal ambil data payroll");
      }
      if (!resEmp.ok || jsonEmp.success === false) {
        throw new Error(jsonEmp.message || "Gagal ambil data pegawai");
      }

      const payrollRowsRaw: any[] = jsonPayroll.data || [];
      const employeesRaw: any[] = jsonEmp.data || [];

      const rowsForPrint: LaporanGajiRow[] = payrollRowsRaw.map((r) => ({
        employee_name: r.employee_name ?? r.name ?? "",
        department: r.department ?? r.department_name ?? "-",
        gaji_pokok: Number(r.gaji_pokok ?? r.gajiPokok ?? 0),
        total_uang_makan: Number(r.total_uang_makan ?? r.totalUangMakan ?? 0),
        tunjangan_jabatan: Number(r.tunjangan_jabatan ?? r.tunjanganJabatan ?? 0),
        tunjangan_lembur: Number(r.tunjangan_lembur ?? r.tunjanganLembur ?? 0),
        thr_bonus: Number(r.thr_bonus ?? r.thr ?? r.thrBonus ?? 0),
        tunjangan_lain: Number(r.tunjangan_lain ?? r.tunjanganLain ?? 0),
        potongan_bpjs: Number(r.potongan_bpjs ?? r.potonganBpjs ?? 0),
        potongan_pajak: Number(r.potongan_pajak ?? r.potonganPajak ?? 0),
        potongan_kasbon: Number(r.potongan_kasbon ?? r.potonganKasbon ?? 0),
      }));

      const payrollIds = new Set(
        payrollRowsRaw.map((r) => String(r.employee_id ?? r.employeeId ?? ""))
                      .filter(Boolean)
      );
      const payrollNames = new Set(
        payrollRowsRaw.map((r) => normName(r.employee_name ?? r.name))
      );

      const missing: { name: string; department?: string }[] = [];
      for (const emp of employeesRaw) {
        const empId = String(emp.id ?? emp._id ?? emp.employee_id ?? "");
        const empName = emp.name ?? emp.employee_name ?? emp.full_name ?? "";
        const empDept = emp.department ?? emp.department_name ?? "";

        const hasById = empId ? payrollIds.has(empId) : false;
        const hasByName = payrollNames.has(normName(empName));
        const already = hasById || hasByName;
        const isActive = emp.active !== false; 

        if (isActive && !already) {
          missing.push({ name: empName || "(tanpa nama)", department: empDept });
        }
      }

      setPendingPrintRows(rowsForPrint);
      if (missing.length > 0) {
        setMissingEmployees(missing);
        setShowMissingModal(true);
        return; 
      }

      setPrintDataLaporan({
        periode: periodeStringDariMonth(periode),   
        tanggal: tanggalCetakSekarang(),           
        dataGaji: rowsForPrint,
      });
      setShowPrintLaporan(true);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menyiapkan laporan");
    } finally {
      setLoading(false);
    }
  }

  function normName(s: any) {
    return String(s ?? "").trim().toLowerCase();
  }

  function handleMissingBack() {
    setShowMissingModal(false);
    setMissingEmployees([]);
    setPendingPrintRows([]);
  }

  
  function handleMissingProceed() {
    setShowMissingModal(false);
    setPrintDataLaporan({
      periode: periodeStringDariMonth(periode),
      tanggal: tanggalCetakSekarang(),
      dataGaji: pendingPrintRows,
    });
    setShowPrintLaporan(true);
    setMissingEmployees([]);
    setPendingPrintRows([]);
  }
  if (!mounted) return null;
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
        Daftar Payroll
      </Typography>

      {/* Filter */}
      <Paper sx={{ p: 2, mt: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "end" }}>
          <Box>
            <Typography fontSize={13} fontWeight={500}>Periode</Typography>
            <TextField
              size="small"
              type="month"
              value={periode}
              onChange={e => setPeriode(e.target.value)}
              sx={{ minWidth: 140, background: "white" }}
            />
          </Box>
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
                  <MenuItem key={dep._id} value={dep._id}>{dep.name}</MenuItem>
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
            onClick={fetchPayroll}
            disabled={loading}
          >
            {loading ? "Loading..." : "Cari"}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#20653a", color: "#fff", fontWeight: "bold",
              borderRadius: 2, height: 40, px: 3, minWidth: 140
            }}
            onClick={handleCetakLaporan}
            disabled={loading || !periode}
          >
            Cetak Laporan
          </Button>
        </Box>
        {error && <Typography sx={{ color: "#b91c1c", mt: 2 }}>{error}</Typography>}
      </Paper>

      {/* Table Payroll */}
      <Paper sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>No.</TableCell>
                <TableCell sx={headerCellStyle}>Nama Pegawai</TableCell>
                <TableCell sx={headerCellStyle}>Department</TableCell>
                <TableCell sx={headerCellStyle}>Periode</TableCell>
                <TableCell sx={headerCellStyle}>Take Home Pay</TableCell>
                <TableCell sx={headerCellStyle}>Status</TableCell>
                <TableCell sx={headerCellStyle} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: "#94a3b8" }}>
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.department_name}</TableCell>
                    <TableCell>
                      <span style={{
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", maxWidth: 180
                      }}>
                        {row.tanggal_mulai} s/d {row.tanggal_akhir}
                      </span>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#166534" }}>
                      Rp {(row.takeHomePay ?? hitungTakeHomePay(row)).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {row.status === "published"
                        ? <span style={{
                            background: "#dcfce7",
                            color: "#166534",
                            fontWeight: "bold",
                            fontSize: 13,
                            padding: "2px 10px",
                            borderRadius: 8
                          }}>Published</span>
                        : <span style={{
                            background: "#fef08a",
                            color: "#b45309",
                            fontWeight: "bold",
                            fontSize: 13,
                            padding: "2px 10px",
                            borderRadius: 8
                          }}>Unpublished</span>
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Button
                          size="small"
                          sx={{
                            minWidth: 0, p: "4px", bgcolor: "#e0f2fe", color: "#06b6d4", borderRadius: 2,
                            "&:hover": { bgcolor: "#bae6fd" }
                          }}
                          title="Lihat Detail"
                          onClick={() => router.push(`/dashboardAdmin/keuangan/payroll/${row.id}`)}
                        >
                          <FiEye />
                        </Button>
                        <Button
                          size="small"
                          sx={{
                            minWidth: 0, p: "4px", bgcolor: "#fef08a", color: "#b45309", borderRadius: 2,
                            "&:hover": { bgcolor: "#fde047" }
                          }}
                          title="Download PDF"
                          onClick={() => handleDownload(row.id)}
                          disabled={loading}
                        >
                          <FiDownload />
                        </Button>
                        {row.status !== "published" && (
                          <Button
                            size="small"
                            sx={{
                              minWidth: 0, p: "4px", bgcolor: "#dcfce7", color: "#166534", borderRadius: 2,
                              "&:hover": { bgcolor: "#bbf7d0" }
                            }}
                            title="Publish"
                            onClick={() => handlePublish(row)}
                            disabled={loading}
                          >
                            <FiUpload />
                          </Button>
                        )}
                        <Button
                          size="small"
                          color="error"
                          sx={{
                            minWidth: 0, p: "4px", bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2,
                            "&:hover": { bgcolor: "#fecaca" }
                          }}
                          title="Hapus"
                          onClick={() => handleDelete(row)}
                          disabled={loading}
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
      <Dialog
        open={showMissingModal}
        onClose={handleMissingBack}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
          <FiAlertTriangle style={{ marginRight: 6 }} />
          Info Data Gaji Bulan Ini
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {missingEmployees.length > 0 ? (
            <Stack spacing={2}>
              <Alert severity="warning" sx={{ bgcolor: "#fff7ed", color: "#7c2d12", borderColor: "#fdba74" }}>
                Berikut pegawai yang <b>belum</b> diinput gajinya untuk periode ini.
              </Alert>
              <Box sx={{ maxHeight: 320, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <List dense disablePadding>
                  {missingEmployees.map((m, i) => (
                    <ListItem key={i} divider sx={{ px: 2 }}>
                      <ListItemText
                        primary={m.name}
                        secondary={m.department ? `Dept: ${m.department}` : undefined}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          ) : (
            <Alert severity="success">Semua pegawai sudah memiliki data gaji bulan ini.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleMissingBack}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Kembali
          </Button>
          <Button
            variant="contained"
            onClick={handleMissingProceed}
            sx={{
              bgcolor: "#20653a",
              color: "#fff",
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { bgcolor: "#166534" },
            }}
          >
            Lanjut
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Slip Gaji */}
      {showPrint && printData && (
        <div className="print-area">
          <SlipGaji {...printData} />
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
      {showPrintLaporan && printDataLaporan && (
        <div className="print-area">
          <LaporanGaji {...printDataLaporan} />
          <style jsx global>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-area, .print-area * { visibility: visible !important; }
              .print-area {
                position: absolute; left: 0; top: 0; max-width: 200vw; background: #fff; z-index: 9999;
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
