'use client';

import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで問い合わせデータを処理
    alert('お問い合わせありがとうございます。後ほどご連絡いたします。');
    setFormData({ name: '', email: '', phone: '', message: '' });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <i className="ri-phone-line text-amber-600 mr-2"></i>
              お問い合わせ
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="mb-6 p-4 bg-amber-50 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">店舗情報</h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p className="flex items-center">
                <i className="ri-phone-line mr-2"></i>
                (0887)44-2555
              </p>
              <p className="flex items-center">
                <i className="ri-map-pin-line mr-2"></i>
                高知県安芸郡馬路村馬路3888-1
              </p>
              <p className="flex items-center">
                <i className="ri-time-line mr-2"></i>
                営業時間：9:00〜18:00
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="お名前を入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                placeholder="お問い合わせ内容をご入力ください（最大500文字）"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.message.length}/500文字
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 whitespace-nowrap cursor-pointer transition-colors"
              >
                送信する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}