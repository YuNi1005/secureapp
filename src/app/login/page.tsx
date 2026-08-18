"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginInput,
} from "@/schemas/auth";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@example.com",
      password: "Password123!",
    },
  });

  async function onSubmit(data: LoginInput) {
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ?? "ログインに失敗しました",
        );
        return;
      }

      setMessage("ログインしました");
    } catch {
      setMessage(
        "通信エラーが発生しました。もう一度お試しください。",
      );
    }
  }

  return (
    <main>
      <h1>ログイン</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
            {...register("password")}
          />

          {errors.password && (
            <p role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "ログイン中..."
            : "ログイン"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
  );
}