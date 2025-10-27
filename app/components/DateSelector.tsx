'use client';

type Props = {
  value: string;
  onChange: (v: string) => void;
  daysAhead: number;      // 0 なら今日だけ、14なら2週間分
  sameDayOnly: boolean;
};

export default function DateSelector({
  value,
  onChange,
  daysAhead,
  sameDayOnly,
}: Props) {
  // 仮で「今日から daysAhead 日ぶんの配列」をつくるダミー
  // 実装済みなら今のロジックをそのまま使ってOK
  const today = new Date();
  const options: { label: string; value: string }[] = [];

  const len = sameDayOnly ? 1 : daysAhead + 1;
  for (let i = 0; i < len; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const weekday = ['日','月','火','水','木','金','土'][d.getDay()];

    options.push({
      value: d.toISOString().slice(0,10),         // "2025-10-25" みたいな形式
      label: `${mm}/${dd} (${weekday})`,
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`border rounded-md px-4 py-3 text-sm text-center ${
            value === opt.value
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
