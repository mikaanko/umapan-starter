'use client';

import { useState, useEffect } from 'react';
import StepProgressBar from '@/components/StepProgressBar';
import ReservationTabs from '@/components/ReservationTabs';
import DatePicker from '@/components/DateSelector';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import { supabase } from '@/lib/supabaseClient';



type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<
    { productId: number; name: string; price: number; quantity: number }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slot, setSlot] = useState('');
  const [sameDayOnly, setSameDayOnly] = useState(true);
  const [desiredQuantities, setDesiredQuantities] = useState<Record<number, number>>({});

  // 商品を取得
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('app_products').select('*');
      if (!error && data) setProducts(data);
    };
    fetchProducts();
  }, []);

  // 🛒 指定数量でカートに追加または更新
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    const desiredQty = desiredQuantities[product.id] ?? 1;
    const finalQty = Math.min(desiredQty, product.stock);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: finalQty } : i
        );
      } else {
        return [
          ...prev,
          { productId: product.id, name: product.name, price: product.price, quantity: finalQty },
        ];
      }
    });
  };

  // 合計金額
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 予約確定（ダミー）
  const handleSubmit = () => {
    alert('予約が完了しました！');
    setCurrentStep(3);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <StepProgressBar currentStep={currentStep} />

      {/* === Step 1: タイプ選択 === */}
      {currentStep === 0 && (
        <section className="text-center mt-10">
          <ReservationTabs
            sameDayOnly={sameDayOnly}
            setSameDayOnly={setSameDayOnly}
          />
          <p className="text-gray-600 mt-4">
            {sameDayOnly
              ? '本日分のみ予約可能です。'
              : '明日〜2週間先までご予約可能です。'}
          </p>

          {/* 商品一覧 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {products.map((p) => {
              const isSoldOut = p.stock <= 0;
              const inCart = cartItems.find((i) => i.productId === p.id);
              const selectedQty = desiredQuantities[p.id] ?? 1;
              const quantityOptions = Array.from({ length: p.stock }, (_, i) => i + 1);

              return (
                <div
                  key={p.id}
                  className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    画像（{p.name}）
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-lg font-semibold">{p.name}</div>
                    <div className="text-gray-700 text-sm">¥{p.price}</div>

                    {isSoldOut ? (
                      <div className="text-gray-400 text-sm mt-2">売り切れ</div>
                    ) : (
                      <div className="text-sm text-red-600 mt-2">
                        残り{p.stock}個
                      </div>
                    )}

                    {inCart && (
                      <div className="text-sm text-green-600 mt-1">
                        カートに {inCart.quantity} 個 追加済み
                      </div>
                    )}

                    {!isSoldOut && (
                      <div className="mt-4">
                        <label className="block text-xs text-gray-600 mb-1">
                          数量を選択
                        </label>
                        <select
                          value={selectedQty}
                          onChange={(e) => {
                            const nextQty = Number(e.target.value);
                            setDesiredQuantities((prev) => ({
                              ...prev,
                              [p.id]: nextQty,
                            }));
                          }}
                          className="w-full border rounded-md px-2 py-2 text-sm"
                        >
                          {quantityOptions.map((num) => (
                            <option key={num} value={num}>
                              {num}個
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mt-auto pt-4">
                      <button
                        disabled={isSoldOut}
                        onClick={() => addToCart(p)}
                        className={`w-full rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition ${
                          isSoldOut
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : inCart
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {isSoldOut
                          ? '売り切れ'
                          : inCart
                          ? `追加済み（${inCart.quantity}個）`
                          : 'カートに追加'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <button
              onClick={() => setCurrentStep(1)}
              disabled={cartItems.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold ${
                cartItems.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              次へ（カートへ）
            </button>
          </div>
        </section>
      )}

      {/* === Step 2: 日付・時間選択 === */}
      {currentStep === 1 && (
        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-lg font-semibold">受け取り日を選択</h2>
            <p className="text-sm text-gray-600">
              お受け取り可能な日付をお選びください。
            </p>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              daysAhead={sameDayOnly ? 0 : 14}
              sameDayOnly={sameDayOnly}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">受け取り時間を選択</h2>
            <p className="text-sm text-gray-600">
              10:30〜16:00の間で30分刻みです。
            </p>
            <TimeSlotPicker value={slot} onChange={setSlot} />
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
            >
              戻る
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedDate || !slot}
              className={`px-6 py-3 rounded-lg font-semibold ${
                !selectedDate || !slot
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              次へ（確認へ）
            </button>
          </div>
        </section>
      )}

      {/* === Step 3: 確認 === */}
      {currentStep === 2 && (
        <section className="mt-10 grid md:grid-cols-2 gap-8">
          <div className="border rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4">予約内容の確認</h2>
            <p className="text-sm text-gray-600">
              受け取り日時：{selectedDate} {slot}
            </p>
            <div className="mt-4 divide-y divide-gray-200 text-sm">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="py-2 flex justify-between"
                >
                  <div>
                    {item.name}（{item.quantity}個）
                  </div>
                  <div>¥{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-semibold text-right">
              合計：¥{totalPrice.toLocaleString()}
            </p>
          </div>

          <div className="border rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4">お受け取り場所</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              うまじのパン屋 本店
              <br />
              ○○県○○市○○町1-2-3
              <br />
              営業時間 10:30〜16:00
              <br />
              TEL 000-0000-0000
            </p>
            <button
              onClick={handleSubmit}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              予約を確定する
            </button>
          </div>
        </section>
      )}

      {/* === Step 4: 完了 === */}
      {currentStep === 3 && (
        <section className="text-center mt-16">
          <div className="border rounded-xl p-8 shadow-sm bg-white inline-block">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              ご予約ありがとうございます！
            </h2>
            <p className="text-sm text-gray-700">
              ご注文はお取り置き済みです。
              <br />
              受け取り日時は {selectedDate} {slot} です。
              <br />
              お店でこの画面をご提示ください。
            </p>
            <p className="text-sm text-gray-600 mt-6 leading-relaxed">
              うまじのパン屋 本店
              <br />
              ○○県○○市○○町1-2-3
              <br />
              営業時間 10:30〜16:00
              <br />
              TEL 000-0000-0000
            </p>
            <button
              onClick={() => {
                setCurrentStep(0);
                setCartItems([]);
                setSelectedDate('');
                setSlot('');
              }}
              className="mt-8 px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
            >
              最初の画面に戻る
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
