
'use client';

import { useMemo } from 'react';

interface DateSelectorProps {
  reservationType: 'today' | 'advance';
  selectedDate: string;
  onDateChange: (date: string) => void;
  error?: string;
}

export default function DateSelector({ 
  reservationType, 
  selectedDate, 
  onDateChange, 
  error 
}: DateSelectorProps) {
  const availableDates = useMemo(() => {
    // LocalStorageから休業日データを取得
    const getHolidays = () => {
      try {
        const savedHolidays = localStorage.getItem('bakery_holidays');
        const savedRegularHolidays = localStorage.getItem('bakery_regular_holidays');
        
        const holidays = savedHolidays ? JSON.parse(savedHolidays) : [];
        const regularHolidays = savedRegularHolidays ? JSON.parse(savedRegularHolidays) : [3]; // デフォルト水曜日
        
        return { holidays, regularHolidays };
      } catch (error) {
        console.error('休業日データの読み込みに失敗:', error);
        return { holidays: [], regularHolidays: [3] };
      }
    };

    const { holidays, regularHolidays } = getHolidays();
    
    const isHoliday = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // 定休日チェック
      if (regularHolidays.includes(dayOfWeek)) {
        return true;
      }
      
      // 個別休業日チェック
      return holidays.some((holiday: any) => holiday.date === dateStr);
    };

    const getHolidayInfo = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // 定休日チェック
      if (regularHolidays.includes(dayOfWeek)) {
        return { type: 'regular', name: '定休日' };
      }
      
      // 個別休業日チェック
      const holiday = holidays.find((h: any) => h.date === dateStr);
      if (holiday) {
        return { type: holiday.type, name: holiday.name };
      }
      
      return null;
    };
    
    const dates = [];
    const today = new Date();
    
    if (reservationType === 'today') {
      // 当日のみ - 今日が休業日でなければ表示
      if (!isHoliday(today)) {
        dates.push({
          value: today.toISOString().split('T')[0],
          label: `${today.getMonth() + 1}月${today.getDate()}日（本日）`,
          dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][today.getDay()],
          isHoliday: false,
          holidayInfo: null
        });
      } else {
        // 今日が休業日の場合の表示
        const holidayInfo = getHolidayInfo(today);
        dates.push({
          value: today.toISOString().split('T')[0],
          label: `${today.getMonth() + 1}月${today.getDate()}日（本日）`,
          dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][today.getDay()],
          isHoliday: true,
          holidayInfo
        });
      }
    } else {
      // 明日から2週間後まで
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        const isDateHoliday = isHoliday(date);
        const holidayInfo = getHolidayInfo(date);
        
        dates.push({
          value: date.toISOString().split('T')[0],
          label: `${date.getMonth() + 1}月${date.getDate()}日`,
          dayOfWeek,
          isHoliday: isDateHoliday,
          holidayInfo
        });
      }
    }
    
    return dates;
  }, [reservationType]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">受取日</h2>
      
      {reservationType === 'today' ? (
        <div>
          {availableDates[0]?.isHoliday ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <i className="ri-calendar-close-line text-2xl text-red-600 mr-3"></i>
                <div>
                  <p className="font-semibold text-red-800">
                    {availableDates[0]?.label}
                  </p>
                  <p className="text-sm text-red-600">
                    曜日: {availableDates[0]?.dayOfWeek}曜日
                  </p>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    本日は{availableDates[0]?.holidayInfo?.name}のため、お取り置きできません
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <i className="ri-calendar-check-line text-2xl text-blue-600 mr-3"></i>
                <div>
                  <p className="font-semibold text-blue-800">
                    {availableDates[0]?.label}
                  </p>
                  <p className="text-sm text-blue-600">
                    曜日: {availableDates[0]?.dayOfWeek}曜日
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 営業日 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">営業日</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableDates
                .filter(date => !date.isHoliday)
                .map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => onDateChange(date.value)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedDate === date.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-sm">{date.label}</p>
                    <p className="text-xs text-gray-500">{date.dayOfWeek}曜日</p>
                  </button>
                ))}
            </div>
          </div>

          {/* 休業日 */}
          {availableDates.some(date => date.isHoliday) && (
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                <i className="ri-calendar-close-line mr-1"></i>
                休業日（選択できません）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableDates
                  .filter(date => date.isHoliday)
                  .map((date) => (
                    <div
                      key={date.value}
                      className="p-3 rounded-lg border border-red-200 bg-red-50 text-left opacity-60"
                    >
                      <p className="font-medium text-sm text-red-700">{date.label}</p>
                      <p className="text-xs text-red-600">{date.dayOfWeek}曜日</p>
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {date.holidayInfo?.name}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {availableDates.filter(date => !date.isHoliday).length === 0 && (
            <div className="text-center py-8">
              <i className="ri-calendar-close-line text-4xl text-red-400 mb-2"></i>
              <p className="text-red-600 font-medium">選択可能な営業日がありません</p>
              <p className="text-red-500 text-sm mt-1">休業期間中のため、事前予約ができません</p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center">
          <i className="ri-error-warning-line mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
}
