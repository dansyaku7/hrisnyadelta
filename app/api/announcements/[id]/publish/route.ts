import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const { publishedBy } = await req.json();

    // Ambil data pengumuman dulu
    const [rows]: any = await db.query(
      "SELECT expired_at FROM announcement WHERE id = ? LIMIT 1",
      [Number(id)]
    );
    if (!rows[0]) {
      return NextResponse.json({ success: false, message: "Pengumuman tidak ditemukan." }, { status: 404 });
    }

    const now = new Date();
    let expiredAt = rows[0].expired_at ? new Date(rows[0].expired_at) : now;

    // Jika expiredAt sudah lewat, perpanjang 7 hari dari sekarang
    if (expiredAt < now) {
      expiredAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    await db.query(
      `UPDATE announcement
       SET status = ?, published_at = ?, published_by = ?, expired_at = ?
       WHERE id = ?`,
      [
        "published",
        now,
        publishedBy,
        expiredAt,
        Number(id)
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error publishing", error: String(err) }, { status: 500 });
  }
}
