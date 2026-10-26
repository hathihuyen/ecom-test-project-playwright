import { test, expect, expectResponse } from "@fixtures";
import { MessageErrorSchema } from "@api/schemas/common.schema";
import { ProductDetailSchema, ProductPageSchema, ProductSearchPageSchema } from "@api/schemas/product.schema";

const UNKNOWN_ID = "01AAAAAAAAAAAAAAAAAAAAAAAA";

test.describe("Products API", { tag: ["@api", "@contract"] }, () => {
    test("GET /products returns the first page of products", async ({ productsApi }) => {
        const page = await expectResponse(await productsApi.list(), 200, ProductPageSchema);

        expect(page.current_page).toBe(1);
        expect(page.data.length).toBeGreaterThan(0);
        expect(page.data.length).toBeLessThanOrEqual(page.per_page);
        expect(page.total).toBeGreaterThanOrEqual(page.data.length);
    });

    test("GET /products?page=2 returns different products than page 1", async ({ productsApi }) => {
        const first = await expectResponse(await productsApi.list({ page: 1 }), 200, ProductPageSchema);
        const second = await expectResponse(await productsApi.list({ page: 2 }), 200, ProductPageSchema);

        expect(second.current_page).toBe(2);
        const firstIds = new Set(first.data.map((p) => p.id));
        expect(second.data.filter((p) => firstIds.has(p.id))).toEqual([]);
    });

    test("GET /products beyond the last page returns an empty page", async ({ productsApi }) => {
        const page = await expectResponse(await productsApi.list({ page: 999 }), 200, ProductPageSchema);

        expect(page.data).toEqual([]);
        expect(page.from).toBeNull();
    });

    test("GET /products/{id} returns that product with its specs", async ({ productsApi }) => {
        const { data } = await expectResponse(await productsApi.list(), 200, ProductPageSchema);
        const expected = data[0];

        const product = await expectResponse(await productsApi.get(expected.id), 200, ProductDetailSchema);

        expect(product.id).toBe(expected.id);
        expect(product.name).toBe(expected.name);
        expect(product.price).toBe(expected.price);
    });

    test("GET /products/search returns only matching products", async ({ productsApi }) => {
        const query = "pliers";
        const page = await expectResponse(await productsApi.search(query), 200, ProductSearchPageSchema);

        expect(page.data.length).toBeGreaterThan(0);
        for (const product of page.data) {
            expect(`${product.name} ${product.description}`.toLowerCase()).toContain(query);
        }
    });

    test("GET /products/{id} with an unknown id returns 404", { tag: "@negative" }, async ({ productsApi }) => {
        await expectResponse(await productsApi.get(UNKNOWN_ID), 404, MessageErrorSchema);
    });
});
