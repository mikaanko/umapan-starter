import { NextResponse } from "next/server";
import { reservationSchema } from "@/lib/reservation-schema";
import { getResendClient } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const from = process.env.RESEND_FROM_EMAIL;
const ownerEmail = process.env.SHOP_OWNER_EMAIL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "入力値が不正です", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const totalPrice = parsed.data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .insert({
        customer_name: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        pickup_date: parsed.data.pickupDate,
        pickup_time: parsed.data.pickupTime,
        notes: parsed.data.notes,
        total_price: totalPrice,
      })
      .select("id")
      .single();

    if (reservationError || !reservation) {
      throw new Error(reservationError?.message ?? "予約の保存に失敗しました");
    }

    const reservationItems = parsed.data.items.map((item) => ({
      reservation_id: reservation.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("reservation_items")
      .insert(reservationItems);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    if (from) {
      const resend = getResendClient();
      const itemLines = parsed.data.items
        .map((item) => `・${item.productName} x ${item.quantity}`)
        .join("\n");

      await resend.emails.send({
        from,
        to: [parsed.data.email],
        subject: "【うまパン】予約を受け付けました",
        text: `ご予約ありがとうございます。\n\n受取日: ${parsed.data.pickupDate}\n受取時間: ${parsed.data.pickupTime}\n\n${itemLines}\n\n合計: ¥${totalPrice}`,
      });

      if (ownerEmail) {
        await resend.emails.send({
          from,
          to: [ownerEmail],
          subject: `新規予約 #${reservation.id}`,
          text: `${parsed.data.customerName} さんから予約が入りました。\n受取: ${parsed.data.pickupDate} ${parsed.data.pickupTime}\n合計: ¥${totalPrice}`,
        });
      }
    }

    return NextResponse.json({ ok: true, reservationId: reservation.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "予約処理でエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
