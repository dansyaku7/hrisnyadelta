import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params; 
  try {
    const body = await req.json();
    const updateFields: any = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.address !== undefined) updateFields.address = body.address;
    if (body.latitude !== undefined) updateFields.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateFields.longitude = parseFloat(body.longitude);
    if (body.radius !== undefined) updateFields.radius = parseFloat(body.radius);
    if (body.note !== undefined) updateFields.note = body.note;
    updateFields.updated_at = new Date();

    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateFields)) {
      setParts.push(`${key} = ?`);
      params.push(value);
    }
    params.push(Number(id));

    const [res]: any = await db.query(
      `UPDATE lokasi_kantor SET ${setParts.join(", ")} WHERE id = ?`,
      params
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Lokasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal update lokasi" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params; 
  try {
    const [res]: any = await db.query(
      `DELETE FROM lokasi_kantor WHERE id = ?`,
      [Number(id)]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Lokasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal hapus lokasi" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;

  const [rows]: any = await db.query(
    `SELECT * FROM lokasi_kantor WHERE id = ? LIMIT 1`,
    [Number(id)]
  );
  const lokasi = rows[0];

  if (!lokasi) {
    return NextResponse.json({ error: "Lokasi tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: lokasi });
}
