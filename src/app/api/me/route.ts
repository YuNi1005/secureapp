import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";

export async function GET() {
  const result = await verifySession();

  if (!result) {
    return NextResponse.json(
      {
        message: "認証が必要です",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
  });
}