import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";

export default async function MemberPage() {
  const result = await verifySession();

  if (!result) {
    redirect("/login");
  }

  const { user } = result;

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
    </main>
  );
}