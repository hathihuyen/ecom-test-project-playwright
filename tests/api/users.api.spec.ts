import { APIResponse } from "@playwright/test";
import { test, expect, expectResponse } from "@fixtures";
import { createUser } from "@data/factory";
import { toRegisterPayload } from "@api/payloads";
import { UsersClient } from "@api/clients/users.client";
import { FieldErrorsSchema, MessageErrorSchema, SimpleErrorSchema } from "@api/schemas/common.schema";
import {
    AdminUserViewSchema,
    CurrentUserSchema,
    RegisteredUserSchema,
    TokenSchema,
    UserPageSchema,
} from "@api/schemas/user.schema";

type Tokens = { customer: string; admin: string };

/** Who may call what. Each row becomes one test. */
const ACCESS_RULES: {
    title: string;
    call: (users: UsersClient, tokens: Tokens) => Promise<APIResponse>;
    status: number;
}[] = [
    { title: "anonymous GET /users/me", call: (users) => users.me(), status: 401 },
    { title: "anonymous GET /users", call: (users) => users.list(), status: 401 },
    { title: "customer GET /users (admin only)", call: (users, t) => users.list(t.customer), status: 403 },
    { title: "admin GET /users", call: (users, t) => users.list(t.admin), status: 200 },
];

test.describe("Users API", { tag: ["@api", "@contract"] }, () => {
    test("POST /users/register creates a user and never returns the password", async ({ usersApi, cleanupUsers }) => {
        const user = createUser();

        const created = await expectResponse(
            await usersApi.register(toRegisterPayload(user)),
            201,
            RegisteredUserSchema,
        );
        cleanupUsers.push(created.id);

        expect(created).toMatchObject({ first_name: user.firstName, last_name: user.lastName, email: user.email });
        expect(created).not.toHaveProperty("password");
    });

    test("registering an email twice returns 409", { tag: "@negative" }, async ({ usersApi, registeredUser }) => {
        const body = await expectResponse(
            await usersApi.register(toRegisterPayload(createUser({ email: registeredUser.email }))),
            409,
            FieldErrorsSchema,
        );
        expect(body).toHaveProperty("email");
    });

    test(
        "registering without required fields returns 422 naming each field",
        { tag: "@negative" },
        async ({ usersApi }) => {
            const body = await expectResponse(await usersApi.register({ email: "x" }), 422, FieldErrorsSchema);
            expect(Object.keys(body)).toEqual(expect.arrayContaining(["first_name", "last_name", "password"]));
        },
    );

    test("POST /users/login returns a token that identifies the user", async ({ usersApi, registeredUser }) => {
        const token = await expectResponse(
            await usersApi.login(registeredUser.email, registeredUser.password),
            200,
            TokenSchema,
        );

        const me = await expectResponse(await usersApi.me(token.access_token), 200, CurrentUserSchema);
        expect(me.email).toBe(registeredUser.email);
    });

    test(
        "POST /users/login with a wrong password returns 401",
        { tag: "@negative" },
        async ({ usersApi, registeredUser }) => {
            await expectResponse(await usersApi.login(registeredUser.email, "Wrong#Pass1"), 401, SimpleErrorSchema);
        },
    );

    test("admin sees the full user record", async ({ usersApi, registeredUser, customerToken, adminToken }) => {
        const page = await expectResponse(await usersApi.list(adminToken), 200, UserPageSchema);
        expect(page.data.length).toBeGreaterThan(0);

        const me = await expectResponse(await usersApi.me(customerToken), 200, CurrentUserSchema);
        const user = await expectResponse(await usersApi.get(me.id, adminToken), 200, AdminUserViewSchema);
        expect(user).toMatchObject({ email: registeredUser.email, role: "user", enabled: true });
    });

    test.describe("access control", { tag: "@negative" }, () => {
        for (const rule of ACCESS_RULES) {
            test(`${rule.title} returns ${rule.status}`, async ({ usersApi, customerToken, adminToken }) => {
                const response = await rule.call(usersApi, { customer: customerToken, admin: adminToken });
                expect(response.status(), await response.text()).toBe(rule.status);
            });
        }
    });

    test("an admin can delete a user; it is gone afterwards", async ({ usersApi, adminToken, cleanupUsers }) => {
        const created = await expectResponse(
            await usersApi.register(toRegisterPayload(createUser())),
            201,
            RegisteredUserSchema,
        );
        cleanupUsers.push(created.id); // safety net if the delete below fails

        expect((await usersApi.delete(created.id, adminToken)).status()).toBe(204);
        await expectResponse(await usersApi.get(created.id, adminToken), 404, SimpleErrorSchema);
    });

    test("a customer cannot delete users", { tag: "@negative" }, async ({ usersApi, customerToken }) => {
        const me = await expectResponse(await usersApi.me(customerToken), 200, CurrentUserSchema);
        await expectResponse(await usersApi.delete(me.id, customerToken), 403, MessageErrorSchema);
    });
});
