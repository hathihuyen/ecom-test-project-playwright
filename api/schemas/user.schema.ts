import { z } from "zod";
import { IdSchema, paginated } from "./common.schema";

export const AddressSchema = z.object({
    street: z.string().nullable(),
    house_number: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    postal_code: z.string().nullable(),
});

/** Response of POST /users/register. */
export const RegisteredUserSchema = z.object({
    id: IdSchema,
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.email(),
    dob: z.iso.date(),
    phone: z.string().nullable(),
    created_at: z.string().min(1),
    address: AddressSchema,
});

/** Response of GET /users/me. */
export const CurrentUserSchema = RegisteredUserSchema.extend({
    dob: z.iso.date().nullable(),
    provider: z.string().nullable(),
    totp_enabled: z.boolean(),
});

/** A user as an admin sees it (GET /users, GET /users/{id}). */
export const AdminUserViewSchema = CurrentUserSchema.extend({
    enabled: z.boolean(),
    role: z.enum(["user", "admin"]),
    failed_login_attempts: z.number().int().nonnegative(),
});

export const UserPageSchema = paginated(AdminUserViewSchema);

export const TokenSchema = z.object({
    access_token: z.string().min(20),
    token_type: z.string().regex(/^bearer$/i),
    expires_in: z.number().int().positive(),
});
