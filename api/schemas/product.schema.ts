import { z } from "zod";
import { IdSchema, paginated } from "./common.schema";

/**
 * The API returns a different `category` shape per endpoint:
 * search → { id, name }, list → + slug, detail → + slug, parent_id.
 */
const CategoryRefSchema = z.object({ id: IdSchema, name: z.string().min(1) });
const CategoryWithSlugSchema = CategoryRefSchema.extend({ slug: z.string().min(1) });
const CategoryFullSchema = CategoryWithSlugSchema.extend({ parent_id: IdSchema.nullable() });

export const BrandSchema = z.object({ id: IdSchema, name: z.string().min(1) });

export const ProductImageSchema = z.object({
    id: IdSchema,
    file_name: z.string().min(1),
    title: z.string(),
});

export const ProductSpecSchema = z.object({
    id: IdSchema,
    product_id: IdSchema,
    spec_name: z.string().min(1),
    spec_value: z.string(),
    spec_unit: z.string().nullable(),
});

/** Fields every product response has (the search shape). */
export const ProductSchema = z.object({
    id: IdSchema,
    name: z.string().min(1),
    description: z.string(),
    price: z.number().nonnegative(),
    is_location_offer: z.boolean(),
    is_rental: z.boolean(),
    in_stock: z.boolean(),
    is_eco_friendly: z.boolean(),
    co2_rating: z.enum(["A", "B", "C", "D", "E"]),
    product_image: ProductImageSchema,
    category: CategoryRefSchema,
    brand: BrandSchema,
});

export const ProductListItemSchema = ProductSchema.extend({ category: CategoryWithSlugSchema });

export const ProductDetailSchema = ProductSchema.extend({
    category: CategoryFullSchema,
    specs: z.array(ProductSpecSchema),
});

export const ProductPageSchema = paginated(ProductListItemSchema);
export const ProductSearchPageSchema = paginated(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
