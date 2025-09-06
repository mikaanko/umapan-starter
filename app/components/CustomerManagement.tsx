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

interface Customer {
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  reservations: Reservation[];
}

export default function CustomerManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });

  // 予約データの読み込み
  useEffect(() => {
    const loadReservations = () => {
      const saved = localStorage.getItem('reservations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setReservations(parsed);
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

  // 顧客データの集計
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();
    
    reservations.forEach(reservation => {
      const key = `${reservation.name}-${reservation.email}`;
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: reservation.name,
          phone: reservation.phone,
          email: reservation.email,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: reservation.date,
          status: 'active',
          reservations: []
        });
      }
      
      const customer = customerMap.get(key)!;
      customer.totalOrders += 1;
      customer.totalSpent += reservation.totalPrice;
      customer.reservations.push(reservation);
      
      // 最新の注文日を更新
      if (new Date(reservation.date) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = reservation.date;
      }
    });

    // アクティブ/非アクティブの判定（30日以内に注文があるかどうか）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    customerMap.forEach(customer => {
      customer.status = new Date(customer.lastOrderDate) > thirtyDaysAgo ? 'active' : 'inactive';
      // 予約を日付順でソート
      customer.reservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [reservations]);

  // 検索フィルタリング
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 顧客統計
  const customerStats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
      averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
      topSpender: customers.length > 0 ? customers[0] : null
    };
  }, [customers]);

  // メール送信
  const sendEmail = async () => {
    if (!selectedCustomer || !emailData.subject || !emailData.message) {
      alert('件名とメッセージを入力してください');
      return;
    }

    try {
      // ここで実際のメール送信処理を行う
      // 現在はアラートで代用
      alert(`${selectedCustomer.name}様にメールを送信しました\n\n件名: ${emailData.subject}\n\n${emailData.message}`);
      
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '' });
      setSelectedCustomer(null);
    } catch (error) {
      console.error('メール送信エラー:', error);
      alert('メール送信に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${date.getMonth() + 1}/${date.getDate()}(${dayOfWeek})`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待機中';
      case 'confirmed': return '確認済み';
      case 'cancelled': return 'キャンセル';
      default: return '不明';
    }
  };

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-xl text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">総顧客数</p>
              <p className="text-2xl font-bold text-gray-800">{customerStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-heart-line text-xl text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">アクティブ顧客</p>
              <p className="text-2xl font-bold text-gray-800">{customerStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="ri-money-yen-circle-line text-xl text-amber-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">平均購入額</p>
              <p className="text-2xl font-bold text-gray-800">¥{Math.round(customerStats.averageSpent).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-vip-crown-line text-xl text-purple-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">最高購入額</p>
              <p className="text-2xl font-bold text-gray-800">
                {customerStats.topSpender ? `¥${customerStats.topSpender.totalSpent.toLocaleString()}` : '¥0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とフィルタ */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">顧客管理</h2>
            <p className="text-gray-600">顧客情報の確認と個別連絡が可能です</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="名前、電話番号、メールアドレスで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* 顧客一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            顧客一覧 ({filteredCustomers.length}名)
          </h3>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">該当する顧客が見つかりません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客情報</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文実績</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終注文</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <tr key={`${customer.name}-${customer.email}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                          <p className="text-sm text-gray-500 truncate max-w-48">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{customer.totalOrders}回</div>
                        <div className="text-amber-600 font-semibold">¥{customer.totalSpent.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(customer.lastOrderDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'active' ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                          title="詳細を見る"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowEmailModal(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer"
                          title="メール送信"
                        >
                          <i className="ri-mail-line"></i>
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

      {/* 顧客詳細モーダル */}
      {selectedCustomer && !showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedCustomer.name}様の詳細情報</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* 顧客情報 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">電話番号</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p className="font-medium truncate">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ステータス</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedCustomer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCustomer.status === 'active' ? 'アクティブ' : '非アクティブ'}
                  </span>
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                <p className="text-sm text-blue-600">総注文回数</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">¥{selectedCustomer.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-green-600">総購入金額</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">¥{Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString()}</p>
                <p className="text-sm text-amber-600">平均注文額</p>
              </div>
            </div>

            {/* 予約履歴 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">予約履歴</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedCustomer.reservations.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">{formatDate(reservation.date)} {reservation.time}</p>
                        <p className="text-sm text-gray-600">{reservation.type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">¥{reservation.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {reservation.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(true);
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
              >
                <i className="ri-mail-line mr-2"></i>
                メール送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メール送信モーダル */}
      {showEmailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">{selectedCustomer.name}様にメール送信</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailData({ subject: '', message: '' });
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">宛先</label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">件名</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="メールの件名を入力..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="メッセージを入力..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailData({ subject: '', message: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  onClick={sendEmail}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}