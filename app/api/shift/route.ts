import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

function toHourMinute(str: string) {
  if (!str) return "";
  if (str.length === 5) return str;
  return str.slice(0, 5);
}

export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT * FROM shift ORDER BY id DESC");
    const data = rows.map((row: any) => ({
      ...row,
      start_time: toHourMinute(row.start_time),
      end_time: toHourMinute(row.end_time),
      break_start: toHourMinute(row.break_start),
      break_end: toHourMinute(row.break_end),
    }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching shift", error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      days,
    } = body;

    if (!name || !startTime || !endTime || !days) {
      return NextResponse.json(
        { success: false, message: "Nama, jam masuk, jam keluar, dan hari wajib diisi!" },
        { status: 400 }
      );
    }

    const daysString = Array.isArray(days) ? days.join(",") : days;

    await db.query(
      `INSERT INTO shift
        (name, start_time, end_time, break_start, break_end, days, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        startTime,
        endTime,
        breakStart || null,
        breakEnd || null,
        daysString
      ]
    );


    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Gagal menambah shift", error: String(err) },
      { status: 500 }
    );
  }
}
