'use client';

type Props = {
  sameDayOnly: boolean;
  setSameDayOnly: (v: boolean) => void;
};

export default function ReservationTabs({ sameDayOnly, setSameDayOnly }: Props) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => setSameDayOnly(true)}
        className={`px-4 py-3 rounded-md text-sm font-semibold border ${
          sameDayOnly
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        当日お取り置き
      </button>
      <button
        onClick={() => setSameDayOnly(false)}
        className={`px-4 py-3 rounded-md text-sm font-semibold border ${
          !sameDayOnly
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        前日まで予約
      </button>
    </div>
  );
}
