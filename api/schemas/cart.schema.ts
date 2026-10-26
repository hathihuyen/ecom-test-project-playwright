import { z } from "zod";
import { IdSchema } from "./common.schema";

export const CartCreatedSchema = z.object({ id: IdSchema });

/** `{ "result": "item added or updated" }` and similar confirmations. */
export const CartResultSchema = z.object({ result: z.string().min(1) });

export const CartItemSchema = z.object({
    id: IdSchema,
    cart_id: IdSchema,
    product_id: IdSchema,
    quantity: z.number().int().positive(),
    discount_percentage: z.number().nullable(),
    product: z.object({ id: IdSchema, name: z.string().min(1), price: z.number().nonnegative() }),
});

export const CartSchema = z.object({
    id: IdSchema,
    additional_discount_percentage: z.number().nullable(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    cart_items: z.array(CartItemSchema),
});
