import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("メールアドレスの形式が正しくありません");

export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上にしてください")
  .max(128, "パスワードは128文字以内にしてください");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内にしてください"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;