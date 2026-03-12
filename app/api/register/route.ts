import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/mysql';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, username, email, password, departmentId } = body;

  if (!name || !username || !password || !departmentId) {
    return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
  }

  try {
    const [userRows] = await db.query(
      'SELECT id FROM account WHERE username = ? LIMIT 1',
      [username]
    );
    if (Array.isArray(userRows) && userRows.length > 0) {
      return NextResponse.json({ error: "Username sudah terdaftar." }, { status: 409 });
    }

    const [shiftRows]: any = await db.query(
      "SELECT id FROM shift WHERE name LIKE '%office%' OR name LIKE '%kantor%' LIMIT 1"
    );
    const shiftId = shiftRows && shiftRows.length > 0 ? shiftRows[0].id : null;

    const [lokasiRows]: any = await db.query(
      "SELECT id FROM lokasi_kantor WHERE name LIKE '%kantor%' OR name LIKE '%lokasi%' LIMIT 1"
    );
    const lokasiKantorId = lokasiRows?.[0]?.id || null;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO account 
        (name, username, email, password, role, department_id, shift_id, lokasi_kantor_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, username, email, hashedPassword, "user", departmentId, shiftId, lokasiKantorId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage?.includes('username')) {
      return NextResponse.json({ error: "Username sudah terdaftar." }, { status: 409 });
    }
    return NextResponse.json({ error: "Register error.", detail: err.message }, { status: 500 });
  }
}
