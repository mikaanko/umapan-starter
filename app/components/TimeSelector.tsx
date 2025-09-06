'use client';

import { useMemo } from 'react';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  error?: string;
}

export default function TimeSelector({ selectedTime, onTimeChange, error }: TimeSelectorProps) {
  const timeSlots = useMemo(() => {
    const slots = [];
    // 10:30から16:00まで30分刻み
    for (let hour = 10; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // 16:00以降は除外
        if (hour === 16 && minute > 0) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        受け取り時間
        <span className="text-sm text-gray-500 ml-2">（10:30〜16:00、30分刻み）</span>
      </h2>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => onTimeChange(time)}
            className={`p-3 rounded-lg border transition-all font-medium ${
              selectedTime === time
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center">
          <i className="ri-error-warning-line mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
}