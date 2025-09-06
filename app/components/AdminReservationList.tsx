'use client';

import { useState, useEffect, useMemo } from 'react';

interface ReservationItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Reservation {
  id: string;
  type: '当日お取り置き' | '事前予約';
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  name: string;
  phone: string;
  email: string;
  comments?: string;
  items: ReservationItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string; // ISO
}

export default function AdminReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);

  // 🔎 検索・フィルタ・並び替えの state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'confirmed'|'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all'|'today'|'advance'>('all');
  const [sortBy, setSortBy] = useState<'createdAt'|'date'|'totalPrice'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');

  const [isLoading, setIsLoading] = useState(true);

  // ✅ サンプルモード：サンプル投入中はAPIで上書きしない
  const [demoMode, setDemoMode] = useState(false);

  // ===== データ取得（Supabase Edge Function） =====
  const fetchReservations = async () => {
    if (demoMode) { setIsLoading(false); return; } // サンプル中は何もしない

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-reservations`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!response.ok) throw new Error('予約データの取得に失敗しました');
      const result = await response.json();
      const fetched: Reservation[] = result?.data ?? [];

      // APIが空配列のときは上書きしない（サンプルを消さない）
      if (Array.isArray(fetched) && fetched.length > 0) {
        setReservations(fetched);
        localStorage.setItem('reservations', JSON.stringify(fetched));
      } else {
        const saved: Reservation[] = JSON.parse(localStorage.getItem('reservations') || '[]');
        setReservations(saved);
      }
    } catch {
      const saved: Reservation[] = JSON.parse(localStorage.getItem('reservations') || '[]');
      setReservations(saved);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (demoMode) { setIsLoading(false); return; }
    fetchReservations();
    const t = setInterval(fetchReservations, 10000);
    return () => clearInterval(t);
  }, [demoMode]);

  // ===== サンプルデータ作成/操作 =====
  const generateSampleData = (): Reservation[] => {
    const today = new Date();
    const plus = (d: number) => new Date(Date.now() + d * 86400000);
    const iso = (dt: Date) => dt.toISOString().split('T')[0];

    return [
      {
        id: 'R1735123456789',
        type: '当日お取り置き',
        date: iso(today),
        time: '11:00',
        name: '田中 太郎',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        items: [
          { id: 1, name: 'くるみぱん', quantity: 2, price: 173 },
          { id: 7, name: 'まるぱん', quantity: 3, price: 137 },
        ],
        totalPrice: 757,
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'R1735123456790',
        type: '事前予約',
        date: iso(plus(1)),
        time: '14:30',
        name: '佐藤 花子',
        phone: '080-9876-5432',
        email: 'sato.hanako@example.com',
        items: [
          { id: 3, name: 'クランベリークリームチーズ', quantity: 1, price: 291 },
          { id: 19, name: 'バゲット(L)', quantity: 1, price: 399 },
          { id: 22, name: 'プチちょこ', quantity: 4, price: 173 },
        ],
        totalPrice: 1382,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'R1735123456791',
        type: '当日お取り置き',
        date: iso(today),
        time: '16:00',
        name: '山田 次郎',
        phone: '070-5555-1234',
        email: 'yamada.jiro@example.com',
        items: [
          { id: 5, name: 'あんぱん', quantity: 2, price: 259 },
          { id: 8, name: 'おさとうぱん', quantity: 1, price: 173 },
        ],
        totalPrice: 691,
        status: 'cancelled',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'R1735123456792',
        type: '事前予約',
        date: iso(plus(2)),
        time: '12:00',
        name: '鈴木 美咲',
        phone: '090-7777-8888',
        email: 'suzuki.misaki@example.com',
        items: [
          { id: 11, name: 'ぼうしぱん', quantity: 3, price: 248 },
          { id: 15, name: 'マヨたまぱん', quantity: 2, price: 248 },
          { id: 27, name: 'ベーコンエピ', quantity: 1, price: 410 },
        ],
        totalPrice: 1654,
        status: 'pending',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 'R1735123456793',
        type: '当日お取り置き',
        date: iso(plus(-1)),
        time: '10:30',
        name: '高橋 健太',
        phone: '080-3333-4444',
        email: 'takahashi@example.com',
        items: [
          { id: 12, name: 'ハムぱん', quantity: 1, price: 227 },
          { id: 13, name: 'うぃんなーぱん', quantity: 2, price: 151 },
          { id: 18, name: 'ベーコンチーズぱん', quantity: 1, price: 227 },
        ],
        totalPrice: 756,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
      },
    ];
  };

  const addSampleData = () => {
    const data = generateSampleData();
    setReservations(data);
    setFilteredReservations(data);
    localStorage.setItem('reservations', JSON.stringify(data));
    setDemoMode(true); // サンプル中フラグON
  };

  const clearAllData = () => {
    setReservations([]);
    setFilteredReservations([]);
    localStorage.removeItem('reservations');
    setDemoMode(false); // フラグOFF
  };

  // ===== フィルタ & ソート =====
  useEffect(() => {
    let f = [...reservations];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(searchTerm) ||
        r.email.toLowerCase().includes(q) ||
        r.id.includes(searchTerm)
      );
    }

    if (dateFilter) f = f.filter(r => r.date === dateFilter);

    if (statusFilter !== 'all') f = f.filter(r => r.status === statusFilter);

    if (typeFilter !== 'all') {
      const map = { today: '当日お取り置き', advance: '事前予約' } as const;
      f = f.filter(r => r.type === map[typeFilter]);
    }

    f.sort((a, b) => {
      const val = (r: Reservation) =>
        sortBy === 'date'
          ? new Date(`${r.date} ${r.time}`).getTime()
          : sortBy === 'totalPrice'
          ? r.totalPrice
          : new Date(r.createdAt).getTime();
      const A = val(a), B = val(b);
      return sortOrder === 'asc' ? A - B : B - A;
    });

    setFilteredReservations(f);
  }, [reservations, searchTerm, dateFilter, statusFilter, typeFilter, sortBy, sortOrder]);

  // ===== 集計 =====
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRes = reservations.filter(r => r.date === today);
    return {
      total: reservations.length,
      today: todayRes.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      todayRevenue: todayRes.reduce((s, r) => s + r.totalPrice, 0),
      totalRevenue: reservations.reduce((s, r) => s + r.totalPrice, 0),
    };
  }, [reservations]);

  // ===== UI =====
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const w = ['日','月','火','水','木','金','土'][d.getDay()];
    return `${d.getMonth()+1}/${d.getDate()}(${w})`;
  };
  const getStatusColor = (st: Reservation['status']) =>
    st === 'pending' ? 'text-yellow-600 bg-yellow-100'
    : st === 'confirmed' ? 'text-green-600 bg-green-100'
    : st === 'cancelled' ? 'text-red-600 bg-red-100'
    : 'text-gray-600 bg-gray-100';

  // 予約の状態変更/削除（ローカルのみ）
  const updateReservationStatus = (id: string, newStatus: Reservation['status']) => {
    const updated = reservations.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  const deleteReservation = (id: string) => {
    if (confirm('この予約を削除しますか？')) {
      const updated = reservations.filter((r) => r.id !== id);
      setReservations(updated);
      localStorage.setItem('reservations', JSON.stringify(updated));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">総予約数</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">本日の予約</p>
          <p className="text-2xl font-bold text-gray-800">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">待機中</p>
          <p className="text-2xl font-bold text-gray-800">{reservations.filter(r=>r.status==='pending').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">本日売上</p>
          <p className="text-2xl font-bold text-gray-800">¥{stats.todayRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* フィルタ＆アクション */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* 検索 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="名前、電話、メール、予約IDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* フィルタ */}
          <div className="flex gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">全期間</option>
              <option value={new Date().toISOString().split('T')[0]}>本日</option>
              <option value={new Date(Date.now()+86400000).toISOString().split('T')[0]}>明日</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">全ステータス</option>
              <option value="pending">待機中</option>
              <option value="confirmed">確認済み</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">全タイプ</option>
              <option value="today">当日お取り置き</option>
              <option value="advance">事前予約</option>
            </select>
          </div>
        </div>

        {/* 並び替え＆アクション */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">並び順:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="createdAt">予約日時</option>
              <option value="date">受取日時</option>
              <option value="totalPrice">金額</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              title="昇順/降順"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addSampleData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              サンプルデータ追加
            </button>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              全削除
            </button>
          </div>
        </div>
      </div>

      {/* 予約一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            予約一覧 ({filteredReservations.length}件)
          </h2>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">該当する予約がありません</p>
            {reservations.length === 0 && (
              <button
                onClick={addSampleData}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                サンプルデータを追加してテストする
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予約情報</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受取日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{r.name}</div>
                        <div className="text-gray-500">{r.phone}</div>
                        <div className="text-gray-500 truncate">{r.email}</div>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            r.type === '当日お取り置き' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {r.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">ID: {r.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{formatDate(r.date)}</div>
                        <div className="text-gray-500">{r.time}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          予約: {new Date(r.createdAt).toLocaleString('ja-JP')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {r.items.map((it, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-gray-900">{it.name} × {it.quantity}</span>
                            <span className="text-gray-500 ml-2">¥{(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
                          <span>合計</span>
                          <span className="text-amber-600">¥{r.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>
                        {r.status === 'pending' ? '待機中' : r.status === 'confirmed' ? '確認済み' : r.status === 'cancelled' ? 'キャンセル' : '不明'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => updateReservationStatus(r.id, 'confirmed')}
                            className="px-3 py-1 text-green-700 bg-green-100 rounded"
                          >
                            確認
                          </button>
                        )}
                        {r.status !== 'cancelled' && (
                          <button
                            onClick={() => updateReservationStatus(r.id, 'cancelled')}
                            className="px-3 py-1 text-red-700 bg-red-100 rounded"
                          >
                            取消
                          </button>
                        )}
                        <button
                          onClick={() => deleteReservation(r.id)}
                          className="px-3 py-1 text-gray-700 bg-gray-100 rounded"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
