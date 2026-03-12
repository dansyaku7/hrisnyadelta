import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// GET: Ambil detail pegawai (dengan join department)
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  const [rows]: any = await db.query(
    `
    SELECT 
      a.id, a.name, a.username, a.email, a.department_id, d.name AS department, a.phone, 
      a.birthdate, a.address, a.norek, a.atas_nama, a.gaji_pokok, a.uang_makan, 
      a.tunjangan_jabatan, a.NIK
    FROM account a
    LEFT JOIN department d ON a.department_id = d.id
    WHERE a.id = ? LIMIT 1
    `,
    [Number(id)]
  );

  if (!rows[0]) {
    return NextResponse.json({ success: false, message: "Pegawai tidak ditemukan" }, { status: 404 });
  }

  const emp = rows[0];

  const result = {
    id: emp.id,
    name: emp.name || "",
    username: emp.username || "",
    email: emp.email || "",
    department: emp.department || "",
    departmentId: emp.department_id || "",
    phone: emp.phone || "",
    birthdate: emp.birthdate || "",
    address: emp.address || "",
    norek: emp.norek || "",
    atasNama: emp.atas_nama || "",
    gajiPokok: emp.gaji_pokok || "",
    uangMakan: emp.uang_makan || "",
    tunjanganJabatan: emp.tunjangan_jabatan || "",
    NIK: emp.NIK || ""
  };

  return NextResponse.json({ success: true, data: result });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const {
      name,
      username,
      email,
      departmentId,
      phone,
      birthdate,
      address,
      norek,
      atasNama,
      gajiPokok,
      uangMakan,
      tunjanganJabatan,
      NIK
    } = body;

    const updateData: any = {
      name,
      username,
      NIK,
      email,
      department_id: departmentId,
      phone,
      birthdate,
      address,
      norek,
      atas_nama: atasNama,
      gaji_pokok: gajiPokok,
      uang_makan: uangMakan,
      tunjangan_jabatan: tunjanganJabatan,
      updated_at: new Date(),
    };

    Object.keys(updateData).forEach(key => updateData[key] == null && delete updateData[key]);

    const setParts: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(updateData)) {
      setParts.push(`${key} = ?`);
      params.push(value);
    }
    params.push(Number(id));

    const [result]: any = await db.query(
      `UPDATE account SET ${setParts.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Tidak ada data yang diupdate" }, { status: 404 });
    }
  } catch (err) {
    console.error("PATCH employee error:", err);
    return NextResponse.json({ success: false, error: "Gagal update data pegawai" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  const [res]: any = await db.query(
    `DELETE FROM account WHERE id = ?`,
    [Number(id)]
  );
  if (res.affectedRows === 0) {
    return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
