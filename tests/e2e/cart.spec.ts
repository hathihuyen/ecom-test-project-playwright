import { test, expect } from "@fixtures";

/**
 * Adding to the cart is a customer feature, so the test uses the default
 * customer session.
 */
test.describe("Cart", () => {
    test(
        "customer can add a product to the cart",
        { tag: ["@smoke", "@regression"] },
        async ({ api, productDetailPage }) => {
            const product = await api.findInStockProduct("hand-tools");

            await productDetailPage.goto(product.id);
            await expect(productDetailPage.productName).toHaveText(product.name);

            // Waits for the cart API call and for the "added to cart" toast to disappear
            await productDetailPage.addToCart();
            await expect(productDetailPage.header.cartQuantity).toHaveText("1");
        },
    );
});
