"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CsvExport() {
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();

  const period = sp.get("period") ?? "all";
  const status = sp.get("status") ?? "all";
  const type = sp.get("type") ?? "all";

  const handleExport = async () => {
    try {
      setLoading(true);
      const url = `/api/export-reservations?period=${period}&status=${status}&type=${type}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("エクスポートに失敗しました");
      const blob = await res.blob();
      const csvUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = csvUrl;
      a.download = `reservations_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(csvUrl);
    } catch (e: any) {
      alert("エクスポート中にエラー: " + (e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
      disabled={loading}
      onClick={handleExport}
    >
      {loading ? "出力中..." : "CSVダウンロード"}
    </button>
  );
}
