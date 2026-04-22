import { test, expect } from '../fixtures/adminAuth.fixture';
import { ProductPage } from '../pages/product.page';

test("Add product to cart", async ({ adminAuthPage }) => {
  const productPage = new ProductPage(adminAuthPage);
  await productPage.gotoHome();
  await productPage.selectCategory("Hand Tools");
  await productPage.clickProductByIndex(0);

  await expect(productPage.productName).toHaveText("Combination Pliers");
  await productPage.addToCartButton.click();
  await expect(productPage.addedToCartMessage).toHaveText("Product added to shopping cart.");

  // wait for the message to disappear (up to 10 seconds)
  await expect(productPage.addedToCartMessage).not.toBeVisible({ timeout: 10000, });
  await expect(productPage.navCartQuantity).toHaveText("1");
});
