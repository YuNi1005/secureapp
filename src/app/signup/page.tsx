"use client";

import { FormEvent, useState } from "react";

import { getPasswordStrength } from "@/lib/passwordStrength";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const strength =
    password.length > 0
      ? getPasswordStrength(password)
      : null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");

    if (strength === "WEAK") {
      setMessage(
        "パスワードが弱すぎます。12文字以上で、大文字・小文字・数字・記号を組み合わせてください。",
      );
      return;
    }

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message ?? "登録に失敗しました",
      );
      return;
    }

    setMessage("ユーザー登録が完了しました");

    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <main>
      <h1>ユーザー登録</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="email">
            メールアドレス
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            パスワード
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {strength && (
            <p>
              パスワード強度：
              {strength === "WEAK" && "弱い"}
              {strength === "MEDIUM" && "普通"}
              {strength === "STRONG" && "強い"}
            </p>
          )}
        </div>

        <button type="submit">
          登録
        </button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}