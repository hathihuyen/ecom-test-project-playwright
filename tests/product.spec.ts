import { test, expect } from '../fixtures/adminAuth.fixture';
import { ProductListPage } from '../pages/product-list.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test("Add product to cart", async ({ adminAuthPage }) => {
  const productListPage = new ProductListPage(adminAuthPage);
  const productDetailPage = new ProductDetailPage(adminAuthPage);

  await productListPage.goto();
  await productListPage.header.openCategory("hand-tools");
  await productListPage.openProduct("Combination Pliers");
  await expect(productDetailPage.productName).toHaveText("Combination Pliers");

  // Waits for the cart API call and for the "added to cart" toast to disappear
  await productDetailPage.addToCart();
  await expect(productDetailPage.header.cartQuantity).toHaveText("1");
});
