import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updateFields: any = {};

    if ("status" in body) updateFields.status = body.status;
    if ("checkOutTime" in body) updateFields.checkOutTime = body.checkOutTime;
    if ("totalTerlambat" in body) updateFields.totalTerlambat = body.totalTerlambat;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "Tidak ada field yang diupdate" }, { status: 400 });
    }

    // Build SET statement & params
    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateFields)) {
      // Mapping field untuk MySQL (snake_case)
      let field = key;
      if (field === "checkOutTime") field = "check_out_time";
      if (field === "totalTerlambat") field = "total_terlambat";
      setParts.push(`${field} = ?`);
      params.push(value);
    }
    params.push(Number(id)); // ID param

    const sql = `UPDATE absensi SET ${setParts.join(", ")} WHERE id = ?`;
    const [result]: any = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Data absensi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Data absensi berhasil diupdate" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal update absensi" }, { status: 500 });
  }
}
