import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getPasswordStrength } from "@/lib/passwordStrength";
import { signupSchema } from "@/schemas/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "入力内容に問題があります",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      email,
      password,
      name,
    } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    // パスワード強度チェック
    const passwordStrength =
      getPasswordStrength(password);

    if (passwordStrength === "WEAK") {
      return NextResponse.json(
        {
          message:
            "パスワードが弱すぎます。12文字以上で、大文字・小文字・数字・記号を組み合わせてください。",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "このメールアドレスは使用できません",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user,
      },
      { status: 201 },
    );

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        message: "サーバーエラーが発生しました",
      },
      { status: 500 },
    );
  }
}