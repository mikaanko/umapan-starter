'use client';

import { useState, useEffect } from 'react';

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

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    } catch (error) {
      console.error('商品データ取得エラー:', error);
      setIsLoading(false);
    }
  };

  // 商品の在庫を更新
  const updateProductStock = async (productId: number, todayStock: number, advanceStock: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          productId,
          updateData: { todayStock, advanceStock }
        })
      });

      if (!response.ok) {
        throw new Error('商品データの更新に失敗しました');
      }

      // ローカルの状態も更新
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, todayStock, advanceStock }
          : p
      ));

      return true;
    } catch (error) {
      console.error('商品更新エラー:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getInitialProducts = (): Product[] => [
    // ソフト系
    { id: 1, name: 'くるみぱん', price: 173, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/ZxjxLyytORue1foPjDwFbRCvcj6eXDWYmqvahUre.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 8, advanceStock: 7 },
    { id: 2, name: 'ぶどうぱん', price: 173, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/zfu8QOrZy6gPLPWYLfQlJHTyvOw6CrSXN1ByXIdr.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 6, advanceStock: 6 },
    { id: 3, name: 'クランベリークリームチーズ', price: 291, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/805LRi3WtYU6uQG4MaTlO7GVUa1RxJ2vg7t1R7KD.png?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 3, advanceStock: 5 },
    { id: 4, name: '小倉ほいっぷ', price: 281, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/ni99PvZarExik5B9HAAeMvy6SIWO3r2ngjOb8dv5.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 4, advanceStock: 6 },
    { id: 5, name: 'あんぱん', price: 259, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/dDCFbMWQ5TunuH5vRDmmY3Pp20zjGF5K82hm6iXA.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 0, advanceStock: 0 },
    { id: 6, name: 'ゆずあんぱん', price: 281, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/1Rc342FgG9BL69mdCDxQFWKH9m8gqwbDa5SB8A0W.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 2, advanceStock: 4 },
    { id: 7, name: 'まるぱん', price: 137, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/cg4w7lfcx8aFqitxS9vzPmmwIEmQIyliNaQrpXnZ.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 12, advanceStock: 8 },
    { id: 8, name: 'おさとうぱん', price: 173, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/YsSrL42LOxBFicet4kSfckSix7eDRPlsfAQSUL8Q.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 7, advanceStock: 7 },
    { id: 9, name: 'ほいっぷサンド', price: 227, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/jMe1jNgDtEjEi0elWdMNFXaqRRVHaVlCCSN9j5dV.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 0, advanceStock: 3 },
    { id: 10, name: 'チョコレートほいっぷサンド', price: 227, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/mMigc2JQ3o748o16qRLkB4xnidtlfbynYLEjnioq.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 1, advanceStock: 4 },
    { id: 11, name: 'ぼうしぱん', price: 248, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/JhctqRKT4Z2ZEjeYy7XXws6nMlRTZJIdDHfoK9An.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 3, advanceStock: 4 },
    { id: 12, name: 'ハムぱん', price: 227, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/VT63lVHEOM0pE475ISiPQ9evmX66svUCGWSSdfNj.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 4, advanceStock: 5 },
    { id: 13, name: 'うぃんなーぱん', price: 151, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/EmQkuAM4LW2y6TUMRSadXXGsoowZPWInDQJG39yL.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 6, advanceStock: 5 },
    { id: 14, name: 'コーンぱん', price: 205, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/TXtRipMOdycgXTtrFD0oIiH4CdVmPulQi61Vn95i.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 0, advanceStock: 2 },
    { id: 15, name: 'マヨたまぱん', price: 248, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/AZ7cjJcJuJfGAvYcZlUugwFqwzqU2BQrhFOPva5d.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 8, advanceStock: 5 },
    { id: 16, name: '焼きカレーパン', price: 248, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/4P5u73i54Q8Q9zFwCeG9JzJnuwTM9qsBq1DTv8uQ.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 2, advanceStock: 2 },
    { id: 17, name: 'あんばたーサンド', price: 259, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/JOgv0eyvwZUkzIfxIsGs6tpuT8HnJrVBJqExxBFu.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 0, advanceStock: 1 },
    { id: 18, name: 'ベーコンチーズぱん', price: 227, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/EpphBRlMEYA7sNH9Rutk6BLhmLFWKIv7QfBd5zeH.jpg?w=512', category: 'ソフト系', reservationType: 'both', todayStock: 9, advanceStock: 7 },
    // ハード系
    { id: 19, name: 'バゲット(L)', price: 399, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/UvNuQlC805L424NQvJHFvv7RIZdpHWZh9v3Fdf1h.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 2, advanceStock: 3 },
    { id: 20, name: 'バゲット(S)', price: 261, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/lCwhcCJie57BeFIc3wn9G5Fm1bDJ4iHLwEam68gG.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 4, advanceStock: 4 },
    { id: 21, name: 'フィセル', price: 281, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/bqeNeWVr000UCmcpmfpJzwUEnY48ozFcFzL2e3Dd.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 1, advanceStock: 2 },
    { id: 22, name: 'プチちょこ', price: 173, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/IjdAyVvejkkLyDhbme3zmB21HJhZeQRKGgaGeSP2.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 7, advanceStock: 5 },
    { id: 23, name: '小倉フランス', price: 173, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/FD4K0HqU5CillmtO6vRPiW76dTd89p90rij4zyZV.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 3, advanceStock: 4 },
    { id: 24, name: 'しおバター', price: 335, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/wdugFVM6K4rmiRgMnLBYVXtDxzMh2OG5Sh5sQURT.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 0, advanceStock: 0 },
    { id: 25, name: 'シュガーバター', price: 335, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/Sq68sid2EoKQ1mLaf32HoNCqWq0Jhc9FJCdpWtvz.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 2, advanceStock: 2 },
    { id: 26, name: 'じゃがちー', price: 389, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/ngMjWBnePmB9R7uIF5GSQMJOPd8qv8UPFs7BNR8A.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 1, advanceStock: 1 },
    { id: 27, name: 'ベーコンエピ', price: 410, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/mnl9RL1FYtaMhT62rnnGx5ip1JaXjM5ivbONucwd.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 3, advanceStock: 3 },
    { id: 28, name: 'くるみレーズンバター', price: 335, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/gl7f2sDN0zK49NJ2KOU6xfC7gcDx1JipsoEceBOO.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 0, advanceStock: 1 },
    { id: 29, name: 'くるみレーズンばとん', price: 313, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/ZG4PvP7J8BmzyuhyAhzZU8svYtB03v4ifF03fdbs.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 5, advanceStock: 4 },
    { id: 30, name: 'クランベリーバター', price: 335, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/AUiBX7rMDszXeOtucL3eUCMfR1Vnut7Gz7Ltwf2h.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 2, advanceStock: 3 },
    { id: 31, name: 'クランベリーばとん', price: 313, image: 'https://d1umvcecpsu7ql.cloudfront.net/storage/uploads/products/OTRqzpMRrCXxle3pdrpq57OHF8kupSK7AtuD6tzW.jpg?w=512', category: 'ハード系', reservationType: 'both', todayStock: 6, advanceStock: 5 }
  ];

  // 商品の保存
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('bakery_products', JSON.stringify(updatedProducts));
  };

  // フィルタリング
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'ソフト系',
      reservationType: 'both',
      todayStock: '',
      advanceStock: '',
      image: ''
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  // 商品追加・編集
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      reservationType: formData.reservationType,
      todayStock: parseInt(formData.todayStock),
      advanceStock: parseInt(formData.advanceStock),
      image: formData.image || 'https://readdy.ai/api/search-image?query=delicious%20bakery%20bread%20product%20simple%20white%20background%20clean%20minimalist%20style%20high%20quality%20food%20photography&width=400&height=400&seq=bread-default&orientation=squarish'
    };

    let updatedProducts;
    if (editingProduct) {
      // 編集
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
    } else {
      // 追加
      const newId = Math.max(...products.map(p => p.id)) + 1;
      updatedProducts = [...products, { id: newId, ...productData }];
    }

    saveProducts(updatedProducts);
    resetForm();
  };

  // 商品削除
  const handleDelete = (id: number) => {
    if (confirm('この商品を削除しますか？')) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
    }
  };

  // 在庫一括調整
  const handleBulkStockUpdate = (type: 'today' | 'advance', value: number) => {
    const updated = products.map(p => ({
      ...p,
      [type === 'today' ? 'todayStock' : 'advanceStock']: 
        Math.max(0, (type === 'today' ? p.todayStock : p.advanceStock) + value)
    }));
    saveProducts(updated);
  };

  // 編集開始
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      reservationType: product.reservationType,
      todayStock: product.todayStock.toString(),
      advanceStock: product.advanceStock.toString(),
      image: product.image
    });
    setShowAddModal(true);
  };

  const categories = ['all', 'ソフト系', 'ハード系'];
  const categoryLabels = { 'all': 'すべて', 'ソフト系': 'ソフト系', 'ハード系': 'ハード系' };

  return (
    <div className="space-y-8">
      {/* ヘッダーとアクション */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">商品・在庫管理</h2>
            <p className="text-gray-600">商品の追加・編集・削除、在庫調整を行います</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            新商品追加
          </button>
        </div>

        {/* 一括在庫調整 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-blue-800 font-semibold mb-3 flex items-center">
            <i className="ri-stack-line mr-2"></i>
            一括在庫調整
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStockUpdate('today', -1)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm cursor-pointer whitespace-nowrap"
            >
              当日在庫 -1
            </button>
            <button
              onClick={() => handleBulkStockUpdate('today', 1)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm cursor-pointer whitespace-nowrap"
            >
              当日在庫 +1
            </button>
            <button
              onClick={() => handleBulkStockUpdate('advance', -1)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm cursor-pointer whitespace-nowrap"
            >
              事前在庫 -1
            </button>
            <button
              onClick={() => handleBulkStockUpdate('advance', 1)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm cursor-pointer whitespace-nowrap"
            >
              事前在庫 +1
            </button>
          </div>
        </div>

        {/* 検索とフィルタ */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="商品名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            商品一覧 ({filteredProducts.length}商品)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">価格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">当日在庫</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">事前在庫</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約タイプ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      product.todayStock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : product.todayStock <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.todayStock}個
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      product.advanceStock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : product.advanceStock <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.advanceStock}個
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      product.reservationType === 'both' 
                        ? 'bg-blue-100 text-blue-800' 
                        : product.reservationType === 'today'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {product.reservationType === 'both' ? '両方' : 
                       product.reservationType === 'today' ? '当日のみ' : '事前のみ'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                        title="編集"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        title="削除"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 商品追加・編集モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingProduct ? '商品編集' : '新商品追加'}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品名</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">価格 (円)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8"
                >
                  <option value="ソフト系">ソフト系</option>
                  <option value="ハード系">ハード系</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">予約タイプ</label>
                <select
                  value={formData.reservationType}
                  onChange={(e) => setFormData({...formData, reservationType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 pr-8"
                >
                  <option value="both">両方</option>
                  <option value="today">当日のみ</option>
                  <option value="advance">事前のみ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">当日在庫</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.todayStock}
                    onChange={(e) => setFormData({...formData, todayStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">事前在庫</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.advanceStock}
                    onChange={(e) => setFormData({...formData, advanceStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">画像URL（省略可）</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">空欄の場合はデフォルト画像を使用</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  {editingProduct ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}