'use client';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function TimeSlotPicker({ value, onChange }: Props) {
  // 仮の30分刻みスロット
  const slots = [
    '10:30','11:00','11:30',
    '12:00','12:30','13:00',
    '13:30','14:00','14:30',
    '15:00','15:30','16:00',
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
      {slots.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`border rounded-md px-4 py-3 text-sm text-center ${
            value === t
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
