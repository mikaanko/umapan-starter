import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-service-role-key"
);

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.price === "number") patch.price = body.price;
  if (typeof body.stock === "number") patch.stock = body.stock;
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  const { data, error } = await supabase
    .from("app_products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, product: data });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const { error } = await supabase.from("app_products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
