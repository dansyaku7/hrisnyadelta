import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId,
      departmentId,
      shiftId,
      date,
      time,
      latitude,
      longitude,
      status,
      totalTerlambat,
      foto,
    } = body;

    if (
      !employeeId ||
      !departmentId ||
      !date ||
      !time ||
      latitude === undefined ||
      longitude === undefined ||
      !status ||
      !foto
    ) {
      return NextResponse.json({ error: "Data absen tidak lengkap" }, { status: 400 });
    }

    let fotoFinal = foto;
    if (foto && !foto.startsWith("data:image")) {
      fotoFinal = `data:image/jpeg;base64,${foto}`;
    }
    const [result]: any = await db.query(
      `INSERT INTO absensi 
        (employee_id, department_id, shift_id, date, time, latitude, longitude, status, total_terlambat, foto, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        employeeId,
        departmentId,
        shiftId || null,
        date,
        time,
        latitude,
        longitude,
        status,
        totalTerlambat || 0,
        fotoFinal
      ]
    );

    return NextResponse.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menyimpan absen" }, { status: 500 });
  }
}

function toYMD(date: any) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (typeof date === "string" && date.length >= 10) return date.slice(0, 10);
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
  const date = req.nextUrl.searchParams.get("date");
  const employeeId = req.nextUrl.searchParams.get("employeeId");
  try {
    let sql = `
      SELECT 
        a.*, 
        acc.name AS employee_name,
        d.name AS department_name
      FROM absensi a
      LEFT JOIN account acc ON a.employee_id = acc.id
      LEFT JOIN department d ON a.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date) {
      sql += " AND a.date = ?";
      params.push(date);
    }
    if (employeeId) {
      sql += " AND a.employee_id = ?";
      params.push(employeeId);
    }

    sql += " ORDER BY a.created_at DESC";

    const [data]: any = await db.query(sql, params);
    const mapped = (data || []).map((row: any) => ({
      ...row,
      date: toYMD(row.date),
      department_name: row.department_name || "",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching absensi", error: String(err) },
      { status: 500 }
    );
  }
}

