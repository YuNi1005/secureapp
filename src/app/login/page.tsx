"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password123!");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message ?? "ログインに失敗しました");
      return;
    }

    setMessage("ログインしました");
  }

  return (
    <main>
      <h1>ログイン</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">ログイン</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}