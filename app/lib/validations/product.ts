// lib/validations/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  price: z.coerce.number().int().min(0, "0以上で入力してください"),
  stock: z.coerce.number().int().min(0, "0以上で入力してください").default(0),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
