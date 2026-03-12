import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

function toYMD(date: any) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const [rows]: any = await db.query(
      `
      SELECT
        c.*,
        a.name AS employee_name,
        d.name AS department_name
      FROM cuti c
      LEFT JOIN account a ON c.employee_id = a.id
      LEFT JOIN department d ON c.department_id = d.id
      WHERE c.id = ? LIMIT 1
      `,
      [Number(id)]
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    const row = rows[0];
    // Format tanggal agar aman dibaca frontend
    const formatted = {
      ...row,
      tgl_mulai: toYMD(row.tgl_mulai),
      tgl_selesai: toYMD(row.tgl_selesai),
    };
    return NextResponse.json({ data: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil detail" }, { status: 500 });
  }
}

// PATCH: Update cuti by id
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updateFields: any = {};
    if (body.tglMulai !== undefined) updateFields.tgl_mulai = body.tglMulai;
    if (body.tglSelesai !== undefined) updateFields.tgl_selesai = body.tglSelesai;
    if (body.jenis !== undefined) updateFields.jenis = body.jenis;
    if (body.alasan !== undefined) updateFields.alasan = body.alasan;
    if (body.status !== undefined) updateFields.status = body.status;

    if (body.tglMulai && body.tglSelesai) {
      updateFields.lama =
        Math.ceil(
          (new Date(body.tglSelesai).getTime() - new Date(body.tglMulai).getTime()) / (1000 * 3600 * 24)
        ) + 1;
    }
    updateFields.updated_at = new Date();

    // Build query SET dinamis
    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateFields)) {
      setParts.push(`${key} = ?`);
      params.push(value);
    }
    params.push(Number(id));

    const [res]: any = await db.query(
      `UPDATE cuti SET ${setParts.join(", ")} WHERE id = ?`,
      params
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE: Hapus cuti by id
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const [res]: any = await db.query(
      "DELETE FROM cuti WHERE id = ?",
      [Number(id)]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}
