import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = await context.params;
    const { jatah_cuti, sisa_cuti, cuti_terpakai } = await req.json();

    if (sisa_cuti == null || cuti_terpakai == null) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const [result]: any = await db.query(
      `UPDATE jatah_cuti 
       SET 
         ${jatah_cuti !== undefined ? 'jatah_cuti = ?,' : ''}
         sisa_cuti = ?, 
         cuti_terpakai = ?, 
         updated_at = NOW() 
       WHERE id = ?`,
      jatah_cuti !== undefined
        ? [jatah_cuti, sisa_cuti, cuti_terpakai, Number(id)]
        : [sisa_cuti, cuti_terpakai, Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan atau tidak berubah" }, { status: 404 });
    }

    return NextResponse.json({ message: "Jatah cuti berhasil diupdate" });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Gagal update jatah cuti" }, { status: 500 });
  }
}
