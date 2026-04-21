import { z } from "zod";

export const reservationSchema = z.object({
  customerName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  pickupDate: z.string().date(),
  pickupTime: z.string().min(1).max(50),
  notes: z.string().max(500).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productName: z.string().min(1),
        unitPrice: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});
