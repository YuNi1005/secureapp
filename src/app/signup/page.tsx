"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupInput,
} from "@/schemas/auth";

import {
  getPasswordStrength,
  type PasswordStrength,
} from "@/lib/passwordStrength";

export default function SignupPage() {
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = watch("password");

  const strength: PasswordStrength | null =
    password.length > 0
      ? getPasswordStrength(password)
      : null;

  async function onSubmit(data: SignupInput) {
    setMessage("");

    if (getPasswordStrength(data.password) === "WEAK") {
      setMessage(
        "パスワードが弱すぎます。12文字以上で、大文字・小文字・数字・記号を組み合わせてください。",
      );
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ?? "ユーザー登録に失敗しました",
        );
        return;
      }

      setMessage("ユーザー登録が完了しました");
    } catch {
      setMessage(
        "通信エラーが発生しました。もう一度お試しください。",
      );
    }
  }

  return (
    <main>
      <h1>ユーザー登録</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">
            名前
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
          />

          {errors.name && (
            <p role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email">
            メールアドレス
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />

          {errors.email && (
            <p role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password">
            パスワード
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />

          {errors.password && (
            <p role="alert">
              {errors.password.message}
            </p>
          )}

          {strength && (
            <p>
              パスワード強度：
              {strength === "WEAK" && "弱い"}
              {strength === "MEDIUM" && "普通"}
              {strength === "STRONG" && "強い"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "登録中..."
            : "登録"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
  );
}