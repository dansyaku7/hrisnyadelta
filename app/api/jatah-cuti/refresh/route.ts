import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

const DEFAULT_JATAH_CUTI = 12;

export async function POST(req: NextRequest) {
  try {
    const [employees]: any = await db.query(
      "SELECT id, name, department_id FROM account WHERE role <> 'admin'"
    );

    const [jatahCutiAll]: any = await db.query(
      "SELECT employee_id FROM jatah_cuti"
    );
    const existingEmpIds = new Set(jatahCutiAll.map((j: any) => Number(j.employee_id)));

    const newPegawai = employees.filter((e: any) => !existingEmpIds.has(Number(e.id)));

    let inserted = 0;
    if (newPegawai.length) {
      const values = newPegawai.map((e: any) => [
        e.id,
        e.department_id || null,
        DEFAULT_JATAH_CUTI,
        0,
        DEFAULT_JATAH_CUTI,
        new Date(),
        new Date()
      ]);
      await db.query(
        `INSERT INTO jatah_cuti 
        (employee_id, department_id, jatah_cuti, cuti_terpakai, sisa_cuti, created_at, updated_at) 
        VALUES ?`,
        [values]
      );
      inserted = newPegawai.length;
    }

    return NextResponse.json({
      success: true,
      inserted,
      newPegawai: newPegawai.map((n: any) => ({ id: n.id, name: n.name }))
    });
  } catch (err) {
    return NextResponse.json({ error: "Gagal refresh jatah cuti", detail: String(err) }, { status: 500 });
  }
}