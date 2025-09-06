'use client';

import { useState, useEffect } from 'react';

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'regular' | 'special';
}

export default function HolidaySettings() {
  const [regularHolidays, setRegularHolidays] = useState<number[]>([3]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    type: 'special' as 'regular' | 'special'
  });
  const [isLoading, setIsLoading] = useState(true);

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // データベースから休業日データを取得
  const fetchHolidays = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-holidays`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('休業日データの取得に失敗しました');
      }

      const result = await response.json();
      setRegularHolidays(result.regularHolidays || [3]);
      setHolidays(result.holidays || []);
      setIsLoading(false);
    } catch (error) {
      console.error('休業日データ取得エラー:', error);
      // フォールバック: ローカルストレージから取得
      const savedRegularHolidays = localStorage.getItem('bakery_regular_holidays');
      const savedHolidays = localStorage.getItem('bakery_holidays');

      if (savedRegularHolidays) {
        try {
          setRegularHolidays(JSON.parse(savedRegularHolidays));
        } catch (error) {
          setRegularHolidays([3]);
        }
      }

      if (savedHolidays) {
        try {
          setHolidays(JSON.parse(savedHolidays));
        } catch (error) {
          setHolidays([]);
        }
      }
      setIsLoading(false);
    }
  };

  // 定休日の保存
  const saveRegularHolidays = async (days: number[]) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'regular',
          data: { regularHolidays: days }
        })
      });

      if (!response.ok) {
        throw new Error('定休日の保存に失敗しました');
      }

      setRegularHolidays(days);
      // フォールバック用にローカルストレージにも保存
      localStorage.setItem('bakery_regular_holidays', JSON.stringify(days));
    } catch (error) {
      console.error('定休日保存エラー:', error);
      // エラー時はローカルストレージのみ更新
      setRegularHolidays(days);
      localStorage.setItem('bakery_regular_holidays', JSON.stringify(days));
    }
  };

  // 個別休業日の追加
  const addHoliday = async (holiday: Holiday) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'add_holiday',
          data: { holiday }
        })
      });

      if (!response.ok) {
        throw new Error('休業日の追加に失敗しました');
      }

      const updated = [...holidays, holiday].sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(updated);
      // フォールバック用にローカルストレージにも保存
      localStorage.setItem('bakery_holidays', JSON.stringify(updated));
    } catch (error) {
      console.error('休業日追加エラー:', error);
      // エラー時はローカルストレージのみ更新
      const updated = [...holidays, holiday].sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(updated);
      localStorage.setItem('bakery_holidays', JSON.stringify(updated));
    }
  };

  // 個別休業日の削除
  const deleteHoliday = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'delete_holiday',
          data: { holidayId: id }
        })
      });

      if (!response.ok) {
        throw new Error('休業日の削除に失敗しました');
      }

      const updated = holidays.filter(h => h.id !== id);
      setHolidays(updated);
      // フォールバック用にローカルストレージにも保存
      localStorage.setItem('bakery_holidays', JSON.stringify(updated));
    } catch (error) {
      console.error('休業日削除エラー:', error);
      // エラー時はローカルストレージのみ更新
      const updated = holidays.filter(h => h.id !== id);
      setHolidays(updated);
      localStorage.setItem('bakery_holidays', JSON.stringify(updated));
    }
  };

  // 過去の休業日を自動削除
  const cleanupPastHolidays = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'cleanup_past',
          data: {}
        })
      });

      if (!response.ok) {
        throw new Error('過去休業日の削除に失敗しました');
      }

      // データを再取得
      await fetchHolidays();
      alert('過去の休業日を削除しました');
    } catch (error) {
      console.error('過去休業日削除エラー:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // 定休日の切り替え
  const toggleRegularHoliday = (dayIndex: number) => {
    const updated = regularHolidays.includes(dayIndex)
      ? regularHolidays.filter(d => d !== dayIndex)
      : [...regularHolidays, dayIndex].sort();
    
    saveRegularHolidays(updated);
  };

  // 個別休業日の追加
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHoliday.date || !newHoliday.name) {
      alert('日付と休業理由を入力してください');
      return;
    }

    // 過去の日付チェック
    const selectedDate = new Date(newHoliday.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('過去の日付は設定できません');
      return;
    }

    // 重複チェック
    if (holidays.some(h => h.date === newHoliday.date)) {
      alert('既に設定されている日付です');
      return;
    }

    const holiday: Holiday = {
      id: `holiday_${Date.now()}`,
      date: newHoliday.date,
      name: newHoliday.name,
      type: newHoliday.type
    };

    await addHoliday(holiday);
    
    setNewHoliday({ date: '', name: '', type: 'special' });
    setShowAddModal(false);
  };

  // 個別休業日の削除
  const handleDeleteHoliday = async (id: string) => {
    if (confirm('この休業日を削除しますか？')) {
      await deleteHoliday(id);
    }
  };

  // 今後の休業日を取得（表示用）
  const getUpcomingHolidays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return holidays.filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate >= today;
    });
  };

  const upcomingHolidays = getUpcomingHolidays();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line animate-spin text-4xl text-amber-600 mr-3"></i>
        <span className="text-lg text-gray-600">休業日データを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">店舗休業日設定</h2>
            <p className="text-gray-600">定休日と個別休業日を設定できます。休業日は予約受付ができません。</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cleanupPastHolidays}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              過去の休業日削除
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-close-line mr-2"></i>
              個別休業日追加
            </button>
          </div>
        </div>
      </div>

      {/* 定休日設定 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="ri-calendar-2-line text-blue-600 mr-2"></i>
          定休日設定
        </h3>
        <p className="text-gray-600 mb-6">毎週の定休日を設定します。複数選択可能です。</p>
        
        <div className="grid grid-cols-7 gap-3">
          {dayNames.map((day, index) => (
            <button
              key={index}
              onClick={() => toggleRegularHoliday(index)}
              className={`p-4 rounded-xl border-2 text-center font-semibold transition-all cursor-pointer ${
                regularHolidays.includes(index)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">{day}</div>
              <div className="text-xs">
                {regularHolidays.includes(index) ? '定休日' : '営業日'}
              </div>
            </button>
          ))}
        </div>
        
        {regularHolidays.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">
              今週は {regularHolidays.map(d => dayNames[d]).join('・')}曜日 が定休日です
            </p>
          </div>
        )}
      </div>

      {/* 個別休業日一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="ri-calendar-close-line text-red-600 mr-2"></i>
            個別休業日一覧 ({upcomingHolidays.length}件)
          </h3>
        </div>

        {upcomingHolidays.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-calendar-check-line text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">設定されている個別休業日はありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">曜日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">休業理由</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種類</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingHolidays.map((holiday) => {
                  const date = new Date(holiday.date);
                  const dayOfWeek = dayNames[date.getDay()];
                  
                  return (
                    <tr key={holiday.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {date.getMonth() + 1}月{date.getDate()}日
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {dayOfWeek}曜日
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {holiday.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          holiday.type === 'special' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {holiday.type === 'special' ? '特別休業' : '定休日'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                          title="削除"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 個別休業日追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">個別休業日追加</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休業日</label>
                <input
                  type="date"
                  required
                  min={newHoliday.date}
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休業理由</label>
                <input
                  type="text"
                  required
                  placeholder="例：店舗改装、年末年始、臨時休業など"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 pr-8"
                >
                  <option value="special">特別休業</option>
                  <option value="regular">定休日振替</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}