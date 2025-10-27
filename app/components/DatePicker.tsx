"use client";

import React from "react";

type DatePickerProps = {
  selectedDate: string; // 例: "2025-11-03"
  onChangeDate: (next: string) => void;
  daysAhead?: number; // 何日先まで予約できるか (sameDayOnly=falseのときに使う)
  sameDayOnly?: boolean; // trueなら「当日お取り置き」モードで今日だけ
};

export default function DatePicker({
  selectedDate,
  onChangeDate,
  daysAhead = 14,
  sameDayOnly = false,
}: DatePickerProps) {
  // ボタン用の日付リストを作る
  // [{ label: "11/3 (日)", iso: "2025-11-03" }, ...]
  const today = new Date();

  // 当日お取り置きなら1日分だけ、それ以外はdaysAhead+1日分
  const limit = sameDayOnly ? 1 : daysAhead + 1;

  const options: { label: string; iso: string }[] = [];
  for (let i = 0; i < limit; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    // 曜日ラベル
    const weekday = "日月火水木金土"[d.getDay()];
    const label = `${Number(mm)}/${Number(dd)} (${weekday})`;

    // ISOっぽい値 "2025-11-03"
    const iso = `${yyyy}-${mm}-${dd}`;

    options.push({ label, iso });
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.iso}
          onClick={() => onChangeDate(opt.iso)}
          className={`py-2 rounded-lg border text-sm text-center ${
            selectedDate === opt.iso
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
