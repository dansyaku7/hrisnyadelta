import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = await context.params;
    const { nominal } = await req.json();

    if (!nominal || isNaN(nominal)) {
      return NextResponse.json({ error: "Nominal harus diisi" }, { status: 400 });
    }

    const [kasbonRows]: any = await db.query(
      "SELECT id FROM kasbon WHERE id = ?",
      [Number(id)]
    );
    if (!kasbonRows[0]) {
      return NextResponse.json({ error: "Kasbon tidak ditemukan" }, { status: 404 });
    }

    const tanggalISO = new Date().toISOString().slice(0, 10);

    await db.query(
      `INSERT INTO kasbon_pembayaran (kasbon_id, tanggal, nominal) VALUES (?, ?, ?)`,
      [Number(id), tanggalISO, nominal]
    );

    await db.query(
      `UPDATE kasbon SET updated_at = NOW() WHERE id = ?`,
      [Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH kasbon input-bayar error:", err);
    return NextResponse.json({ error: "Gagal input pembayaran kasbon" }, { status: 500 });
  }
}
