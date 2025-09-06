
'use client';

interface CustomerInfoProps {
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    comments?: string;
  };
  onInfoChange: (info: any) => void;
  errors: any;
}

export default function CustomerInfo({ customerInfo, onInfoChange, errors }: CustomerInfoProps) {
  const handleInputChange = (field: string, value: string) => {
    onInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">お客様情報</h2>
      
      <div className="space-y-6">
        {/* お名前 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お名前 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-user-line text-gray-400"></i>
            </div>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="山田太郎"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.name}
            </p>
          )}
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-phone-line text-gray-400"></i>
            </div>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="090-1234-5678"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.phone}
            </p>
          )}
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-mail-line text-gray-400"></i>
            </div>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="example@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.email}
            </p>
          )}
        </div>

        {/* ご意見・ご要望 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ご意見・ご要望
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <i className="ri-message-3-line text-gray-400"></i>
            </div>
            <textarea
              name="comments"
              value={customerInfo.comments || ''}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="パンの感想、アレルギー情報、特別なご要望などがございましたらお聞かせください"
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              アレルギー情報やご要望などをお気軽にご記入ください
            </p>
            <div className="text-xs text-gray-500">
              {(customerInfo.comments || '').length}/500文字
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
