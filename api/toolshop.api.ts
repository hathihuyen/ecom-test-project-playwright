import { APIRequestContext, expect } from "@playwright/test";
import { env } from "@config/env";
import { User } from "@models/user";

/**
 * The field names follow the API's own documentation at api.practicesoftwaretesting.com/api/documentation.
 * Purpose of this:
 * 1. Arrange test data through the API. Create users, login and empty carts by calling
 * the API directly. Keeps the UI only for the behaviour under test. This is the biggest gain in speed
 * and stability once the suite grows.
 * 2. Clean up the registered users. Every run creates real accounts and never removes them.
 * Add teardown (an API delete, or a teardown project).
 */
export class ToolshopApi {
    constructor(private readonly request: APIRequestContext) {}

    // Register a user directly through the API; returns the new user's id.
    async registerUser(user: User): Promise<string> {
        const response = await this.request.post(`${env.apiUrl}/users/register`, {
            data: {
                first_name: user.firstName,
                last_name: user.lastName,
                dob: user.dob,
                phone: user.phone,
                email: user.email,
                password: user.password,
                address: {
                    street: user.streetAddress,
                    house_number: user.houseNumber,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    postal_code: user.zip,
                },
            },
        });
        expect(response.status(), `Register failed: ${await response.text()}`).toBe(201);
        return (await response.json()).id;
    }

    // Returns a Bearer token.
    async login(email: string, password: string): Promise<string> {
        const response = await this.request.post(`${env.apiUrl}/users/login`, { data: { email, password } });
        expect(response.status(), `Login failed for ${email}: ${await response.text()}`).toBe(200);
        return (await response.json()).access_token;
    }

    // First product in the category that is in stock right now (stock on the demo site changes all day).
    async findInStockProduct(categorySlug: string): Promise<{ id: string; name: string }> {
        const response = await this.request.get(`${env.apiUrl}/products`, {
            params: { by_category_slug: categorySlug, is_rental: "false" },
        });
        expect(response.status(), `Product search failed: ${await response.text()}`).toBe(200);

        const { data } = await response.json();
        const product = data.find((p: { in_stock: boolean }) => p.in_stock);
        if (!product) throw new Error(`No in-stock product found in category "${categorySlug}"`);
        return { id: product.id, name: product.name };
    }

    // Admin only. Never fails the test: a user with orders cannot be deleted (409).
    async deleteUser(userId: string, adminToken: string) {
        const response = await this.request.delete(`${env.apiUrl}/users/${userId}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (![204, 404].includes(response.status())) {
            console.warn(`Cleanup: could not delete user ${userId} (HTTP ${response.status()})`);
        }
    }
}
