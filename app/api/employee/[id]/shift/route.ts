import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const { shiftId } = await req.json();

    if (!shiftId) {
      return NextResponse.json({ error: "shiftId wajib diisi" }, { status: 400 });
    }

    const [res]: any = await db.query(
      `UPDATE account SET shift_id = ? WHERE id = ?`,
      [shiftId, Number(id)]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal update shift pegawai" }, { status: 500 });
  }
}
