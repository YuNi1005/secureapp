export type PasswordStrength =
  | "WEAK"
  | "MEDIUM"
  | "STRONG";

export function getPasswordStrength(
  password: string,
): PasswordStrength {
  let score = 0;

  // 12文字以上
  if (password.length >= 12) {
    score++;
  }

  // 小文字を含む
  if (/[a-z]/.test(password)) {
    score++;
  }

  // 大文字を含む
  if (/[A-Z]/.test(password)) {
    score++;
  }

  // 数字を含む
  if (/[0-9]/.test(password)) {
    score++;
  }

  // 記号を含む
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  if (score <= 2) {
    return "WEAK";
  }

  if (score <= 4) {
    return "MEDIUM";
  }

  return "STRONG";
}