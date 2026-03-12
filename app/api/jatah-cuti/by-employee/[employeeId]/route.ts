import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { employeeId: number } }
) {
  try {
    const { employeeId } = await params;

    const [result]: any = await db.query(
      "DELETE FROM jatah_cuti WHERE employee_id = ?",
      [Number(employeeId)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Jatah cuti tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedCount: result.affectedRows });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus jatah cuti" }, { status: 500 });
  }
}
