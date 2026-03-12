import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// PATCH: Update departemen by id
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    const { name, description } = await req.json();
    const [res]: any = await db.query(
      `UPDATE department SET name = ?, description = ?, updated_at = NOW() WHERE id = ?`,
      [name, description, Number(id)]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Departemen tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal update departemen" }, { status: 500 });
  }
}

// DELETE: Hapus departemen by id
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const [res]: any = await db.query(
      `DELETE FROM department WHERE id = ?`,
      [Number(id)]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Departemen tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus departemen" }, { status: 500 });
  }
}

// GET: Detail departemen by id
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    const [rows]: any = await db.query(
      `SELECT * FROM department WHERE id = ? LIMIT 1`,
      [Number(id)]
    );

    if (!rows[0]) {
      return NextResponse.json({ success: false, message: "Departemen tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal mengambil departemen" }, { status: 500 });
  }
}
