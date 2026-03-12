import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(req: NextRequest) {
  try {
    const { employeeId, jumlahPotong } = await req.json();
    if (!employeeId || !jumlahPotong || isNaN(jumlahPotong)) {
      return NextResponse.json({ error: "employeeId & jumlahPotong wajib" }, { status: 400 });
    }

    const [kasbonRows]: any = await db.query(
      `SELECT * FROM kasbon
       WHERE employee_id = ?
         AND (status IN ('Cicil', 'Belum Lunas', 'approved', 'Approved') OR sisa_pinjaman > 0)
       ORDER BY tanggal_pengajuan ASC
       LIMIT 1`,
      [employeeId]
    );
    const kasbon = kasbonRows[0];

    if (!kasbon) {
      return NextResponse.json({ error: "Tidak ada kasbon aktif untuk pegawai ini" }, { status: 404 });
    }

    let sisaBaru = (kasbon.sisa_pinjaman ?? kasbon.jumlah_pinjaman) - jumlahPotong;
    if (sisaBaru < 0) sisaBaru = 0;
    const statusPinjaman = sisaBaru === 0 ? "Lunas" : "Cicil";

    await db.query(
      `UPDATE kasbon SET sisa_pinjaman = ?, status = ? WHERE id = ?`,
      [sisaBaru, statusPinjaman, kasbon.id]
    );

    return NextResponse.json({ success: true, sisaPinjaman: sisaBaru, statusPinjaman });
  } catch (err) {
    return NextResponse.json({ error: "Gagal potong kasbon", detail: String(err) }, { status: 500 });
  }
}
