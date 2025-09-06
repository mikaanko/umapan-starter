'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 簡単なパスワード認証（実際の運用では適切な認証システムを使用）
    if (password === 'umapan2024') {
      onLogin(true);
    } else {
      setError('パスワードが間違っています');
      onLogin(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-user-line text-2xl text-amber-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-['Pacifico'] mb-2">うまじのパン屋</h1>
          <p className="text-gray-600">管理画面ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              管理者パスワード
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors pl-12"
                placeholder="パスワードを入力"
                required
              />
              <i className="ri-lock-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm flex items-center">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                ログイン中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i className="ri-login-box-line mr-2"></i>
                ログイン
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 text-center">
            <i className="ri-information-line mr-1"></i>
            管理者のみアクセス可能です
          </p>
        </div>
      </div>
    </div>
  );
}