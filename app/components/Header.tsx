
'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';
import Link from 'next/link';

export default function Header() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-['Pacifico'] text-amber-700">
              うまじのパン屋
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
              ホーム
            </Link>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer"
            >
              お問い合わせ
            </button>
            <Link 
              href="/admin"
              className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer"
            >
              管理画面
            </Link>
          </nav>
        </nav>
      </header>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </>
  );
}
