import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(req: NextRequest) {
  try {
    const { id, tanggal, keterangan } = await req.json();
    if (!id || !tanggal || !keterangan) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const [exist]: any = await db.query(
      "SELECT id FROM libur_nasional WHERE tanggal = ? AND id != ? LIMIT 1",
      [tanggal, id]
    );
    if (exist.length > 0) {
      return NextResponse.json({ error: "Tanggal sudah ada" }, { status: 400 });
    }

    await db.query(
      "UPDATE libur_nasional SET tanggal = ?, keterangan = ? WHERE id = ?",
      [tanggal, keterangan, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal update hari libur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID wajib" }, { status: 400 });
  }
  try {
    await db.query("DELETE FROM libur_nasional WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus hari libur" }, { status: 500 });
  }
}
