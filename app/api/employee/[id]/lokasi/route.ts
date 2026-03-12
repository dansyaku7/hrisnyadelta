import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const { lokasiKantorId } = await req.json();

  if (!lokasiKantorId) {
    return NextResponse.json({ error: "lokasiKantorId wajib diisi." }, { status: 400 });
  }

  const [res]: any = await db.query(
    `UPDATE account SET lokasi_kantor_id = ? WHERE id = ?`,
    [lokasiKantorId, Number(id)]
  );

  if (res.affectedRows === 0) {
    return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
