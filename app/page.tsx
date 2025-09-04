export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">焼きたて、毎朝。</h1>
      <p className="mt-2 text-lg">うまパンは、毎日食べたくなる定番をまっすぐに。</p>
      <div className="mt-4 flex gap-3">
        <a href="/menu" className="px-4 py-2 rounded bg-brand-primary text-white">メニューを見る</a>
      </div>
    </main>
  );
}
