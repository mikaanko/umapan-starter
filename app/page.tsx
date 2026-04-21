"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  maxPerOrder: number;
};

const products: Product[] = [
  { id: "croissant", name: "クロワッサン", price: 280, maxPerOrder: 10 },
  { id: "curry", name: "焼きカレーパン", price: 320, maxPerOrder: 8 },
  { id: "anbutter", name: "あんバター", price: 350, maxPerOrder: 6 },
];

type Cart = Record<string, number>;

export default function Home() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({});
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("11:00-11:30");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0);
  }, [cart]);

  const hasItems = Object.values(cart).some((q) => q > 0);

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasItems) {
      setError("商品を1つ以上選択してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = products
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({
          productId: p.id,
          productName: p.name,
          unitPrice: p.price,
          quantity: cart[p.id] ?? 0,
        }));

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          pickupDate,
          pickupTime,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "予約の送信に失敗しました。");
        return;
      }

      router.push(`/thanks?reservationId=${data.reservationId}`);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="text-3xl font-bold">うまパン予約システム（雛形）</h1>
      <p className="mt-3 text-gray-600">
        Supabase + Resendでそのままデプロイできる最低限のMVPです。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="rounded-xl border p-5">
          <h2 className="text-xl font-semibold">1. 商品を選択</h2>
          <div className="mt-4 space-y-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">¥{p.price}</p>
                  </div>
                  <select
                    className="rounded border px-2 py-1"
                    value={cart[p.id] ?? 0}
                    onChange={(e) => updateQty(p.id, Number(e.target.value))}
                  >
                    {Array.from({ length: p.maxPerOrder + 1 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i}個
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right text-lg font-bold">合計: ¥{total}</div>
        </section>

        <section className="rounded-xl border p-5">
          <h2 className="text-xl font-semibold">2. 受け取り情報</h2>
          <div className="mt-4 space-y-3">
            <input
              required
              className="w-full rounded border px-3 py-2"
              placeholder="お名前"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              required
              type="email"
              className="w-full rounded border px-3 py-2"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              className="w-full rounded border px-3 py-2"
              placeholder="電話番号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              required
              type="date"
              className="w-full rounded border px-3 py-2"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
            <select
              className="w-full rounded border px-3 py-2"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            >
              <option>11:00-11:30</option>
              <option>11:30-12:00</option>
              <option>12:00-12:30</option>
              <option>12:30-13:00</option>
            </select>
            <textarea
              className="w-full rounded border px-3 py-2"
              placeholder="備考（任意）"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded bg-orange-500 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "送信中..." : "予約を確定する"}
          </button>
        </section>
      </form>
    </main>
  );
}
