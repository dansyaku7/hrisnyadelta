import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const [rows]: any = await db.query(
      `SELECT 
          a.*, 
          DATE_FORMAT(a.expired_at, '%Y-%m-%d') as expired_at
        FROM announcement a
        WHERE a.id = ? LIMIT 1`,
      [Number(id)]
    );
    if (!rows[0]) {
      return NextResponse.json({ success: false, message: "Tidak ditemukan" }, { status: 404 });
    }
    const announcement = rows[0];
    const [pivots]: any = await db.query(
      `SELECT department_id FROM announcement_department WHERE announcement_id = ?`,
      [Number(id)]
    );
    announcement.target = pivots.length > 0 ? pivots.map((p: any) => String(p.department_id)) : null;
    return NextResponse.json({ success: true, data: announcement });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal ambil pengumuman", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    await db.query("DELETE FROM announcement_department WHERE announcement_id = ?", [Number(id)]);
    await db.query("DELETE FROM announcement WHERE id = ?", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error deleting", error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const {
      title,
      content,
      expiredAt,
      priority,
      target,
      updatedBy
    } = body;

    let expiredAtStr: string | null = null;
    if (expiredAt) {
      expiredAtStr =
        typeof expiredAt === "string"
          ? expiredAt.slice(0, 19).replace("T", " ")
          : null;
    }

    await db.query(
      `UPDATE announcement
        SET title = ?, content = ?, expired_at = ?, priority = ?, updated_at = NOW()
        WHERE id = ?`,
      [title, content, expiredAtStr, priority || "sedang", Number(id)]
    );

    await db.query("DELETE FROM announcement_department WHERE announcement_id = ?", [Number(id)]);
    if (Array.isArray(target) && target.length > 0 && !["ALL", "all"].includes(target[0])) {
      for (const departmentId of target) {
        await db.query(
          `INSERT INTO announcement_department (announcement_id, department_id) VALUES (?, ?)`,
          [Number(id), departmentId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal mengedit pengumuman", error: String(err) }, { status: 500 });
  }
}
