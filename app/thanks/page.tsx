export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ reservationId?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-bold">予約が完了しました</h1>
      <p className="mt-4 text-gray-600">
        ご入力いただいたメールアドレスに確認メールを送信しました。
      </p>
      {params.reservationId && (
        <p className="mt-3 text-sm text-gray-500">予約番号: {params.reservationId}</p>
      )}
      <a
        className="mt-8 inline-block rounded bg-orange-500 px-4 py-2 text-white"
        href="/"
      >
        トップへ戻る
      </a>
    </main>
  );
}
