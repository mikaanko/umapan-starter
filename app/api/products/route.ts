// app/api/products/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { productSchema } from "@/lib/validations/product";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const data = {
      name: String(form.get("name") || ""),
      price: Number(form.get("price") || 0),
      stock: Number(form.get("stock") || 0),
      category: (form.get("category") as string) || undefined,
      description: (form.get("description") as string) || undefined,
      is_active:
        String(form.get("is_active")) === "on" ||
        String(form.get("is_active")) === "true",
    };

    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // 画像（任意）
    let image_url: string | undefined;
    const image = form.get("image") as File | null;
    if (image && image.size > 0) {
      const ext = image.type.split("/")[1] || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`; // Web標準のcrypto
      const arrayBuf = await image.arrayBuffer();

      const { error: upErr } = await supabaseAdmin.storage
        .from("products")
        .upload(filename, arrayBuf, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });
      if (upErr) {
        return NextResponse.json(
          { error: `画像アップロード失敗: ${upErr.message}` },
          { status: 500 }
        );
      }

      const { data: pub } = supabaseAdmin.storage.from("products").getPublicUrl(filename);
      image_url = pub.publicUrl;
    }

    const { error: insErr, data: inserted } = await supabaseAdmin
      .from("app_products")
      .insert([{ ...parsed.data, image_url }])
      .select()
      .single();

    if (insErr) {
      return NextResponse.json({ error: `保存に失敗: ${insErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product: inserted }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
