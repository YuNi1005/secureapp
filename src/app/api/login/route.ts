import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";
import {
  clearLoginFailures,
  isLoginRateLimited,
  recordLoginAttempt,
} from "@/lib/rateLimit";

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

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const rateLimited = await isLoginRateLimited(
      normalizedEmail,
      ipAddress,
    );

    if (rateLimited) {
      const response = NextResponse.json(
        {
          message:
            "ログイン試行回数が多すぎます。1分後に再度お試しください。",
        },
        { status: 429 },
      );

      response.headers.set("Retry-After", "60");
      response.headers.set("Cache-Control", "no-store");

      return response;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      await recordLoginAttempt(
        normalizedEmail,
        ipAddress,
        false,
      );

      return NextResponse.json(
        {
          message:
            "メールアドレスまたはパスワードが正しくありません",
        },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await recordLoginAttempt(
        normalizedEmail,
        ipAddress,
        false,
      );

      return NextResponse.json(
        {
          message:
            "メールアドレスまたはパスワードが正しくありません",
        },
        { status: 401 },
      );
    }

    await recordLoginAttempt(
      normalizedEmail,
      ipAddress,
      true,
    );

    await clearLoginFailures(
      normalizedEmail,
      ipAddress,
    );

    // 期限切れSessionを削除
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // 同一ユーザーの有効Sessionを取得
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 最大5Sessionまで
    if (activeSessions.length >= 5) {
      const sessionsToDelete = activeSessions.slice(
        0,
        activeSessions.length - 4,
      );

      if (sessionsToDelete.length > 0) {
        await prisma.session.deleteMany({
          where: {
            id: {
              in: sessionsToDelete.map(
                (session) => session.id,
              ),
            },
          },
        });
      }
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

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message: "サーバーエラーが発生しました",
      },
      { status: 500 },
    );
  }
}