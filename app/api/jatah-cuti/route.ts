import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT
        j.id,
        j.employee_id,
        a.name AS employee_name,       
        j.department_id,
        d.name AS department,
        j.jatah_cuti,
        j.cuti_terpakai,
        j.sisa_cuti,
        j.created_at,
        j.updated_at
      FROM jatah_cuti j
      LEFT JOIN account a ON j.employee_id = a.id
      LEFT JOIN department d ON j.department_id = d.id
      ORDER BY j.created_at DESC
    `);

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data jatah cuti" }, { status: 500 });
  }
}
