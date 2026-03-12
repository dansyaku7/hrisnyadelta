"use client";
import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, List, ListItem, ListItemText,
  Grid, 
  Divider,
  Button
} from "@mui/material";


import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

type NotifData = {
  type: "cuti" | "kasbon" | "overtime";
  id: number;
  name?: string;
  alasan?: string;
  tanggal?: string;
};

type Employee = { id: number; name: string; department: string };
type Absensi = { employee_id: number };

export default function DashboardAdmin() {
  const [notif, setNotif] = useState<{
    cuti: NotifData[];
    kasbon: NotifData[];
    overtime: NotifData[];
  }>({ cuti: [], kasbon: [], overtime: [] });

  const [loading, setLoading] = useState(true);
  const [belumAbsen, setBelumAbsen] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  const [overviewData, setOverviewData] = useState({
    totalEmployees: 0,
    pendingCuti: 0,
    pendingKasbon: 0,
    pendingOvertime: 0,
  });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const empRes = await fetch("/api/employee");
        const empJson = await empRes.json();
        const pegawai: Employee[] = empJson.data || [];
        setOverviewData(prev => ({ ...prev, totalEmployees: pegawai.length }));

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const tanggal = `${yyyy}-${mm}-${dd}`;
        
        const absRes = await fetch(`/api/absensi?date=${tanggal}`);
        const absJson = await absRes.json();
        const absensi: Absensi[] = absJson.data || [];

        const sudahAbsenId = new Set(absensi.map((a: Absensi) => a.employee_id));
        const belum = pegawai.filter((p: Employee) => !sudahAbsenId.has(p.id));
        setBelumAbsen(belum);

        const [cutiRes, kasbonRes, overtimeRes] = await Promise.all([
          fetch("/api/cuti").then((r) => r.json()),
          fetch("/api/kasbon").then((r) => r.json()),
          fetch("/api/overtime").then((r) => r.json()),
        ]);

        const pendingCuti = (cutiRes.data || []).filter((c: any) => c.status?.toLowerCase() === "pending");
        const pendingKasbon = (kasbonRes.data || []).filter((k: any) => k.status?.toLowerCase() === "pending");
        const pendingOvertime = (overtimeRes.data || []).filter((o: any) => o.status?.toLowerCase() === "pending");

        setNotif({
          cuti: pendingCuti.map((c: any) => ({ type: "cuti", id: c.id, name: c.name, alasan: c.alasan, tanggal: c.tgl_mulai })),
          kasbon: pendingKasbon.map((k: any) => ({ type: "kasbon", id: k.id, name: k.employee_name, tanggal: k.tanggal_pengajuan })),
          overtime: pendingOvertime.map((o: any) => ({ type: "overtime", id: o.id, name: o.employee_name, alasan: o.alasan, tanggal: o.tanggal })),
        });

        setOverviewData(prev => ({
          ...prev,
          pendingCuti: pendingCuti.length,
          pendingKasbon: pendingKasbon.length,
          pendingOvertime: pendingOvertime.length,
        }));

      } catch (e: any) {
        setError(e.message || "Gagal load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const getTanggalIndo = (date: Date) => {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };
  const jam = pad(now.getHours());
  const menit = pad(now.getMinutes());
  const detik = pad(now.getSeconds());
  const tanggal = getTanggalIndo(now);
  const hasNotif = notif.cuti.length > 0 || notif.kasbon.length > 0 || notif.overtime.length > 0;

  if (loading) return (<Box display="flex" justifyContent="center" py={10}><CircularProgress color="primary" /></Box>);
  if (error) return (<Typography color="error.main" textAlign="center" py={2}>{error}</Typography>);

  return (
    <Box
      className="font-comfortaa"
      sx={{
        width: "100%",
        pb: 4,
        "& .MuiTypography-root": {
          fontFamily: "inherit",
        },
        "& .MuiButton-root": {
          fontFamily: "inherit",
        },
        "& .MuiTableCell-root": {
          fontFamily: "inherit",
        },
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#2b3674" }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={4}>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              width: "100%", py: 3, borderRadius: 3, bgcolor: "#F8FAFC", 
              border: "1px solid #E9EDF7", boxShadow: "0px 4px 15px rgba(0,0,0,0.05)",
              minHeight: { xs: 'auto', md: '180px' }
          }}>
            <AccessTimeIcon sx={{ fontSize: 40, color: "#07ABE8", mb: 1 }} />
            <Typography sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: "bold", letterSpacing: 2, color: "#2b3674" }}>
              {jam}:{menit}:{detik}
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: "medium", opacity: 0.8, color: "#5d6a8a" }}>
              {tanggal}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={3}>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#E3F2FD", border: "1px solid #BBDEFB", display: "flex", alignItems: "center", gap: 2, minHeight: { xs: 'auto', sm: '120px' } }}>
                <Box sx={{ bgcolor: "#2196F3", p: 1.5, borderRadius: "50%" }}>
                  <PeopleAltIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#2b3674">{overviewData.totalEmployees}</Typography>
                  <Typography variant="body2" color="#5d6a8a">Total Pegawai</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#FFF3E0", border: "1px solid #FFCC80", display: "flex", alignItems: "center", gap: 2, minHeight: { xs: 'auto', sm: '120px' } }}>
                <Box sx={{ bgcolor: "#FF9800", p: 1.5, borderRadius: "50%" }}>
                  <EventBusyIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#2b3674">{overviewData.pendingCuti}</Typography>
                  <Typography variant="body2" color="#5d6a8a">Cuti Pending</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#E8F5E9", border: "1px solid #C8E6C9", display: "flex", alignItems: "center", gap: 2, minHeight: { xs: 'auto', sm: '120px' } }}>
                <Box sx={{ bgcolor: "#4CAF50", p: 1.5, borderRadius: "50%" }}>
                  <AttachMoneyIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#2b3674">{overviewData.pendingKasbon}</Typography>
                  <Typography variant="body2" color="#5d6a8a">Kasbon Pending</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#F3E5F5", border: "1px solid #E1BEE7", display: "flex", alignItems: "center", gap: 2, minHeight: { xs: 'auto', sm: '120px' } }}>
                <Box sx={{ bgcolor: "#9C27B0", p: 1.5, borderRadius: "50%" }}>
                  <ScheduleIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#2b3674">{overviewData.pendingOvertime}</Typography>
                  <Typography variant="body2" color="#5d6a8a">Overtime Pending</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #E9EDF7", boxShadow: "0px 4px 15px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="#2b3674" display="flex" alignItems="center" gap={1}>
              <AssignmentLateIcon sx={{ color: "#07ABE8" }} /> Notifikasi
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {!hasNotif ? (
              <Alert severity="info" variant="standard" sx={{ borderRadius: 2 }}>
                Tidak ada permohonan pending saat ini.
              </Alert>
            ) : (
              <List sx={{ width: "100%" }}>
                {notif.cuti.map((item) => (
                  <ListItem key={item.id} sx={{ bgcolor: "#FFF8E1", borderLeft: "4px solid #FFC107", mb: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <ListItemText primary={<Typography variant="subtitle2" fontWeight="bold" color="warning.dark">Cuti: {item.name}</Typography>} secondary={<span style={{fontSize: '0.8rem', color: '#616161'}}>{item.tanggal}</span>} />
                    <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>Lihat</Button>
                  </ListItem>
                ))}
                {notif.kasbon.map((item) => (
                  <ListItem key={item.id} sx={{ bgcolor: "#E8F5E9", borderLeft: "4px solid #4CAF50", mb: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <ListItemText primary={<Typography variant="subtitle2" fontWeight="bold" color="success.dark">Kasbon: {item.name}</Typography>} secondary={<span style={{fontSize: '0.8rem', color: '#616161'}}>{item.tanggal}</span>} />
                     <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>Lihat</Button>
                  </ListItem>
                ))}
                 {notif.overtime.map((item) => (
                  <ListItem key={item.id} sx={{ bgcolor: "#E3F2FD", borderLeft: "4px solid #2196F3", mb: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <ListItemText primary={<Typography variant="subtitle2" fontWeight="bold" color="info.dark">Overtime: {item.name}</Typography>} secondary={<span style={{fontSize: '0.8rem', color: '#616161'}}>{item.tanggal}</span>} />
                     <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>Lihat</Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Box mt={4}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #E9EDF7", boxShadow: "0px 4px 15px rgba(0,0,0,0.05)" }}>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#2b3674" display="flex" alignItems="center" gap={1}>
                <PeopleAltIcon sx={{ color: "#07ABE8" }} /> Belum Absen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {belumAbsen.length === 0 ? (
                <Typography textAlign="center" color="success.main" py={2}>Semua hadir!</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 250 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#E9EDF7", color: "#2b3674" }}>Nama</TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#E9EDF7", color: "#2b3674" }}>Dept</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {belumAbsen.map((p: Employee) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.department || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}