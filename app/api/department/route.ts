import { NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

// GET: Ambil semua department
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM department ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Tambah department baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama department wajib diisi.' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO department (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [name, description || null]
    );
    return NextResponse.json({ success: true, message: 'Department berhasil ditambah.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
