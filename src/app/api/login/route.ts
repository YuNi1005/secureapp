import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "入力内容に問題があります",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      message: "ログインしました",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}