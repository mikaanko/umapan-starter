'use client';

import { useState, useEffect, useMemo } from 'react';

interface Reservation {
  id: string;
  type: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function SalesReport() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 予約データの読み込み
  useEffect(() => {
    const loadReservations = () => {
      const saved = localStorage.getItem('reservations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setReservations(parsed.filter((r: Reservation) => r.status !== 'cancelled'));
        } catch (error) {
          console.error('予約データの読み込みに失敗:', error);
          setReservations([]);
        }
      }
    };

    loadReservations();
    const interval = setInterval(loadReservations, 5000);
    return () => clearInterval(interval);
  }, []);

  // 期間フィルタリング
  const filteredReservations = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return reservations.filter(reservation => {
      const reservationDate = reservation.date;
      
      switch (selectedPeriod) {
        case 'today':
          return reservationDate === today;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return new Date(reservationDate) >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return new Date(reservationDate) >= monthAgo;
        default:
          return true;
      }
    });
  }, [reservations, selectedPeriod]);

  // 売上統計
  const salesStats = useMemo(() => {
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const totalOrders = filteredReservations.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const confirmedReservations = filteredReservations.filter(r => r.status === 'confirmed');
    const confirmedRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    
    return {
      totalRevenue,
      confirmedRevenue,
      totalOrders,
      confirmedOrders: confirmedReservations.length,
      averageOrderValue,
      pendingOrders: filteredReservations.filter(r => r.status === 'pending').length
    };
  }, [filteredReservations]);

  // 日別売上
  const dailySales = useMemo(() => {
    const salesByDate = filteredReservations.reduce((acc, reservation) => {
      const date = reservation.date;
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0, confirmed: 0 };
      }
      acc[date].revenue += reservation.totalPrice;
      acc[date].orders += 1;
      if (reservation.status === 'confirmed') {
        acc[date].confirmed += reservation.totalPrice;
      }
      return acc;
    }, {} as Record<string, { date: string; revenue: number; orders: number; confirmed: number }>);

    return Object.values(salesByDate).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredReservations]);

  // 商品別売上
  const productSales = useMemo(() => {
    const salesByProduct = filteredReservations.reduce((acc, reservation) => {
      reservation.items.forEach(item => {
        if (!acc[item.name]) {
          acc[item.name] = { 
            name: item.name, 
            quantity: 0, 
            revenue: 0, 
            orders: 0,
            price: item.price
          };
        }
        acc[item.name].quantity += item.quantity;
        acc[item.name].revenue += item.price * item.quantity;
        acc[item.name].orders += 1;
      });
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number; orders: number; price: number }>);

    return Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);
  }, [filteredReservations]);

  // 予約タイプ別統計
  const reservationTypeStats = useMemo(() => {
    const stats = filteredReservations.reduce((acc, reservation) => {
      const type = reservation.type;
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count += 1;
      acc[type].revenue += reservation.totalPrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return stats;
  }, [filteredReservations]);

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${date.getMonth() + 1}/${date.getDate()}(${dayOfWeek})`;
  };

  return (
    <div className="space-y-8">
      {/* ヘッダーとフィルタ */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">売上レポート</h2>
            <p className="text-gray-600">日別・商品別の売上データを確認できます</p>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '過去7日' },
            { key: 'month', label: '過去30日' },
            { key: 'all', label: 'すべて' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedPeriod === period.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 売上サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-money-yen-circle-line text-xl text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">総売上</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(salesStats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-xl text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">確定売上</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(salesStats.confirmedRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-shopping-cart-line text-xl text-purple-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">注文数</p>
              <p className="text-2xl font-bold text-gray-800">{salesStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="ri-calculator-line text-xl text-amber-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">平均注文額</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(salesStats.averageOrderValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 予約タイプ別統計 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="ri-pie-chart-line text-amber-600 mr-2"></i>
          予約タイプ別統計
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(reservationTypeStats).map(([type, stats]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">{type}</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">件数:</span>
                  <span className="font-medium">{stats.count}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">売上:</span>
                  <span className="font-medium">{formatCurrency(stats.revenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 日別売上 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="ri-calendar-line text-amber-600 mr-2"></i>
          日別売上
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">総売上</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">確定売上</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailySales.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{formatDate(day.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{day.orders}件</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(day.revenue)}</td>
                  <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(day.confirmed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dailySales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              選択した期間にデータがありません
            </div>
          )}
        </div>
      </div>

      {/* 商品別売上 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="ri-shopping-bag-line text-amber-600 mr-2"></i>
          商品別売上ランキング
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">順位</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">販売数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">売上</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">単価</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productSales.map((product, index) => (
                <tr key={product.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.quantity}個</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {productSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              選択した期間にデータがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}