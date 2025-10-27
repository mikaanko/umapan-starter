"use client";

import React from "react";

type TimeSlotPickerProps = {
  selectedSlot: string; // 例: "10:30-11:00"
  onChangeSlot: (next: string) => void;
  sameDayOnly?: boolean;
};

// この例では固定の時間帯を作ってる。
// 必要なら sameDayOnly を見て「短いリストにする」「後ろの枠を消す」とかもできる。
const BASE_SLOTS = [
  "10:30-11:00",
  "11:00-11:30",
  "11:30-12:00",
  "12:00-12:30",
  "12:30-13:00",
  "13:00-13:30",
  "14:00-14:30",
  "15:00-15:30",
];

export default function TimeSlotPicker({
  selectedSlot,
  onChangeSlot,
  sameDayOnly = false,
}: TimeSlotPickerProps) {
  // sameDayOnly=true のときに短い枠だけにしたいならここで絞るイメージ
  // const slots = sameDayOnly ? BASE_SLOTS.slice(0, 2) : BASE_SLOTS;
  const slots = BASE_SLOTS;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((t) => (
        <button
          key={t}
          onClick={() => onChangeSlot(t)}
          className={`border rounded-md px-4 py-3 text-sm text-center ${
            selectedSlot === t
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

