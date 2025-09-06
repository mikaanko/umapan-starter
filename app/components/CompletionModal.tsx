
'use client';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: any;
}

export default function CompletionModal({ isOpen, onClose, reservationData }: CompletionModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${date.getMonth() + 1}月${date.getDate()}日（${dayOfWeek}曜日）`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-3xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            予約が完了しました！
          </h2>
          <p className="text-gray-600">
            予約確認メールをお送りいたします
          </p>
        </div>

        {reservationData && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">予約内容</h3>
            
            {/* 注文商品 */}
            {reservationData.items && reservationData.items.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">ご注文商品:</h4>
                <div className="space-y-2">
                  {reservationData.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                  <span>合計:</span>
                  <span className="text-amber-600">¥{reservationData.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">予約タイプ:</span>
              <span className="font-medium">{reservationData.type}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">受取日:</span>
              <span className="font-medium">{formatDate(reservationData.date)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">受け取り時間:</span>
              <span className="font-medium">{reservationData.time}</span>
            </div>
            
            <hr className="border-gray-200" />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">お名前:</span>
              <span className="font-medium">{reservationData.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">電話番号:</span>
              <span className="font-medium">{reservationData.phone}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">メール:</span>
              <span className="font-medium text-sm">{reservationData.email}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            新しい予約をする
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
