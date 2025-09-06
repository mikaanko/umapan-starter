
'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onProceedToReservation: () => void;
}

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onProceedToReservation }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* カートボタン（固定位置） */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-6 shadow-xl hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer relative"
        >
          <i className="ri-shopping-cart-fill text-3xl"></i>
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* カートモーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <i className="ri-shopping-cart-line mr-2"></i>
                カート
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-shopping-cart-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">カートは空です</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-amber-600 font-bold">¥{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        >
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        >
                          <i className="ri-add-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                          title="カートから削除"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>合計金額:</span>
                    <span className="text-amber-600">¥{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onProceedToReservation();
                      setIsOpen(false);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    予約に進む
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    買い物を続ける
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
