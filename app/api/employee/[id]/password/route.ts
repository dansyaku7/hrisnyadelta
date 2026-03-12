import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  const [res]: any = await db.query(
    `UPDATE account SET password = ? WHERE id = ?`,
    [hashed, Number(id)]
  );

  if (res.affectedRows === 0) {
    return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
