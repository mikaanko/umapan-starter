
'use client';

import { useState } from 'react';

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  reservationType?: 'today' | 'advance';
}

export default function ProductCard({ product, onAddToCart, reservationType = 'today' }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  
  // 予約タイプに応じた在庫数を取得
  const availableStock = reservationType === 'today' ? product.todayStock : product.advanceStock;
  
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setQuantity(1);
  };

  const increaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // 予約タイプに応じた表示テキストを動的に生成
  const getStockLabel = () => {
    if (reservationType === 'today') {
      return '当日残り';
    } else {
      return '事前残り';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover object-top"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            availableStock > 5 ? 'bg-green-100 text-green-800' : 
            availableStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {getStockLabel()}{availableStock}個
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
        <div className="flex justify-between items-center mb-4">
          <p className="text-amber-600 font-bold text-xl">¥{product.price}</p>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {availableStock > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">数量:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  <i className="ri-subtract-line text-sm"></i>
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  <i className="ri-add-line text-sm"></i>
                </button>
              </div>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
            >
              <i className="ri-shopping-cart-line mr-2"></i>
              カートに追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
