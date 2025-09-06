
'use client';

import { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import CustomerInfo from './CustomerInfo';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ReservationFormProps {
  onComplete: (data: any) => void;
  cartItems: CartItem[];
  reservationType: 'today' | 'advance';
}

export default function ReservationForm({ onComplete, cartItems, reservationType }: ReservationFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    comments: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (reservationType === 'today') {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate('');
    }
  }, [reservationType]);

  const validateForm = () => {
    const newErrors: any = {};

    if (cartItems.length === 0) {
      newErrors.cart = 'パンを選択してください';
    }

    if (!selectedDate) {
      newErrors.date = '受取日を選択してください';
    }

    if (!selectedTime) {
      newErrors.time = '受け取り時間を選択してください';
    }

    if (!customerInfo.name.trim()) {
      newErrors.name = 'お名前を入力してください';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!/^[0-9-]+$/.test(customerInfo.phone)) {
      newErrors.phone = '正しい電話番号を入力してください';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendReservationEmail = async (reservationData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reservation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ reservationData })
      });

      if (!response.ok) {
        throw new Error('メール送信に失敗しました');
      }

      const result = await response.json();
      console.log('メール送信完了:', result);
    } catch (error) {
      console.error('メール送信エラー:', error);
    }
  };

  const saveReservationToDatabase = async (reservationData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ reservationData })
      });

      if (!response.ok) {
        throw new Error('予約データの保存に失敗しました');
      }

      const result = await response.json();
      console.log('予約データ保存完了:', result);
      return result;
    } catch (error) {
      console.error('予約データ保存エラー:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationData = {
        id: `R${Date.now()}`,
        type: reservationType === 'today' ? '当日お取り置き' : '事前予約',
        date: selectedDate,
        time: selectedTime,
        items: cartItems,
        totalPrice,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        ...customerInfo
      };

      // データベースに予約データを保存
      await saveReservationToDatabase(reservationData);

      // メール送信
      await sendReservationEmail(reservationData);

      // 予約完了処理
      onComplete(reservationData);

      // フォームリセット
      setSelectedDate(reservationType === 'today' ? new Date().toISOString().split('T')[0] : '');
      setSelectedTime('');
      setCustomerInfo({ name: '', phone: '', email: '', comments: '' });
      setErrors({});
    } catch (error) {
      console.error('予約処理エラー:', error);
      alert('予約の送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
      <form id="reservation-form" onSubmit={handleSubmit} className="space-y-8">
        {/* 予約タイプ表示 */}
        <div className={`p-4 rounded-xl ${
          reservationType === 'today' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <i className={`text-2xl mr-3 ${
              reservationType === 'today' 
                ? 'ri-calendar-today-line text-blue-600' 
                : 'ri-calendar-schedule-line text-green-600'
            }`}></i>
            <div>
              <h3 className={`font-semibold ${
                reservationType === 'today' ? 'text-blue-800' : 'text-green-800'
              }`}>
                {reservationType === 'today' ? '当日お取り置き' : '前日まで事前予約'}
              </h3>
              <p className={`text-sm ${
                reservationType === 'today' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {reservationType === 'today' 
                  ? '本日のパンをお取り置きします' 
                  : '事前にご予約いただいたパンをご準備します'
                }
              </p>
            </div>
          </div>
        </div>

        {cartItems.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-file-list-line text-amber-600 mr-2"></i>
              ご注文内容
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">¥{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-amber-600">¥{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>合計金額:</span>
                <span className="text-amber-600">¥{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {errors.cart && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-2"></i>
              {errors.cart}
            </p>
          </div>
        )}

        <DateSelector
          reservationType={reservationType}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          error={errors.date}
        />

        <TimeSelector
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          error={errors.time}
        />

        <CustomerInfo
          customerInfo={customerInfo}
          onInfoChange={setCustomerInfo}
          errors={errors}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <i className="ri-information-line mr-2"></i>
            ご注意ください
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 完売次第閉店いたします</li>
            <li>• 営業時間内であれば、ご予約のお客様をお待ちしております</li>
            <li>• 当日の状況により、一部商品が品切れになる場合があります</li>
            {reservationType === 'advance' && (
              <li>• 事前予約商品は前日までに製造準備を行います</li>
            )}
            <li>• 予約確認メールをお送りしますので、メールアドレスをご確認ください</li>
          </ul>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                予約とメール送信中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i className="ri-check-line mr-2"></i>
                予約を確定する
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
