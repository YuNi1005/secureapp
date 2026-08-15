import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";

export default async function AdminPage() {
  const result = await verifySession();

  if (!result) {
    redirect("/login");
  }

  const { user } = result;

  if (user.role !== "ADMIN") {
    notFound();
  }

  return (
    <main>
      <h1>管理者ページ</h1>

      <p>管理者としてログインしています。</p>

      <dl>
        <dt>名前</dt>
        <dd>{user.name}</dd>

        <dt>メールアドレス</dt>
        <dd>{user.email}</dd>

        <dt>権限</dt>
        <dd>{user.role}</dd>
      </dl>
    </main>
  );
}