'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from "next/link";


/** ===== Types ===== */
type ReservationType = 'today' | 'advance' | 'both';
type ApiCategory = 'all' | 'soft' | 'hard';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: 'ソフト系' | 'ハード系' | string;
  reservation_type: ReservationType;
  today_stock: number;
  advance_stock: number;
}

/** ===== Helpers ===== */
const apiCategoryFromSelected = (selected: string): ApiCategory => {
  if (selected === 'ソフト系' || selected === 'soft') return 'soft';
  if (selected === 'ハード系' || selected === 'hard') return 'hard';
  return 'all';
};
// 予約タイプの表示ラベル
const reserveLabel = (t: ReservationType) =>
  t === 'today' ? '当日' : t === 'advance' ? '事前' : '両方';

const normalize = (p: any): Product => ({
  id: Number(p.id),
  name: String(p.name ?? ''),
  price: Number(p.price ?? 0),
  image: (p.image_url ?? p.image ?? null) as string | null,
  category: (p.category ?? '') as any,
  reservation_type: (p.reservation_type ?? p.reservationType ?? 'both') as ReservationType,
  today_stock: Number(p.today_stock ?? p.todayStock ?? 0),
  advance_stock: Number(p.advance_stock ?? p.advanceStock ?? 0),
});

export default function ProductManagement() {
  /** ===== State ===== */
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [searchTerm, setSearchTerm] = useState('');

  // 編集モーダル用
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    category: 'ソフト系',
    reservation_type: 'both' as ReservationType,
    today_stock: 0,
    advance_stock: 0,
  });

  /** ===== Fetch products ===== */
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-products`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error('failed to fetch products');
      const json = await res.json();
      const rows: any[] = Array.isArray(json.data) ? json.data : [];
      setProducts(rows.map(normalize));
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /** ===== Filtered list ===== */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const byCategory = (p: Product) => {
      if (selectedCategory === 'すべて' || selectedCategory === 'all') return true;
      return p.category === selectedCategory;
    };
    const byTerm = (p: Product) =>
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.category ?? '').toLowerCase().includes(term);
    return products.filter((p) => byCategory(p) && byTerm(p));
  }, [products, selectedCategory, searchTerm]);

  /** ===== Bulk stock (no page reload, optimistic) ===== */
  const handleBulkStockUpdate = async (type: 'today' | 'advance', value: 1 | -1) => {
    setIsBulkLoading(true);
    try {
      const cat = apiCategoryFromSelected(selectedCategory);

      // optimistic
      setProducts((cur) =>
        cur.map((p) => {
          if (cat === 'soft' && p.category !== 'ソフト系') return p;
          if (cat === 'hard' && p.category !== 'ハード系') return p;
          const key = type === 'today' ? 'today_stock' : 'advance_stock';
          const next = Math.max(0, (p as any)[key] + value);
          return { ...p, [key]: next };
        })
      );

      const res = await fetch('/api/bulk-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat, // 'all' | 'soft' | 'hard'
          target: type === 'today' ? 'today' : 'preorder',
          delta: value,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message || j.error || 'bulk api error');

      await fetchProducts(); // sync to server
    } catch (e) {
      console.error(e);
      alert('在庫一括更新に失敗しました');
      await fetchProducts(); // rollback
    } finally {
      setIsBulkLoading(false);
    }
  };

  /** ===== Per-product quick stock adjust ===== */
  const adjustOne = async (p: Product, which: 'today' | 'advance', diff: 1 | -1) => {
    // optimistic
    setProducts((cur) =>
      cur.map((x) => {
        if (x.id !== p.id) return x;
        const key = which === 'today' ? 'today_stock' : 'advance_stock';
        const next = Math.max(0, (x as any)[key] + diff);
        return { ...x, [key]: next };
      })
    );
    try {
      const body =
        which === 'today'
          ? { today_stock: Math.max(0, (p.today_stock ?? 0) + diff) }
          : { advance_stock: Math.max(0, (p.advance_stock ?? 0) + diff) };

      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('patch failed');
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert('在庫更新に失敗しました');
      await fetchProducts();
    }
  };

  /** ===== Edit modal submit ===== */
  const submitEdit = async () => {
    if (!editTarget) return;
    try {
      const res = await fetch(`/api/products/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          category: editForm.category, // 日本語でOK（API側で正規化）
          reservation_type: editForm.reservation_type,
          today_stock: Number(editForm.today_stock),
          advance_stock: Number(editForm.advance_stock),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'update failed');

      // optimistic merge
      setProducts((cur) => cur.map((x) => (x.id === editTarget.id ? normalize(j.data ?? x) : x)));

      setEditTarget(null);
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert('更新に失敗しました');
    }
  };

  /** ===== UI ===== */
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">商品・在庫管理</h2>
      <p className="text-gray-500">商品の追加・編集・削除、在庫調整を行います</p>

      <div className="flex justify-end mb-4">
  <Link
    href="/admin/products/new"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
  >
    新規追加
  </Link>
</div>


      {/* 一括在庫調整 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-blue-800 font-semibold text-base">一括在庫調整</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={isBulkLoading}
            onClick={(e)=>{e.preventDefault();e.stopPropagation();handleBulkStockUpdate('today',-1);}}
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm">当日在庫 -1</button>
          <button type="button" disabled={isBulkLoading}
            onClick={(e)=>{e.preventDefault();e.stopPropagation();handleBulkStockUpdate('today',+1);}}
            className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">当日在庫 +1</button>
          <button type="button" disabled={isBulkLoading}
            onClick={(e)=>{e.preventDefault();e.stopPropagation();handleBulkStockUpdate('advance',-1);}}
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm">事前在庫 -1</button>
          <button type="button" disabled={isBulkLoading}
            onClick={(e)=>{e.preventDefault();e.stopPropagation();handleBulkStockUpdate('advance',+1);}}
            className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm">事前在庫 +1</button>
        </div>
      </div>

      {/* 検索 & フィルタ */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="商品名で検索…"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="flex gap-2">
          <button type="button"
            className={`px-4 py-2 rounded border ${selectedCategory==='すべて'?'bg-gray-800 text-white':''}`}
            onClick={()=>setSelectedCategory('すべて')}>すべて</button>
          <button type="button"
            className={`px-4 py-2 rounded border ${selectedCategory==='ソフト系'?'bg-amber-600 text-white':''}`}
            onClick={()=>setSelectedCategory('ソフト系')}>ソフト系</button>
          <button type="button"
            className={`px-4 py-2 rounded border ${selectedCategory==='ハード系'?'bg-amber-600 text-white':''}`}
            onClick={()=>setSelectedCategory('ハード系')}>ハード系</button>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="rounded-xl border">
        <div className="px-4 py-3 border-b font-semibold">商品一覧（{filtered.length}商品）</div>
        {isLoading ? (
          <div className="p-6 text-gray-500">読み込み中…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">該当する商品がありません</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((p) => (
              <li key={p.id} className="px-4 py-3 flex items-center gap-4">
                {/* 画像 */}
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-200" />
                )}

                {/* 情報 */}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    <span className="ml-1 rounded bg-gray-100 px-2 py-0.5 text-[11px]">
  予約:{reserveLabel(p.reservation_type)}
</span>

                  </div>
                </div>

                {/* 在庫表示＋クイック± */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">当日</span>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">{p.today_stock ?? 0}個</span>
                  <div className="flex gap-1">
                    <button type="button" className="px-2 text-xs border rounded"
                      onClick={()=>adjustOne(p,'today',-1)}>-1</button>
                    <button type="button" className="px-2 text-xs border rounded"
                      onClick={()=>adjustOne(p,'today',+1)}>+1</button>
                  </div>

                  <span className="ml-2 text-xs text-gray-500">事前</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm">{p.advance_stock ?? 0}個</span>
                  <div className="flex gap-1">
                    <button type="button" className="px-2 text-xs border rounded"
                      onClick={()=>adjustOne(p,'advance',-1)}>-1</button>
                    <button type="button" className="px-2 text-xs border rounded"
                      onClick={()=>adjustOne(p,'advance',+1)}>+1</button>
                  </div>
                </div>

                {/* 編集ボタン */}
                <button
                  type="button"
                  className="ml-4 px-2 py-1 text-xs rounded border"
                  onClick={() => {
                    setEditTarget(p);
                    setEditForm({
                      name: p.name,
                      price: p.price,
                      category: p.category as any,
                      reservation_type: p.reservation_type,
                      today_stock: p.today_stock ?? 0,
                      advance_stock: p.advance_stock ?? 0,
                    });
                  }}
                >
                  編集
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[min(560px,92vw)]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">商品を編集</h3>
              <button type="button" onClick={() => setEditTarget(null)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">商品名</div>
                <input className="w-full border rounded px-2 py-1"
                  value={editForm.name}
                  onChange={(e)=>setEditForm(f=>({...f, name:e.target.value}))}/>
              </label>

              <label>
                <div className="text-xs text-gray-500 mb-1">価格</div>
                <input type="number" className="w-full border rounded px-2 py-1"
                  value={editForm.price}
                  onChange={(e)=>setEditForm(f=>({...f, price:Number(e.target.value||0)}))}/>
              </label>

              <label>
                <div className="text-xs text-gray-500 mb-1">カテゴリ</div>
                <select className="w-full border rounded px-2 py-1"
                  value={editForm.category}
                  onChange={(e)=>setEditForm(f=>({...f, category:e.target.value}))}>
                  <option>ソフト系</option>
                  <option>ハード系</option>
                </select>
              </label>

              <label>
                <div className="text-xs text-gray-500 mb-1">予約タイプ</div>
                <select className="w-full border rounded px-2 py-1"
                  value={editForm.reservation_type}
                  onChange={(e)=>setEditForm(f=>({...f, reservation_type:e.target.value as ReservationType}))}>
                  <option value="both">両方</option>
                  <option value="today">当日</option>
                  <option value="advance">事前</option>
                </select>
              </label>

              <label>
                <div className="text-xs text-gray-500 mb-1">当日在庫</div>
                <input type="number" className="w-full border rounded px-2 py-1"
                  value={editForm.today_stock}
                  onChange={(e)=>setEditForm(f=>({...f, today_stock:Number(e.target.value||0)}))}/>
              </label>

              <label>
                <div className="text-xs text-gray-500 mb-1">事前在庫</div>
                <input type="number" className="w-full border rounded px-2 py-1"
                  value={editForm.advance_stock}
                  onChange={(e)=>setEditForm(f=>({...f, advance_stock:Number(e.target.value||0)}))}/>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="px-3 py-2 border rounded" onClick={()=>setEditTarget(null)}>キャンセル</button>
              <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submitEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

