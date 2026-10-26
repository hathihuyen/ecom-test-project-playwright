import { test, expect, expectResponse } from "@fixtures";
import { MessageErrorSchema, ValidationErrorSchema } from "@api/schemas/common.schema";
import { CartCreatedSchema, CartResultSchema, CartSchema } from "@api/schemas/cart.schema";

const UNKNOWN_ID = "01AAAAAAAAAAAAAAAAAAAAAAAA";

/** Invalid "add to cart" requests and the field the API must name in its 422 response. */
const INVALID_ADD_ITEM_CASES = [
    { title: "quantity 0", productId: (inStockId: string) => inStockId, quantity: 0, field: "quantity" },
    { title: "unknown product", productId: () => UNKNOWN_ID, quantity: 1, field: "product_id" },
];

test.describe("Carts API", { tag: ["@api", "@contract"] }, () => {
    test("POST /carts creates an empty cart", async ({ cartsApi }) => {
        const created = await expectResponse(await cartsApi.create(), 201, CartCreatedSchema);

        const cart = await expectResponse(await cartsApi.get(created.id), 200, CartSchema);
        expect(cart.id).toBe(created.id);
        expect(cart.cart_items).toEqual([]);

        await cartsApi.delete(created.id);
    });

    test("a cart item can be added, updated and removed", async ({ cartsApi, cartId, api }) => {
        const product = await api.findInStockProduct("hand-tools");

        await test.step("add 2", async () => {
            await expectResponse(await cartsApi.addItem(cartId, product.id, 2), 200, CartResultSchema);
            const cart = await expectResponse(await cartsApi.get(cartId), 200, CartSchema);
            expect(cart.cart_items).toEqual([expect.objectContaining({ product_id: product.id, quantity: 2 })]);
        });

        await test.step("change quantity to 5", async () => {
            await expectResponse(await cartsApi.updateQuantity(cartId, product.id, 5), 200, CartResultSchema);
            const cart = await expectResponse(await cartsApi.get(cartId), 200, CartSchema);
            expect(cart.cart_items[0].quantity).toBe(5);
        });

        await test.step("remove it", async () => {
            expect((await cartsApi.removeItem(cartId, product.id)).status()).toBe(204);
            const cart = await expectResponse(await cartsApi.get(cartId), 200, CartSchema);
            expect(cart.cart_items).toEqual([]);
        });
    });

    test("DELETE /carts/{id} deletes the cart", async ({ cartsApi, cartId }) => {
        expect((await cartsApi.delete(cartId)).status()).toBe(204);
        await expectResponse(await cartsApi.get(cartId), 404, MessageErrorSchema);
    });

    test("GET /carts/{id} with an unknown id returns 404", { tag: "@negative" }, async ({ cartsApi }) => {
        await expectResponse(await cartsApi.get(UNKNOWN_ID), 404, MessageErrorSchema);
    });

    for (const data of INVALID_ADD_ITEM_CASES) {
        test(
            `adding an item with ${data.title} returns 422`,
            { tag: "@negative" },
            async ({ cartsApi, cartId, api }) => {
                const product = await api.findInStockProduct("hand-tools");

                const body = await expectResponse(
                    await cartsApi.addItem(cartId, data.productId(product.id), data.quantity),
                    422,
                    ValidationErrorSchema,
                );

                expect(Object.keys(body.errors)).toContain(data.field);
            },
        );
    }
});
