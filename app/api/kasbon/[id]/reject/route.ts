import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params; 
  try {
    // Update status kasbon ke 'rejected' jika masih 'pending'
    const [result]: any = await db.query(
      `UPDATE kasbon 
       SET status = 'rejected', tanggal_rejected = NOW() 
       WHERE id = ? AND status = 'pending'`,
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Gagal reject (mungkin sudah diproses)" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal reject kasbon", error: String(err) }, { status: 500 });
  }
}
