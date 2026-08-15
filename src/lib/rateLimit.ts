import { prisma } from "@/lib/prisma";

const WINDOW_MS = 60 * 1000;
const MAX_FAILURES = 5;

export async function isLoginRateLimited(
  email: string,
  ipAddress: string,
) {
  const since = new Date(Date.now() - WINDOW_MS);

  const failureCount = await prisma.loginAttempt.count({
    where: {
      email,
      ipAddress,
      success: false,
      createdAt: {
        gte: since,
      },
    },
  });

  return failureCount >= MAX_FAILURES;
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
) {
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
    },
  });
}

export async function clearLoginFailures(
  email: string,
  ipAddress: string,
) {
  await prisma.loginAttempt.deleteMany({
    where: {
      email,
      ipAddress,
      success: false,
    },
  });
}