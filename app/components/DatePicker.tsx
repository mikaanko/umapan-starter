'use client';
import React from 'react';

type Props = {
  value?: string; // '2025-11-03' みたいなISO文字列想定
  onChange: (v: string) => void;
  daysAhead?: number; // 何日先まで予約できるか
  sameDayOnly?: boolean; // 当日取り置きモードならtrue
};

export default function DatePicker({
  value,
  onChange,
  daysAhead = 14,
  sameDayOnly = false,
}: Props) {
  // 今日の日付を基準にリストをつくる
  const today = new Date();

  const options: { label: string; iso: string }[] = [];
  const limit = sameDayOnly ? 0 : daysAhead;

  for (let i = 0; i <= limit; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    // 表示用ラベル（例: "11/3 (日)"）
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    const label = `${Number(mm)}/${Number(dd)} (${weekday})`;

    // 値として使うISOライクな"2025-11-03"
    const iso = `${yyyy}-${mm}-${dd}`;

    options.push({ label, iso });
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.iso}
          onClick={() => onChange(opt.iso)}
          className={`py-2 rounded-lg border text-sm text-center ${
            value === opt.iso
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white hover:bg-orange-50 border-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
