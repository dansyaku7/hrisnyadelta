import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

function toHourMinute(str: string) {
  if (!str) return "";
  if (str.length === 5) return str;
  return str.slice(0, 5);
}

export async function GET(
  _req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  const [rows]: any = await db.query(
    `SELECT * FROM shift WHERE id = ? LIMIT 1`,
    [Number(id)]
  );
  const data = rows[0];
  if (!data) {
    return NextResponse.json({ success: false, message: "Shift tidak ditemukan" }, { status: 404 });
  }
  data.start_time = toHourMinute(data.start_time);
  data.end_time = toHourMinute(data.end_time);
  data.break_start = toHourMinute(data.break_start);
  data.break_end = toHourMinute(data.break_end);

  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    let {
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      days,
      updatedBy,
    } = body;

    if (Array.isArray(days)) days = days.join(",");

    const updateDoc: any = {};
    if (name !== undefined) updateDoc.name = name;
    if (startTime !== undefined) updateDoc.start_time = startTime;
    if (endTime !== undefined) updateDoc.end_time = endTime;
    if (breakStart !== undefined) updateDoc.break_start = breakStart;
    if (breakEnd !== undefined) updateDoc.break_end = breakEnd;
    if (days !== undefined) updateDoc.days = days;
    if (updatedBy !== undefined) updateDoc.updated_by = updatedBy;

    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateDoc)) {
      setParts.push(`${key} = ?`);
      params.push(value);
    }
    setParts.push("updated_at = NOW()");
    params.push(Number(id));

    const [result]: any = await db.query(
      `UPDATE shift SET ${setParts.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Shift tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal update shift", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  const { id } = await context.params;
  try {
    const [result]: any = await db.query(
      `DELETE FROM shift WHERE id = ?`,
      [Number(id)]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Shift tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal menghapus shift", error: String(err) }, { status: 500 });
  }
}
