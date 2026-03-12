import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/mysql";

const SECRET = process.env.JWT_SECRET || "SECRET_KEY_SAJA";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username dan password wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await db.query(
      "SELECT id, username, password, role, department_id FROM account WHERE username = ? LIMIT 1",
      [username]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
        departmentId: user.department_id,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({
      success: true,
      role: user.role || "user",
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, 
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
