import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM overtime WHERE id = ? LIMIT 1",
      [Number(id)]
    );
    const overtime = rows[0];

    if (!overtime) {
      return NextResponse.json({ error: "Data lembur tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: overtime });
  } catch (e) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updateFields: any = {};

    if (body.tanggal !== undefined) updateFields.tanggal = body.tanggal;
    if (body.startTime !== undefined) updateFields.start_time = body.startTime;
    if (body.endTime !== undefined) updateFields.end_time = body.endTime;
    if (body.alasan !== undefined) updateFields.alasan = body.alasan;
    if (body.status !== undefined) updateFields.status = body.status;
    updateFields.updated_at = new Date();

    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateFields)) {
      setParts.push(`${key} = ?`);
      params.push(value);
    }
    params.push(Number(id));

    const [result]: any = await db.query(
      `UPDATE overtime SET ${setParts.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Data lembur tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const [result]: any = await db.query(
      "DELETE FROM overtime WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Data lembur tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
