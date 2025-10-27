
// app/api/send-mail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// 念のため明示
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Item = { product_name: string; quantity: number; unit_price: number; };
type ReservationPayload = {
  id: string; type: string; date: string; time?: string;
  name: string; phone: string; email: string;
  status: string; items: Item[]; total_price?: number;
};

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.MAIL_FROM!;
const SHOP_TO = process.env.MAIL_SHOP_TO!;

function fmtYen(n: number) { return n.toLocaleString("ja-JP"); }
function calcSubtotal(items: Item[]) {
  return (items ?? []).reduce((s, it) => s + (it.quantity ?? 0) * (it.unit_price ?? 0), 0);
}

function customerHtml(r: ReservationPayload, total: number) {
  const list = (r.items ?? [])
    .map(it => `<li>${it.product_name} × ${it.quantity} … <b>${fmtYen(it.unit_price * it.quantity)}</b>円</li>`)
    .join("");
  return `
    <h3>ご予約ありがとうございます（自動配信）</h3>
    <p>${r.name} 様</p>
    <ul>
      <li>予約ID: <b>${r.id}</b></li>
      <li>受取日: <b>${r.date}</b> ／ 時間: <b>${r.time ?? "-"}</b></li>
      <li>ステータス: <b>${r.status}</b></li>
    </ul>
    <h4>ご注文内容</h4>
    <ul>${list}</ul>
    <p style="text-align:right">小計: <b>${fmtYen(total)}</b> 円</p>
  `;
}

function shopHtml(r: ReservationPayload, total: number) {
  const list = (r.items ?? [])
    .map(it => `<li>${it.product_name} × ${it.quantity} … <b>${fmtYen(it.unit_price * it.quantity)}</b>円</li>`)
    .join("");
  return `
    <h3>【予約通知】</h3>
    <ul>
      <li>ID: <b>${r.id}</b></li>
      <li>種別: <b>${r.type}</b></li>
      <li>受取: <b>${r.date} ${r.time ?? ""}</b></li>
      <li>氏名: <b>${r.name}</b></li>
      <li>TEL: <b>${r.phone}</b></li>
      <li>Mail: <b>${r.email}</b></li>
    </ul>
    <h4>ご注文内容</h4>
    <ul>${list}</ul>
    <p style="text-align:right">合計: <b>${fmtYen(total)}</b> 円</p>
  `;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !FROM || !SHOP_TO) {
      console.error("[send-mail] Missing env", {
        hasKey: !!process.env.RESEND_API_KEY, FROM, SHOP_TO
      });
      return NextResponse.json({ ok: false, error: "Missing env" }, { status: 500 });
    }

    const r = (await req.json()) as ReservationPayload;
    const total = typeof r.total_price === "number" ? r.total_price : calcSubtotal(r.items);

    console.log('[MAIL] will send', {
  from: FROM,
  to: SHOP_TO,
  when: new Date().toISOString(),
});

    // お客様へ
    const customer = await resend.emails.send({
      from: FROM,
      to: r.email,
      subject: "ご予約ありがとうございます（自動配信）",
      text: "ブラウザでHTMLメールをご覧ください。",
      html: customerHtml(r, total),
    });

    // お店へ（返信先をお客様に）
    const shop = await resend.emails.send({
      from: FROM,
      to: SHOP_TO,
      replyTo: r.email, // ここは camelCase の replyTo（Resend v3）
      subject: `【受信】新規予約: ${r.name} 様 / ${r.date} ${r.time ?? ""}`,
      text: "ブラウザでHTMLメールをご覧ください。",
      html: shopHtml(r, total),
    });

    console.log("[send-mail] done", { customerId: customer.id, shopId: shop.id });
    return NextResponse.json({ ok: true, customerId: customer.id, shopId: shop.id });
  } catch (e: any) {
    console.error("[send-mail] error", e?.message ?? e);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
