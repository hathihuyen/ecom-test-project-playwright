import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "@config/routes";
import { TIMEOUTS } from "@config/timeouts";

export class ProductDetailPage extends BasePage {
    readonly productName: Locator;
    readonly addToCartButton: Locator;
    readonly addedToCartToast: Locator;

    constructor(page: Page) {
        super(page);
        this.productName = page.getByTestId("product-name");
        this.addToCartButton = page.getByTestId("add-to-cart");
        this.addedToCartToast = page.getByLabel("Product added to shopping cart.");
    }

    async goto(productId: string) {
        await this.page.goto(ROUTES.product(productId));
    }

    /** Click "Add to cart" and wait until the cart call finished and the toast went away. */
    async addToCart() {
        const cartCall = this.page.waitForResponse(
            (r) => /\/carts\/[^/]+$/.test(new URL(r.url()).pathname) && r.request().method() === "POST"
        );
        await this.addToCartButton.click();
        await cartCall;
        await expect(this.addedToCartToast).toBeVisible();
        await expect(this.addedToCartToast).toBeHidden({ timeout: TIMEOUTS.toast });
    }
}
