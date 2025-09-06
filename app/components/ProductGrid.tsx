
'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  reservationType: 'today' | 'advance' | 'both';
  todayStock: number;
  advanceStock: number;
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  reservationType: 'today' | 'advance';
  cartItems: any[];
}

export default function ProductGrid({ onAddToCart, reservationType, cartItems }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);

  // データベースから商品データを取得
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('商品データの取得に失敗しました');
      }

      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error('商品データ取得エラー:', error);
      // フォールバック: ローカルストレージから取得
      const savedProducts = localStorage.getItem('bakery_products');
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (parseError) {
          console.error('ローカルデータの読み込みに失敗:', parseError);
        }
      }
    }
  };

  useEffect(() => {
    fetchProducts();

    // 定期的にデータを更新
    const interval = setInterval(fetchProducts, 5000);

    return () => clearInterval(interval);
  }, []);

  // 予約タイプが変更された時に商品表示を強制更新
  useEffect(() => {
    fetchProducts();
  }, [reservationType]);

  // カートに入っている数量を考慮した利用可能な商品を取得
  const getAvailableProducts = () => {
    return products.map(product => {
      const cartQuantity = cartItems.find(item => item.id === product.id)?.quantity || 0;
      const availableStock = reservationType === 'today' ? product.todayStock : product.advanceStock;
      const remainingStock = Math.max(0, availableStock - cartQuantity);
      
      return {
        ...product,
        todayStock: reservationType === 'today' ? remainingStock : product.todayStock,
        advanceStock: reservationType === 'advance' ? remainingStock : product.advanceStock
      };
    });
  };

  // 現在の予約タイプで選択可能な商品をフィルタリング（在庫チェック含む）
  const availableProducts = getAvailableProducts().filter(product => {
    const isTypeAvailable = product.reservationType === reservationType || product.reservationType === 'both';
    const hasStock = reservationType === 'today' ? product.todayStock > 0 : product.advanceStock > 0;
    return isTypeAvailable && hasStock;
  });

  // カテゴリーのオプションを動的に生成
  const categories = ['all', ...Array.from(new Set(availableProducts.map(p => p.category)))];
  const categoryLabels: { [key: string]: string } = {
    'all': 'すべて',
    'ソフト系': 'ソフト系',
    'ハード系': 'ハード系'
  };

  const filteredProducts = selectedCategory === 'all' 
    ? availableProducts 
    : availableProducts.filter(product => product.category === selectedCategory);

  // 完売商品を取得
  const soldOutProducts = getAvailableProducts().filter(product => {
    const isTypeRelevant = product.reservationType === reservationType || product.reservationType === 'both';
    const isSoldOut = reservationType === 'today' ? product.todayStock === 0 : product.advanceStock === 0;
    return isTypeRelevant && isSoldOut;
  });

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="ri-shopping-bag-line text-amber-600 mr-2"></i>
            パンを選んでカートに追加
          </h2>
          <div className="text-sm text-gray-500">
            {reservationType === 'today' ? '当日お取り置き対象商品' : '事前予約対象商品'}
            （{filteredProducts.length}商品）
          </div>
        </div>

        {/* 予約タイプの説明 */}
        <div className={`p-4 rounded-xl mb-6 ${
          reservationType === 'today' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <i className={`text-2xl mr-3 ${
              reservationType === 'today' 
                ? 'ri-calendar-today-line text-blue-600' 
                : 'ri-calendar-schedule-line text-green-600'
            }`}></i>
            <div>
              <h3 className={`font-semibold ${
                reservationType === 'today' ? 'text-blue-800' : 'text-green-800'
              }`}>
                {reservationType === 'today' ? '当日お取り置き' : '前日まで事前予約'}
              </h3>
              <p className={`text-sm ${
                reservationType === 'today' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {reservationType === 'today' 
                  ? '当日販売の在庫からお取り置きします（カートに入れた分は残り在庫から差し引かれます）' 
                  : '前日までのご予約で確実にお渡しできます（カートに入れた分は残り在庫から差し引かれます）'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 完売商品がある場合の通知 */}
        {soldOutProducts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
              <i className="ri-error-warning-line mr-2"></i>
              {reservationType === 'today' ? '当日お取り置き完売商品' : '事前予約完売商品'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {soldOutProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="text-sm text-orange-700 bg-orange-100 rounded-lg px-3 py-2">
                  {product.name}
                </div>
              ))}
              {soldOutProducts.length > 8 && (
                <div className="text-sm text-orange-600 px-3 py-2">
                  ...他{soldOutProducts.length - 8}商品
                </div>
              )}
            </div>
          </div>
        )}

        {/* カテゴリータブ */}
        <div className="flex gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* 商品グリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={`${product.id}-${reservationType}`}
            product={product}
            onAddToCart={onAddToCart}
            reservationType={reservationType}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-shopping-bag-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">
            {soldOutProducts.length > 0 
              ? `選択したカテゴリーの商品は${reservationType === 'today' ? '当日お取り置き' : '事前予約'}完売です`
              : '選択したカテゴリーに商品がありません'
            }
          </p>
        </div>
      )}
    </div>
  );
}
