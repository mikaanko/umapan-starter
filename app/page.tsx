"use client";

import React, { useState, useMemo } from "react";

// --- みか環境のコンポーネント（既にあるやつ） ---
// これらのファイル名はみかのプロジェクトに合わせてある程度推測してるので、
// もし名前が違う場合は import パスは今のまま維持してOK。赤線になったらそこだけ直せばいい。
import StepProgressBar from "./components/StepProgressBar";
import ReservationTabs from "./components/ReservationTabs";
import DatePicker from "./components/DatePicker";
import TimeSlotPicker from "./components/TimeSlotPicker";

// 店舗情報とか最終確認の画面に使うやつが別ファイルにある場合はここで import してもOK。
// import ConfirmationSection from "./components/ConfirmationSection";

// 商品の型
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number; // 残り在庫
  imageUrl?: string;
};

// カートの型
type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

// ダミー商品（実際はSupabaseからフェッチして入れるところ）
const initialProducts: Product[] = [
  {
    id: "p1",
    name: "ホワイトソースチキン",
    price: 303,
    stock: 6,
  },
  {
    id: "p2",
    name: "限定カレーパン",
    price: 260,
    stock: 0, // 売り切れテスト用
  },
  {
    id: "p3",
    name: "あんバター",
    price: 250,
    stock: 3,
  },
];

export default function Home() {
  // 画面ステップ（0=商品選択, 1=受け取り日時, 2=確認）
  const [currentStep, setCurrentStep] = useState<number>(0);

  // 受け取り方法タブ（当日お取り置き / 前日まで予約）
  const [sameDayOnly, setSameDayOnly] = useState<boolean>(false);

  // 商品データ（本番はSupabaseからのフェッチ結果で上書き）
  const [products] = useState<Product[]>(initialProducts);

  // カート（商品ごとの選択結果）
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 各商品の「希望数量」 一時的に保持する { [productId]: 数量 }
  const [desiredQuantities, setDesiredQuantities] = useState<{
    [productId: string]: number;
  }>({});

  // 日付・時間（受け取り日時のステップ用）
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");

  // カートの合計金額（確認画面で使う）
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // カートに反映する処理
  const upsertCartItem = (p: Product) => {
    const qtyToSet = desiredQuantities[p.id] ?? 1;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        // 既にあるなら数量を上書き
        return prev.map((i) =>
          i.productId === p.id
            ? { ...i, quantity: qtyToSet }
            : i
        );
      } else {
        // 新規で追加
        return [
          ...prev,
          {
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: qtyToSet,
          },
        ];
      }
    });
  };

  // ステップ0: 商品を選ぶUI
  const renderStepProducts = () => {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <StepProgressBar currentStep={currentStep} />

        {/* タブ（当日お取り置き / 前日まで予約） */}
        <section className="text-center mt-10">
          <ReservationTabs
            sameDayOnly={sameDayOnly}
            setSameDayOnly={setSameDayOnly}
          />

          <p className="text-gray-600 mt-4">
            {sameDayOnly ? (
              <>本日のお取り置き専用です。</>
            ) : (
              <>
                明日〜2週間先までご予約可能です。
                <br />
                明日〜2週間先までご予約可能です。
              </>
            )}
          </p>
        </section>

        {/* 商品一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {products.map((p) => {
            const isSoldOut = p.stock === 0;

            // この商品の現在の希望数量（まだカートには確定してない）
            const selectedQty = desiredQuantities[p.id] ?? 1;

            // 在庫数ぶんのプルダウンを作る（1〜stock）
            const quantityOptions = Array.from(
              { length: p.stock > 0 ? p.stock : 0 },
              (_, i) => i + 1
            );

            return (
              <div
                key={p.id}
                className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col max-w-[320px]"
              >
                {/* 画像エリア */}
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  画像（{p.name}）
                </div>

                {/* 本体 */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-gray-700 font-semibold">
                    ￥{p.price}
                  </div>

                  {/* 在庫表示 */}
                  {isSoldOut ? (
                    <div className="text-red-600 text-sm font-semibold">
                      売り切れ
                    </div>
                  ) : (
                    <div
                      className={
                        p.stock <= 3
                          ? "text-red-600 text-sm font-semibold"
                          : "text-gray-500 text-sm"
                      }
                    >
                      残り{p.stock}個
                    </div>
                  )}

                  {/* 数量 + カートボタン */}
                  <div className="flex items-center gap-2 mt-2">
                    {/* 数量プルダウン */}
                    <select
                      className="border rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      disabled={isSoldOut}
                      value={selectedQty}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        setDesiredQuantities((prev) => ({
                          ...prev,
                          [p.id]: qty,
                        }));
                      }}
                    >
                      {quantityOptions.map((q) => (
                        <option key={q} value={q}>
                          {q}個
                        </option>
                      ))}
                    </select>

                    {/* カートに入れる */}
                    <button
                      disabled={isSoldOut}
                      onClick={() => {
                        if (isSoldOut) return;
                        upsertCartItem(p);
                      }}
                      className={
                        isSoldOut
                          ? "bg-gray-300 text-gray-500 text-sm rounded px-3 py-2 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 text-white text-sm rounded px-3 py-2"
                      }
                    >
                      {isSoldOut ? "売り切れ" : "カートに入れる"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 次へボタン */}
       <div className="text-center mt-16">
  <button
    disabled={cartItems.length === 0}
    onClick={() => {
      if (cartItems.length === 0) return;
      setCurrentStep(1);
    }}
    className={
      cartItems.length === 0
        ? // カートが空のとき（押せない見た目）
          "bg-gray-200 text-gray-400 cursor-not-allowed rounded px-6 py-3 text-sm"
        : // カートに商品があるとき（押せる見た目）
          "bg-orange-500 hover:bg-orange-600 text-white rounded px-6 py-3 text-sm"
    }
  >
    次へ（カートへ）
  </button>
</div>

      </main>
    );
  };

  // ステップ1: 受け取り日時
  const renderStepPickup = () => {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <StepProgressBar currentStep={currentStep} />

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800">
            受け取り日時を選んでください
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">
                日付を選択
              </p>
              <DatePicker
                selectedDate={selectedDate}
                onChangeDate={(d: string) => setSelectedDate(d)}
                sameDayOnly={sameDayOnly}
              />
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">
                時間帯を選択
              </p>
              <TimeSlotPicker
                selectedSlot={slot}
                onChangeSlot={(s: string) => setSlot(s)}
                sameDayOnly={sameDayOnly}
              />
            </div>
          </div>

          

          {/* 戻る / 次へ */}
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
            >
              商品選択に戻る
            </button>

            <button
              onClick={() => {
                if (!selectedDate || !slot) {
                  alert("受け取り日と時間を選んでください。");
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm"
            >
              確認へ進む
            </button>
          </div>
        </section>
      </main>
    );
  };

  // ステップ2: 確認画面
  const renderStepConfirm = () => {
    return (
      <main className="max-w-xl mx-auto px-4 py-10">
        <StepProgressBar currentStep={currentStep} />

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800">
            ご予約内容の確認
          </h2>

          {/* カート内容 */}
          <div className="mt-6 border rounded-lg divide-y">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-start p-4 text-sm"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500">
                    {item.quantity}個 × ￥{item.price}
                  </div>
                </div>
                <div className="font-semibold">
                  ￥{item.price * item.quantity}
                </div>
              </div>
            ))}
            <div className="flex justify-between items-start p-4 text-sm bg-gray-50 font-semibold">
              <div>合計</div>
              <div>￥{totalPrice}</div>
            </div>
          </div>

          {/* 受け取り情報 */}
          <div className="mt-8 text-sm text-gray-700 leading-relaxed">
            <p>受け取り日時：</p>
            <p className="font-medium">
              {selectedDate || "未選択"} / {slot || "未選択"}
            </p>

            <p className="mt-6 text-gray-600">
              お店にてこのお名前をお伝えください：
            </p>
            <p className="font-semibold text-gray-800">
              うまパンのパン 太郎
            </p>

            <p className="mt-6 text-gray-600 text-xs leading-relaxed">
              受け取り場所：
              <br />
              〇〇市〇〇町1-2-3
              <br />
              営業時間 10:30〜16:00
              <br />
              TEL 00-0000-0000
            </p>
          </div>

          {/* 戻る / 予約確定 */}
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
            >
              受け取り日時に戻る
            </button>

            <button
              onClick={() => {
                alert("この後は予約データを送信する処理につなげる想定だよ");
              }}
              className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm"
            >
              この内容で予約する
            </button>
          </div>
        </section>
      </main>
    );
  };

  // どのステップを表示するか
  if (currentStep === 0) return renderStepProducts();
  if (currentStep === 1) return renderStepPickup();
  return renderStepConfirm();
}
