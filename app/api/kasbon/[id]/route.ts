import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

function toYMD(date: any): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const [rows]: any = await db.query(
      `
      SELECT 
        k.*, 
        a.name AS employee_name, 
        d.name AS department_name
      FROM kasbon k
      LEFT JOIN account a ON k.employee_id = a.id
      LEFT JOIN department d ON k.department_id = d.id
      WHERE k.id = ?
      LIMIT 1
      `,
      [Number(id)]
    );
    const kasbon = rows[0];

    if (!kasbon) {
      return NextResponse.json({ success: false, message: "Kasbon tidak ditemukan" }, { status: 404 });
    }

    kasbon.tanggal_pengajuan = toYMD(kasbon.tanggal_pengajuan);

    return NextResponse.json({
      success: true,
      data: kasbon,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error get kasbon", error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params; 

    await db.query("DELETE FROM kasbon_pembayaran WHERE kasbon_id = ?", [Number(id)]);

    const [result]: any = await db.query(
      "DELETE FROM kasbon WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Data kasbon tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Kasbon berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus kasbon", error: String(error) }, { status: 500 });
  }
}
