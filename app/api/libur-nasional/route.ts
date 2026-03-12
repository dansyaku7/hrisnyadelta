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

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  try {
    let sql = "SELECT * FROM libur_nasional";
    const params: any[] = [];

    if (start && end) {
      sql += " WHERE tanggal BETWEEN ? AND ?";
      params.push(start, end);
    }

    sql += " ORDER BY tanggal ASC";
    const [rows]: any = await db.query(sql, params);

    const data = rows.map((row: any) => ({
      ...row,
      tanggal: toYMD(row.tanggal),
    }));

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal ambil data libur nasional" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tanggal, keterangan } = await req.json();
    if (!tanggal || !keterangan) {
      return NextResponse.json({ error: "Tanggal dan keterangan wajib" }, { status: 400 });
    }

    const [exist]: any = await db.query(
      "SELECT id FROM libur_nasional WHERE tanggal = ? LIMIT 1",
      [tanggal]
    );
    if (exist.length > 0) {
      return NextResponse.json({ error: "Tanggal sudah ada" }, { status: 400 });
    }

    const [result]: any = await db.query(
      "INSERT INTO libur_nasional (tanggal, keterangan) VALUES (?, ?)",
      [tanggal, keterangan]
    );
    return NextResponse.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Gagal tambah hari libur" }, { status: 500 });
  }
}
