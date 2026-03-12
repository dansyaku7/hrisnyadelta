import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET() {
  try {
    const [employees]: any = await db.query(`
      SELECT 
        a.id, a.name, a.username, a.email, a.role, a.department_id, a.shift_id, a.lokasi_kantor_id, 
        a.created_at, a.nik, a.address, a.phone, a.norek, a.birthdate, a.gaji_pokok, a.tunjangan_jabatan, a.uang_makan,
        d.name AS department,
        s.name AS shift,
        l.name AS lokasi
      FROM account a
      LEFT JOIN department d ON a.department_id = d.id
      LEFT JOIN shift s ON a.shift_id = s.id
      LEFT JOIN lokasi_kantor l ON a.lokasi_kantor_id = l.id
      WHERE a.role <> 'admin'
      ORDER BY a.created_at DESC
    `);

    if (Array.isArray(employees)) {
      employees.forEach((e: any) => { delete e.password; });
    }

    return NextResponse.json({
      success: true,
      message: "halo",
      data: employees
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Error fetching employees",
      error: String(err)
    }, { status: 500 });
  }
}
