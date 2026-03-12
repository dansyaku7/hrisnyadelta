import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const { namaPembuat } = await req.json();

    await db.query(
      `UPDATE payroll 
       SET status = 'published', nama_pembuat = ?, tanggal_published = NOW()
       WHERE id = ?`,
      [namaPembuat, Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error publish payroll", error: String(err) }, { status: 500 });
  }
}
