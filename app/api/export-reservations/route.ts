// app/api/export-reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Next.js: キャッシュ無効 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** ====== ユーティリティ ====== **/
type Item = {
  product_name: string | null;
  price: number | null;
  quantity: number | null;
};

type Reservation = {
  id: string;
  type: string;
  date: string;    // YYYY-MM-DD（DB上のdate型）
  time: string;    // HH:mm など文字列
  name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string; // ISO
  reservation_items: Item[] | null;
};

type Period = "all" | "today" | "tomorrow";
type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";
type TypeFilter = "all" | "normal" | "preorder" | string;

/** CSV ヘッダー */
const HEADERS = [
  "予約ID",
  "予約タイプ",
  "受取日",
  "受取時間",
  "お客様名",
  "電話",
  "メール",
  "商品名",
  "数量",
  "単価",
  "小計",
  "ステータス",
  "作成日",
] as const;

/** CSV セル用：カンマ/改行/ダブルクォート対応 */
function toCsvCell(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val);
  if (s === "") return '""';
  // ダブルクォートをエスケープし、全体をクォート
  return `"${s.replace(/"/g, '""')}"`;
}

/** JST(Asia/Tokyo) の日付を YYYY-MM-DD で返す（DBフィルタ用） */
function getIsoDateForTZ(offsetDays = 0): string {
  const tz = "Asia/Tokyo";
  // 日本時間での「現在」
  const nowJst = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  );
  if (offsetDays) nowJst.setDate(nowJst.getDate() + offsetDays);
  // YYYY-MM-DD 部分だけ取得
  return nowJst.toISOString().split("T")[0];
}

/** Supabase クライアント生成（環境差吸収） */
function createSb() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.JBLIC_SUPABASE_URL;
  const supabaseKey =
    // 可能ならサーバー側のサービスキー、次にAnon
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.JBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Supabase env not set: url=${!!supabaseUrl}, key=${!!supabaseKey}`
    );
  }

  // セッションは使わないAPIなので persist false
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

/** 1予約を複数行（アイテム数ぶん）に展開してCSV行配列を返す */
function buildRows(r: Reservation): string[] {
  const base = [
    r.id ?? "",
    r.type ?? "",
    r.date ?? "",
    r.time ?? "",
    r.name ?? "",
    r.phone ?? "",
    r.email ?? "",
  ];

  const items: Item[] =
    Array.isArray(r.reservation_items) && r.reservation_items.length > 0
      ? r.reservation_items
      : [
          // 商品が未確定でも1行は出す（数量/単価/小計は0）
          { product_name: "", quantity: 0, price: 0 },
        ];

  return items.map((it) => {
    const qty = Number(it.quantity ?? 0);
    const unit = Number(it.price ?? 0);
    const subtotal = qty * unit;

    const cols = [
      ...base,
      it.product_name ?? "",
      qty,
      unit,
      subtotal,
      r.status ?? "",
      r.created_at ?? "",
    ];

    // セルごとにCSV整形
    return cols.map(toCsvCell).join(",");
  });
}

/** ====== メインハンドラ ====== **/
export async function GET(req: NextRequest) {
  try {
    const sb = createSb();

    // ---- クエリ取得 ----
    const sp = req.nextUrl.searchParams;
    const period = (sp.get("period") ?? "all") as Period; // all|today|tomorrow
    const status = (sp.get("status") ?? "all") as StatusFilter;
    const type = (sp.get("type") ?? "all") as TypeFilter;

    // ---- クエリ作成 ----
    // NOTE: reservation_items は外部参照
    let q = sb
      .from("reservations")
      .select(
        `
        id,
        type,
        date,
        time,
        name,
        phone,
        email,
        status,
        created_at,
        reservation_items:reservation_items (
          product_name,
          price,
          quantity
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: true });

    // 期間フィルタ：DB は YYYY-MM-DD の date 型なので ISO 文字列で絞る
    if (period === "today") {
      const iso = getIsoDateForTZ(0);
      q = q.eq("date", iso);
    } else if (period === "tomorrow") {
      const iso = getIsoDateForTZ(1);
      q = q.eq("date", iso);
    }

    // ステータス
    if (status !== "all") {
      q = q.eq("status", status);
    }

    // タイプ
    if (type !== "all") {
      q = q.eq("type", type);
    }

    const { data, error } = await q;
    if (error) {
      return NextResponse.json(
        { step: "query", message: error.message },
        { status: 500 }
      );
    }

    const rows = (data as Reservation[]).flatMap(buildRows);

    // ---- CSV 組み立て ----
    const headerLine = (HEADERS as readonly string[])
      .map(toCsvCell)
      .join(",");

    const lines = ["\uFEFF" + headerLine, ...rows]; // BOM 付き
    const csv = lines.join("\n");

    // ---- ダウンロード応答 ----
    const tzNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
    );
    const y = tzNow.getFullYear();
    const m = String(tzNow.getMonth() + 1).padStart(2, "0");
    const d = String(tzNow.getDate()).padStart(2, "0");
    const hh = String(tzNow.getHours()).padStart(2, "0");
    const mm = String(tzNow.getMinutes()).padStart(2, "0");
    const filename = `reservations_${y}${m}${d}_${hh}${mm}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=UTF-8",
        "content-disposition": `attachment; filename="${filename}"`,
        // Safari 対策：no-store 推奨
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { step: "catch", error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
