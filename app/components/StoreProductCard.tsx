'use client';
import React, { useState } from 'react';

interface StoreProductCardProps {
  name: string;
  price: number;
  stock: number;
  image: string;
}

export default function StoreProductCard({ name, price, stock, image }: StoreProductCardProps) {
  const [src, setSrc] = useState(image);
  const stockColor = stock === 0 ? 'text-gray-400' : stock <= 3 ? 'text-red-500' : 'text-blue-500';

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition">
      <div className="w-full h-40 bg-gray-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() =>
            setSrc('https://picsum.photos/seed/bread/400/240') // プレースホルダー
          }
        />
      </div>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">¥{price.toLocaleString()}</p>
      <p className={`mt-2 text-sm font-medium ${stockColor}`}>
        {stock === 0 ? '売り切れ' : `残り${stock}個`}
      </p>
      <button
        disabled={stock === 0}
        className={`mt-3 w-full py-2 rounded-lg font-semibold ${
          stock === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        カートに追加
      </button>
    </div>
  );
}
