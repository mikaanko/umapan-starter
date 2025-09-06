
'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import ReservationForm from './ReservationForm';
import CompletionModal from './CompletionModal';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ReservationSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [reservationType, setReservationType] = useState<'today' | 'advance'>('today');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleProceedToReservation = () => {
    setShowReservationForm(true);
  };

  const handleReservationComplete = (data: any) => {
    setReservationData(data);
    setIsModalOpen(true);
    // カートをクリア
    setCartItems([]);
    setShowReservationForm(false);
  };

  const handleBackToProducts = () => {
    setShowReservationForm(false);
  };

  const handleReservationTypeChange = (type: 'today' | 'advance') => {
    setReservationType(type);
    // 予約タイプが変わった時はカートをクリアしない（商品の在庫表示変更を確認しやすくするため）
    // setCartItems([]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(160, 82, 45, 0.7)), url('https://static.readdy.ai/image/c132bc2fb67acaf93ab53aad7ce49121/7ee7d3f6b77035ae6c0ef83aa7ed8c6c.jfif')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="font-['Pacifico'] text-yellow-200">うまじのパン屋</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">予約システム</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            予約タイプを選んで好きなパンをカートに追加し、<br />
            受け取り日時を指定してご予約ください。<br />
            お受け取り時間は10:30〜16:00の間で30分刻みでご指定可能です。
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!showReservationForm ? (
          <>
            {/* 予約タイプ選択 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="ri-bookmark-line text-amber-600 mr-2"></i>
                予約タイプをお選びください
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <button
                  onClick={() => handleReservationTypeChange('today')}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    reservationType === 'today'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <i className="ri-calendar-today-line text-4xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-2">当日お取り置き</h3>
                  <p className="text-sm text-gray-600 mb-3">当日のみ選択可能<br />売り切れ防止におすすめ</p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">選択可能商品：全商品対応</p>
                  </div>
                </button>

                <button
                  onClick={() => handleReservationTypeChange('advance')}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    reservationType === 'advance'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <i className="ri-calendar-schedule-line text-4xl"></i>
                  </div>
                  <h3 className="font-bold text-xl mb-2">前日まで事前予約</h3>
                  <p className="text-sm text-gray-600 mb-3">明日〜2週間後まで<br />確実な受け取りに</p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">選択可能商品：全商品対応</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 商品選択画面 */}
            <ProductGrid 
              onAddToCart={handleAddToCart} 
              reservationType={reservationType}
              cartItems={cartItems}
            />
          </>
        ) : (
          <>
            {/* 予約フォーム画面 */}
            <div className="mb-6">
              <button
                onClick={handleBackToProducts}
                className="flex items-center text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                パン選択に戻る
              </button>
            </div>
            <ReservationForm 
              onComplete={handleReservationComplete} 
              cartItems={cartItems} 
              reservationType={reservationType}
            />
          </>
        )}

        {/* カート */}
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToReservation={handleProceedToReservation}
        />

        <CompletionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reservationData={reservationData}
        />
      </main>

      {/* Info Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-2xl text-amber-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">営業時間</h3>
              <p className="text-gray-600">9:00〜18:00<br />（売り切れ次第終了）</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-check-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">予約方法</h3>
              <p className="text-gray-600">当日お取り置き<br />前日までの事前予約</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">所在地</h3>
              <p className="text-gray-600">高知県安芸郡馬路村馬路3888-1<br />(0887)44-2555</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
