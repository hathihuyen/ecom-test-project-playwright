import { z } from "zod";

/** Toolshop ids are ULIDs (26 characters). */
export const IdSchema = z.string().length(26);

/** Laravel's paginated list wrapper, used by every list endpoint. */
export const paginated = <T extends z.ZodType>(item: T) =>
    z.object({
        current_page: z.number().int().positive(),
        data: z.array(item),
        from: z.number().int().nullable(),
        last_page: z.number().int().nonnegative(),
        per_page: z.number().int().positive(),
        to: z.number().int().nullable(),
        total: z.number().int().nonnegative(),
    });

/** `{ "message": "…" }` – used by 401/403/404 on most endpoints. */
export const MessageErrorSchema = z.object({ message: z.string().min(1) });

/** `{ "error": "…" }` – used by login failures and some 404s. */
export const SimpleErrorSchema = z.object({ error: z.string().min(1) });

/** `{ "<field>": ["…"] }` – field validation errors (register). */
export const FieldErrorsSchema = z.record(z.string(), z.array(z.string().min(1)));

/** `{ "message": "…", "errors": { "<field>": ["…"] } }` – validation errors (carts). */
export const ValidationErrorSchema = z.object({ message: z.string().min(1), errors: FieldErrorsSchema });
