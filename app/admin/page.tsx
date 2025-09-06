'use client';

import { useState } from 'react';
import AdminReservationList from '@/app/components/AdminReservationList';

type TabKey = 'reservations' | 'products' | 'holiday' | 'reports' | 'customers';

const TABS: { key: TabKey; label: string; icon?: string }[] = [
  { key: 'reservations', label: '予約管理', icon: 'ri-booklet-line' },
  { key: 'products',     label: '商品・在庫管理', icon: 'ri-store-2-line' },
  { key: 'holiday',      label: '休業日設定', icon: 'ri-calendar-event-line' },
  { key: 'reports',      label: '売上レポート', icon: 'ri-bar-chart-2-line' },
  { key: 'customers',    label: '顧客管理', icon: 'ri-user-3-line' },
];

export default function AdminPage() {
  const [active, setActive] = useState<TabKey>('reservations');

  return (
    <main className="p-6">
      {/* 見出し */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">うまじのパン屋 <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">管理画面</span></h1>
        <a href="/" className="text-sm text-gray-500 hover:underline">ログアウト</a>
      </div>

      {/* タブ */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-4">
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={[
                  'px-3 py-2 text-sm font-medium border-b-2',
                  isActive
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ].join(' ')}
              >
                {t.icon && <i className={`${t.icon} mr-1 align-[-2px]`} />}
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* タブ内容 */}
      {active === 'reservations' && (
        <AdminReservationList />
      )}

      {active === 'products' && (
        <SectionShell title="商品・在庫管理">
          <p className="text-gray-600">ここに「商品一覧」「在庫数の一括更新」「並び順」などを置きます。</p>
          <ul className="list-disc pl-6 mt-2 text-gray-600 text-sm">
            <li>（あとで）<code>app/components/AdminProductList.tsx</code> を読み込む</li>
            <li>（あとで）CSV インポート／エクスポート</li>
          </ul>
        </SectionShell>
      )}

      {active === 'holiday' && (
        <SectionShell title="休業日設定">
          <p className="text-gray-600">カレンダーで店休日・受け取り不可時間帯を設定できるようにします。</p>
        </SectionShell>
      )}

      {active === 'reports' && (
        <SectionShell title="売上レポート">
          <p className="text-gray-600">期間指定の売上集計・予約数推移グラフなどを表示します。</p>
        </SectionShell>
      )}

      {active === 'customers' && (
        <SectionShell title="顧客管理">
          <p className="text-gray-600">お客様情報リスト・検索・来店履歴などをここに追加します。</p>
        </SectionShell>
      )}
    </main>
  );
}

/** シンプルな枠（プレースホルダ用） */
function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      {children}
    </div>
  );
}
