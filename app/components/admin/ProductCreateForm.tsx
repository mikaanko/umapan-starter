"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductCreateForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } =
    useForm<ProductInput>({
      resolver: zodResolver(productSchema),
      defaultValues: { is_active: true, stock: 0 },
    });

  const onSubmit = async (values: ProductInput) => {
    try {
      setSubmitting(true);
      setError(null);

      const form = new FormData();
      form.set("name", values.name);
      form.set("price", String(values.price));
      form.set("stock", String(values.stock ?? 0));
      if (values.category) form.set("category", values.category);
      if (values.description) form.set("description", values.description);
      form.set("is_active", String(values.is_active));

      const file = (document.getElementById("image") as HTMLInputElement)?.files?.[0];
      if (file) form.set("image", file);

      const res = await fetch("/api/products", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "保存に失敗しました");

      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-xl border p-6 space-y-6 bg-white">
      <h2 className="text-xl font-semibold">新規商品追加</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">商品名</label>
          <input id="name" className="w-full border rounded-md px-3 py-2" placeholder="例：バターあんぱん" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">価格（円）</label>
            <input id="price" type="number" min={0} step={1} className="w-full border rounded-md px-3 py-2"
                   {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="stock" className="text-sm font-medium">在庫</label>
            <input id="stock" type="number" min={0} step={1} className="w-full border rounded-md px-3 py-2"
                   {...register("stock", { valueAsNumber: true })} />
            {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">カテゴリ</label>
            <input id="category" className="w-full border rounded-md px-3 py-2" placeholder="例：菓子パン" {...register("category")} />
          </div>
          <div className="space-y-2">
            <label htmlFor="is_active" className="text-sm font-medium">販売中</label>
            <div className="flex items-center gap-3">
              <input id="is_active" type="checkbox" defaultChecked {...register("is_active")} />
              <span className="text-sm text-gray-600">販売する</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">説明</label>
          <textarea id="description" rows={4} className="w-full border rounded-md px-3 py-2" placeholder="説明を入力"
                    {...register("description")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-medium">商品画像（任意）</label>
          <input id="image" type="file" accept="image/*" className="block w-full text-sm" />
          <p className="text-xs text-gray-500">jpg / png / webp など</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => history.back()} className="px-3 py-2 rounded-md border">キャンセル</button>
          <button type="submit" disabled={submitting}
                  className="px-3 py-2 rounded-md bg-black text-white disabled:opacity-50">
            {submitting ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
