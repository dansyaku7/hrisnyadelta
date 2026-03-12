import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";


function toYMD(date: any) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Jika ternyata date adalah objek Date
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // Jika format timestamp/datetime string, tetap parse
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
// GET: Ambil detail payroll by id
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    // Join untuk ambil nama pegawai & department
    const [rows]: any = await db.query(
      `SELECT 
        p.*, 
        a.name AS employee_name, 
        d.name AS department_name 
      FROM payroll p
      LEFT JOIN account a ON p.employee_id = a.id
      LEFT JOIN department d ON a.department_id = d.id
      WHERE p.id = ? LIMIT 1`,
      [Number(id)]
    );
    const data = rows[0];

    if (!data) {
      return NextResponse.json({ success: false, message: "Payroll tidak ditemukan" }, { status: 404 });
    }

    // Format tanggal-tanggal
    const formatted = {
      ...data,
      periode_mulai: toYMD(data.periode_mulai),
      periode_akhir: toYMD(data.periode_akhir),
      created_at: data.created_at ? toYMD(data.created_at) : "",
      updated_at: data.updated_at ? toYMD(data.updated_at) : "",
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error get detail payroll", error: String(err) }, { status: 500 });
  }
}

// DELETE: Hapus payroll by id (restore potongan kasbon jika ada)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    // Ambil payroll detail
    const [rows]: any = await db.query(
      "SELECT * FROM payroll WHERE id = ? LIMIT 1",
      [Number(id)]
    );
    const payroll = rows[0];

    if (!payroll) {
      return NextResponse.json({ success: false, message: "Payroll tidak ditemukan" }, { status: 404 });
    }

    // Jika ada potongan kasbon
    if (payroll.potongan_kasbon && payroll.potongan_kasbon > 0 && payroll.employee_id) {
      // Cari kasbon aktif pegawai (status: approved)
      const [kasbonRows]: any = await db.query(
        "SELECT * FROM kasbon WHERE employee_id = ? AND status = 'approved' ORDER BY tanggal_pengajuan ASC LIMIT 1",
        [payroll.employee_id]
      );
      const kasbon = kasbonRows[0];

      if (kasbon) {
        // Tambahkan kembali ke sisa_pinjaman
        const sisaBaru = Number(kasbon.sisa_pinjaman ?? kasbon.jumlah_pinjaman ?? 0) + Number(payroll.potongan_kasbon);
        await db.query(
          `UPDATE kasbon SET sisa_pinjaman = ?, status = 'approved' WHERE id = ?`,
          [sisaBaru, kasbon.id]
        );
      }
    }

    // Hapus payroll
    await db.query(
      "DELETE FROM payroll WHERE id = ?",
      [Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gagal hapus payroll", error: String(err) }, { status: 500 });
  }
}
