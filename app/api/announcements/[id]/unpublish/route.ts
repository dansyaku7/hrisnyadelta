import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await db.query(
      "UPDATE announcement SET status = ?, published_at = NULL WHERE id = ?",
      ["draft", Number(id)]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error unpublishing", error: String(err) }, { status: 500 });
  }
}
