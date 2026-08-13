import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function verifySession() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return {
    session,
    user: session.user,
  };
}