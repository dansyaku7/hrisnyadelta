import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

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

function toHM(time: any) {
  if (!time) return "";
  if (typeof time === "string" && /^\d{2}:\d{2}$/.test(time)) return time;
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export async function GET() {
  try {
    const [data]: any = await db.query(`
      SELECT
        o.id,
        o.employee_id,
        a.name AS employee_name,
        o.department_id,
        d.name AS department,
        o.tanggal,
        o.start_time, 
        o.end_time,
        o.alasan,
        o.status,
        o.created_at,
        o.updated_at
      FROM overtime o
      LEFT JOIN account a ON o.employee_id = a.id
      LEFT JOIN department d ON o.department_id = d.id
      ORDER BY o.created_at DESC
    `);

    const formatted = data.map((row: any) => ({
      ...row,
      tanggal: toYMD(row.tanggal),
      start_time: toHM(row.start_time),
      end_time: toHM(row.end_time),
      created_at: toYMD(row.created_at),
      updated_at: toYMD(row.updated_at),
    }));

    return NextResponse.json({ data: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah data overtime baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Pastikan field minimal (employee_id, tanggal, jam, alasan)
    if (
      !body.employee_id ||
      !body.department_id ||
      !body.tanggal ||
      !body.start_time ||
      !body.end_time ||
      !body.alasan
    ) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const [result]: any = await db.query(
      `INSERT INTO overtime
        (employee_id, department_id, tanggal, start_time, end_time, alasan, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.employee_id,
        body.department_id,
        body.tanggal,
        body.start_time,
        body.end_time,
        body.alasan,
        body.status || "pending"
      ]
    );
    return NextResponse.json({ insertedId: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}
