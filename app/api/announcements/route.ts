import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET() {
  try {
    const [announcements]: any = await db.query(`
      SELECT 
        a.*, 
        DATE_FORMAT(a.expired_at, '%Y-%m-%d') as expired_at
      FROM announcement a
      ORDER BY a.created_at DESC
    `);

    const data = await Promise.all(announcements.map(async (a: any) => {
      const [pivots]: any = await db.query(
        `SELECT department_id FROM announcement_department WHERE announcement_id = ?`, 
        [a.id]
      );
      return {
        ...a,
        target: pivots.length > 0 ? pivots.map((p: any) => Number(p.department_id)) : null
      };
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching data", error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      content,
      expiredAt,
      priority,
      target,         // array of department_id INT (misal: [1,2,3]) atau string "ALL"
      createdBy
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Judul dan isi wajib diisi!" },
        { status: 400 }
      );
    }

    // Handle expired_at: harus string "YYYY-MM-DD" atau "YYYY-MM-DD HH:mm:ss"
    const expiredAtStr = expiredAt
      ? (typeof expiredAt === "string"
          ? expiredAt.slice(0, 19).replace("T", " ")
          : null)
      : null;

    // 1. Insert ke tabel announcement
    const [res]: any = await db.query(
      `INSERT INTO announcement
        (title, content, expired_at, priority, created_by, status, created_at, updated_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL, NULL)`,
      [
        title,
        content,
        expiredAtStr,
        priority || "sedang",
        createdBy || null,
        "draft"
      ]
    );
    const announcementId = res.insertId;

    // 2. Insert ke tabel announcement_department jika ada target department
    if (
      Array.isArray(target) &&
      target.length > 0 &&
      !["ALL", "all"].includes(target[0])
    ) {
      for (const departmentId of target) {
        await db.query(
          `INSERT INTO announcement_department (announcement_id, department_id) VALUES (?, ?)`,
          [announcementId, departmentId]
        );
      }
    }
    // Jika target "ALL" atau kosong, tidak perlu insert ke pivot

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Gagal menambah pengumuman", error: String(err) },
      { status: 500 }
    );
  }
}
