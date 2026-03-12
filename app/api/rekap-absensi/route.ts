import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// Helper: konversi tanggal apapun ke 'YYYY-MM-DD' (robust)
function toYMDString(date: string | Date): string {
  if (typeof date === "string" && date.length >= 10) {
    // Kalau sudah string tanggal
    return date.slice(0, 10);
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: get all working days (termasuk tanggal akhir!)
function getWorkingDays(start: string, end: string, excludeDates: string[]) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days: string[] = [];
  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const iso = d.toISOString().slice(0, 10);
    if (!excludeDates.includes(iso)) {
      days.push(iso);
    }
  }
  return days;
}

// Helper: jam float ke string jam/menit
function formatJamMenit(jamFloat: number): string {
  const jam = Math.floor(jamFloat);
  const menit = Math.round((jamFloat - jam) * 60);
  if (jam > 0 && menit > 0) return `${jam} jam ${menit} menit`;
  if (jam > 0) return `${jam} jam`;
  return `${menit} menit`;
}

// Helper: konversi tanggal ke date only (untuk cek cuti)
function toDateOnly(d: string | Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const tanggalMulai = url.searchParams.get("tanggalMulai");
    const tanggalAkhir = url.searchParams.get("tanggalAkhir");
    const departmentId = url.searchParams.get("departmentId");
    const searchNama = url.searchParams.get("searchNama") || "";
    const excludeDates = url.searchParams.getAll("excludeDates") || [];

    if (!tanggalMulai || !tanggalAkhir) {
      return NextResponse.json({ error: "Tanggal mulai & akhir wajib" }, { status: 400 });
    }

    // Query pegawai
    let sqlEmp = `
      SELECT a.id AS employeeId, a.NIK, a.username, a.name, a.department_id, d.name AS department,
             a.gaji_pokok, a.uang_makan, a.tunjangan_jabatan
      FROM account a
      LEFT JOIN department d ON a.department_id = d.id
      WHERE a.role <> 'admin'
    `;
    const empParams: any[] = [];
    if (departmentId) {
      sqlEmp += " AND a.department_id = ?";
      empParams.push(Number(departmentId));
    }
    if (searchNama) {
      sqlEmp += " AND a.name LIKE ?";
      empParams.push(`%${searchNama}%`);
    }
    const [employees]: any = await db.query(sqlEmp, empParams);

    // Generator tanggal kerja
    const workingDays = getWorkingDays(tanggalMulai, tanggalAkhir, excludeDates);

    // Query absensi: <= (field date tipe DATE)
    const [absensiData]: any = await db.query(
      `SELECT * FROM absensi WHERE date >= ? AND date <= ?`,
      [tanggalMulai, tanggalAkhir]
    );

    // Query cuti
    const [cutiData]: any = await db.query(
      `SELECT * FROM cuti WHERE status = 'approved' AND tgl_mulai <= ? AND tgl_selesai >= ?`,
      [tanggalAkhir, tanggalMulai]
    );

    // Query lembur: <= (field tanggal tipe DATE)
    const [overtimeData]: any = await db.query(
      `SELECT * FROM overtime WHERE tanggal >= ? AND tanggal <= ? AND (status = 'approve' OR status = 'approved')`,
      [tanggalMulai, tanggalAkhir]
    );

    // Rekap logic (CLEAN, TIDAK ADA SHIFT/AKAL2AN)
    const rekap = employees.map((emp: any) => {
      const absenEmp: any[] = absensiData.filter((a: any) => a.employee_id == emp.employeeId);
      const cutiEmp: any[] = cutiData.filter((c: any) => c.employee_id == emp.employeeId);
      const overtimeEmp: any[] = overtimeData.filter((o: any) => o.employee_id == emp.employeeId);

      let totalHadir = 0, totalIzinCuti = 0, totalAlfa = 0, totalWFH = 0;
      for (const day of workingDays) {
        // Cari absensi pada hari ini
        const absenHari = absenEmp.find((a: any) => toYMDString(a.date) === day);

        if (absenHari) {
          if (absenHari.status === "Hadir") totalHadir++;
          else if (absenHari.status === "Terlambat") totalHadir++;
          else if (absenHari.status === "WFH") totalWFH++;
          else if (["Izin", "Cuti"].includes(absenHari.status)) totalIzinCuti++;
          else totalAlfa++;
        } else {
          // Cek cuti
          const isCuti = cutiEmp.some(
            (c: any) =>
              toDateOnly(c.tgl_mulai) <= toDateOnly(day) &&
              toDateOnly(c.tgl_selesai) >= toDateOnly(day)
          );
          if (isCuti) totalIzinCuti++;
          else totalAlfa++;
        }
      }

      let totalLemburJam = 0;
      for (const o of overtimeEmp) {
        if (o.start_time && o.end_time) {
          const [sh, sm] = o.start_time.split(":").map(Number);
          const [eh, em] = o.end_time.split(":").map(Number);
          let startMinutes = sh * 60 + sm;
          let endMinutes = eh * 60 + em;
          let durasi = endMinutes - startMinutes;
          if (durasi < 0) durasi += 24 * 60;
          totalLemburJam += durasi / 60;
        }
      }
      const totalUangMakan = totalHadir * (emp.uang_makan || 0);
      totalLemburJam = Math.round(totalLemburJam * 100) / 100;

      let totalTerlambatMenit = 0;
      for (const absen of absenEmp) {
        if (absen.total_terlambat && !isNaN(absen.total_terlambat)) {
          totalTerlambatMenit += Number(absen.total_terlambat);
        }
      }

      return {
        employeeId: emp.employeeId,
        NIK: emp.NIK,
        username: emp.username,
        name: emp.name,
        department: emp.department,
        departmentId: emp.department_id,
        totalHadir,
        totalTerlambatMenit,
        totalIzinCuti,
        totalWFH,
        totalAlfa,
        totalLembur: totalLemburJam,
        totalLemburFormatted: formatJamMenit(totalLemburJam),
        gajiPokok: emp.gaji_pokok || 0,
        uangMakan: emp.uang_makan || 0,
        totalUangMakan,
        tunjanganJabatan: emp.tunjangan_jabatan || 0,
      };
    });

    return NextResponse.json({ success: true, data: rekap });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Error rekap", error: String(err) }, { status: 500 });
  }
}
