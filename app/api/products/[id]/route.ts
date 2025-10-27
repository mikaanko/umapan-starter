// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role（サーバ専用）
);

type PatchBody = Partial<{
  name: string;
  price: number;
  category: "ソフト系" | "ハード系" | "soft" | "hard";
  reservation_type: "today" | "advance" | "both";
  today_stock: number;
  advance_stock: number;
  image_url: string | null;
}>;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const body = (await req.json()) as PatchBody;

    const patch: any = {};
    if (typeof body.name === "string") patch.name = body.name;
    if (typeof body.price === "number") patch.price = Math.max(0, body.price);
    if (typeof body.today_stock === "number") patch.today_stock = Math.max(0, body.today_stock);
    if (typeof body.advance_stock === "number") patch.advance_stock = Math.max(0, body.advance_stock);
    if (typeof body.image_url !== "undefined") patch.image = body.image_url ?? null;

    if (body.category) {
      patch.category = body.category === "soft" ? "ソフト系"
                    : body.category === "hard" ? "ハード系"
                    : body.category;
    }
    if (body.reservation_type) {
      if (!["today", "advance", "both"].includes(body.reservation_type)) {
        return NextResponse.json({ error: "invalid reservation_type" }, { status: 400 });
      }
      patch.reservation_type = body.reservation_type;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
