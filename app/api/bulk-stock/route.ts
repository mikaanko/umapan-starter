// app/api/bulk-stock/route.ts（堅牢デバッグ版：必ずJSONで返す）
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs"; // 念のため Node で実行

type Target = "today" | "preorder";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 受け取り & バリデーション
    const rawCategory = String(body.category ?? "all");
    const target: Target = body.target;
    const delta = Number(body.delta);

    if (!["today", "preorder"].includes(target)) {
      return NextResponse.json({ ok: false, error: "invalid target", got: target }, { status: 400 });
    }
    if (![1, -1].includes(delta)) {
      return NextResponse.json({ ok: false, error: "invalid delta", got: delta }, { status: 400 });
    }

    // カテゴリを日本語ラベルに正規化（DBは「ソフト系/ハード系」）
    const catLabel =
      rawCategory === "soft" || rawCategory === "ソフト系" ? "ソフト系" :
      rawCategory === "hard" || rawCategory === "ハード系" ? "ハード系" :
      null; // null=全件

    // 環境変数チェック（ここで落ちると画面は空の500になるので事前に弾く）
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRole) {
      return NextResponse.json(
        { ok: false, where: "env", error: "Missing Supabase envs", have: { url: !!url, serviceRole: !!serviceRole } },
        { status: 500 }
      );
    }

    // ここで初めてクライアント生成（env未設定時のクラッシュを回避）
    const supabase = createClient(url, serviceRole);

    // まず RPC（VIEWでも確実に通る）
    const { error: rpcErr } = await supabase.rpc("bulk_adjust_stock_by_category", {
      p_category: catLabel,   // 'ソフト系' | 'ハード系' | null
      p_target: target,       // 'today' | 'preorder'
      p_delta: delta,         // +1 | -1
    });

    if (rpcErr) {
      // 関数未作成 or その他のDBエラー
      return NextResponse.json(
        {
          ok: false,
          where: "rpc",
          message: rpcErr.message,
          details: (rpcErr as any).details ?? null,
          hint: (rpcErr as any).hint ?? null,
          code: (rpcErr as any).code ?? null,
          sent: { catLabel, target, delta }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, method: "rpc", sent: { catLabel, target, delta } });
  } catch (e: any) {
    // ここに入れば必ず JSON で返る
    return NextResponse.json({ ok: false, where: "route", message: e?.message, stack: e?.stack }, { status: 500 });
  }
}
