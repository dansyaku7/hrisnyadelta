import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const periodeMulai = data.periodeMulai || data.tanggalMulai;
    const periodeAkhir = data.periodeAkhir || data.tanggalAkhir;

    if (!data.employeeId || !periodeMulai || !periodeAkhir) {
      return NextResponse.json({ error: "Data karyawan & periode wajib diisi" }, { status: 400 });
    }

    const kasbonId = data.kasbonId ? Number(data.kasbonId) : null;
    const gajiPokok = Number(data.gajiPokok) || 0;
    const totalUangMakan = Number(data.totalUangMakan) || 0;
    const tunjanganJabatan = Number(data.tunjanganJabatan) || 0;
    const tunjanganLembur = Number(data.tunjanganLembur) || 0;
    const tunjanganLain = Number(data.tunjanganLain) || 0;
    const thrBonus = Number(data.thrBonus) || 0;
    const potonganBpjs = Number(data.potonganBpjs) || 0;
    const potonganPajak = Number(data.potonganPajak) || 0;
    const potonganKasbon = Number(data.potonganKasbon) || 0;
    const status = data.status || "unpublished";

    await db.query(
      `INSERT INTO payroll
        (employee_id, kasbon_id, department_id, periode_mulai, periode_akhir, NIK, department, gaji_pokok, total_hadir, total_alfa, total_izin_cuti, total_wfh, total_uang_makan, tunjangan_jabatan, tunjangan_lembur, tunjangan_lain, thr_bonus, potongan_bpjs, potongan_pajak, potongan_kasbon, total_lembur, total_lembur_formatted, total_terlambat, total_jam_kerja, uang_makan, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.employeeId,
        kasbonId,
        data.departmentId, 
        periodeMulai,
        periodeAkhir,
        data.NIK,
        data.department,
        gajiPokok,
        data.totalHadir || 0,
        data.totalAlfa || 0,
        data.totalIzinCuti || 0,
        data.totalWFH || 0,
        totalUangMakan,
        tunjanganJabatan,
        tunjanganLembur,
        tunjanganLain,
        thrBonus,
        potonganBpjs,
        potonganPajak,
        potonganKasbon,
        data.totalLembur || 0,
        data.totalLemburFormatted || '',
        data.totalTerlambatMenit || 0,
        data.totalJamKerja || 0,
        data.uangMakan || 0,
        status 
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Payroll Error", err);
    return NextResponse.json({ error: "Gagal input payroll", detail: err?.message || String(err) }, { status: 500 });
  }
}

function toYMD(date: any) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const tanggalMulai = url.searchParams.get("tanggalMulai");
    const tanggalAkhir = url.searchParams.get("tanggalAkhir");
    const searchNama = url.searchParams.get("searchNama") || "";

    let sql = `
      SELECT
        p.id,
        p.employee_id,
        p.kasbon_id,
        p.department_id,
        a.name AS employee_name,
        d.name AS department_name,
        p.periode_mulai,
        p.periode_akhir,
        p.gaji_pokok,
        p.total_uang_makan,
        p.tunjangan_jabatan,
        p.tunjangan_lembur,
        p.tunjangan_lain,
        p.thr_bonus,
        p.potongan_bpjs,
        p.potongan_pajak,
        p.potongan_kasbon,
        p.status,
        p.created_at,
        p.updated_at
      FROM payroll p
      LEFT JOIN account a ON p.employee_id = a.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (tanggalMulai && tanggalAkhir) {
      sql += " AND p.periode_mulai >= ? AND p.periode_akhir <= ?";
      params.push(tanggalMulai, tanggalAkhir);
    }
    if (searchNama) {
      sql += " AND a.name LIKE ?";
      params.push(`%${searchNama}%`);
    }

    sql += " ORDER BY p.periode_akhir DESC";

    const [rows]: any = await db.query(sql, params);

    const data = rows.map((p: any) => ({
      ...p,
      tanggal_mulai: toYMD(p.periode_mulai),
      tanggal_akhir: toYMD(p.periode_akhir),
      takeHomePay:
        Number(p.gaji_pokok || 0) +
        Number(p.total_uang_makan || 0) +
        Number(p.tunjangan_jabatan || 0) +
        Number(p.tunjangan_lembur || 0) +
        Number(p.tunjangan_lain || 0) +
        Number(p.thr_bonus || 0) -
        Number(p.potongan_bpjs || 0) -
        Number(p.potongan_pajak || 0) -
        Number(p.potongan_kasbon || 0),
      kasbon_id: p.kasbon_id ?? null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error get payroll", error: String(err) }, { status: 500 });
  }
}
