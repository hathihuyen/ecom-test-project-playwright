import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../data/products';

/**
 * Adding to the cart is a customer feature, so the test uses the default
 * customer session.
 */
test.describe("Cart", () => {
  test("custoer can add a product to the cart", { tag: ["@smoke", "@regression"] },
    async ({ productListPage, productDetailPage }) => {
        const product = PRODUCTS.combinationPliers;

        await productListPage.goto();
        await productListPage.header.openCategory(product.category);
        await productListPage.openProduct(product.name);
        await expect(productDetailPage.productName).toHaveText(product.name);

        // Waits for the cart API call and for the "added to cart" toast to disappear
        await productDetailPage.addToCart();
        await expect(productDetailPage.header.cartQuantity).toHaveText("1");
    });
});
