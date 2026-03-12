import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/mysql";

const SECRET = process.env.JWT_SECRET || "fallbackKey";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: any;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const username = payload.username;
  const email = payload.email;
  const departmentId = payload.departmentId;

  try {
    const [users]: any = await db.query(
      email
        ? "SELECT * FROM account WHERE email = ? LIMIT 1"
        : "SELECT * FROM account WHERE username = ? LIMIT 1",
      [email || username]
    );
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let departmentName = "-";
    if (departmentId) {
      const [departments]: any = await db.query(
        "SELECT name FROM department WHERE id = ? LIMIT 1",
        [departmentId]
      );
      if (departments[0]) departmentName = departments[0].name;
    }

    return NextResponse.json({
      employeeId: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      departmentId: user.department_id,
      department: departmentName,
      lokasiKantorId: user.lokasi_kantor_id,
      shiftId: user.shift_id,
      createdAt: user.created_at,
    });
  } catch (err) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
