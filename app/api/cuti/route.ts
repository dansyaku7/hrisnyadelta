import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

function toYMD(date:any) {
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

export async function GET() {
  try {
    const [data]: any = await db.query(
      `
      SELECT 
        c.*,
        a.name AS employee_name,
        d.name AS department_name
      FROM cuti c
      LEFT JOIN account a ON c.employee_id = a.id
      LEFT JOIN department d ON c.department_id = d.id
      ORDER BY c.created_at DESC
      `
    );
    const formatted = data.map((row: any) => ({
      ...row,
      tgl_mulai: toYMD(row.tgl_mulai),
      tgl_selesai: toYMD(row.tgl_selesai),
    }));
    return NextResponse.json({ data: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data cuti" }, { status: 500 });
  }
}

// POST: Tambah cuti baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, name, tglMulai, tglSelesai, jenis, alasan, departmentId } = body;

    if (!employeeId || !name || !tglMulai || !tglSelesai || !jenis || !alasan) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Hitung jumlah hari cuti (PERBAIKAN DI SINI)
    const dMulai = new Date(tglMulai);
    const dSelesai = new Date(tglSelesai);
    dMulai.setHours(0, 0, 0, 0);
    dSelesai.setHours(0, 0, 0, 0);
    const lama = Math.floor((dSelesai.getTime() - dMulai.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Insert ke tabel cuti
    const [res]: any = await db.query(
      `INSERT INTO cuti 
        (employee_id, department_id, name, tgl_mulai, tgl_selesai, jenis, alasan, lama, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        employeeId,
        departmentId || null,
        name,
        tglMulai,
        tglSelesai,
        jenis,
        alasan,
        lama,
        "pending"
      ]
    );

    return NextResponse.json({ insertedId: res.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menambah cuti" }, { status: 500 });
  }
}
