import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT * FROM lokasi_kantor ORDER BY id DESC");
    return NextResponse.json(rows); 
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengambil lokasi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, latitude, longitude, radius, note } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Nama, Latitude & Longitude wajib diisi" }, { status: 400 });
    }

    const [res]: any = await db.query(
      `INSERT INTO lokasi_kantor 
        (name, address, latitude, longitude, radius, note, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        address || null,
        parseFloat(latitude),
        parseFloat(longitude),
        radius ? parseFloat(radius) : 100,
        note || null,
      ]
    );

    return NextResponse.json({ insertedId: res.insertId });
  } catch (err) {
    return NextResponse.json({ error: "Gagal tambah lokasi" }, { status: 500 });
  }
}
