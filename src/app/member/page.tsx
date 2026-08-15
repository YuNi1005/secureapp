"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export default function MemberPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const response = await fetch("/api/me");

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.push("/login");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <main>
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main>
      <h1>会員ページ</h1>

      <p>ログイン中です。</p>

      <dl>
        <dt>名前</dt>
        <dd>{user.name}</dd>

        <dt>メールアドレス</dt>
        <dd>{user.email}</dd>

        <dt>権限</dt>
        <dd>{user.role}</dd>
      </dl>

      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>
    </main>
  );
}