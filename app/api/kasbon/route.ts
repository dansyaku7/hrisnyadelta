import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET(req: NextRequest) {
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

  try {
    const url = req.nextUrl;
    const searchNama = url.searchParams.get("searchNama") || "";
    const status = url.searchParams.get("status") || "";
    const departmentId = url.searchParams.get("departmentId") || "";

    let sql = `
      SELECT 
        k.id, 
        k.employee_id, 
        a.name AS employee_name,
        k.department_id, 
        d.name as department,
        k.tanggal_pengajuan, 
        k.jumlah_pinjaman, 
        k.sisa_pinjaman, 
        k.status
      FROM kasbon k
      LEFT JOIN account a ON k.employee_id = a.id
      LEFT JOIN department d ON k.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (searchNama) {
      sql += " AND a.name LIKE ?";
      params.push(`%${searchNama}%`);
    }
    if (status) {
      sql += " AND k.status = ?";
      params.push(status);
    }
    if (departmentId) {
      sql += " AND k.department_id = ?";
      params.push(Number(departmentId));
    }
    sql += " ORDER BY k.tanggal_pengajuan DESC";

    const [rows]: any = await db.query(sql, params);

    const formatted = rows.map((row: any) => ({
      ...row,
      tanggal_pengajuan: toYMD(row.tanggal_pengajuan),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error get kasbon", error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      !body.employeeId ||
      !body.departmentId ||
      !body.tanggalPengajuan ||
      !body.jumlahPinjaman ||
      !body.alasan
    ) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    const [res]: any = await db.query(
      `INSERT INTO kasbon
        (employee_id, department_id, tanggal_pengajuan, jumlah_pinjaman, alasan, status, sisa_pinjaman, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        body.employeeId,
        body.departmentId,
        body.tanggalPengajuan,
        Number(body.jumlahPinjaman),
        body.alasan,
        "pending",
        Number(body.jumlahPinjaman)
      ]
    );

    return NextResponse.json({ success: true, insertedId: res.insertId });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal input kasbon", error: String(err) }, { status: 500 });
  }
}
