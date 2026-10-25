import { Locator, Page } from "@playwright/test";

/** `data-test` ids of checkout step 1 (cart). */
export enum CartStepLocator {
    ProductTitle = "product-title",
    ProductQuantity = "product-quantity",
    LinePrice = "line-price",
    CartTotal = "cart-total",
    Proceed = "proceed-1",
}

export class CartStep {
    readonly productTitles: Locator;
    readonly total: Locator;
    readonly proceedButton: Locator;

    constructor(page: Page) {
        this.productTitles = page.getByTestId(CartStepLocator.ProductTitle);
        this.total = page.getByTestId(CartStepLocator.CartTotal);
        this.proceedButton = page.getByTestId(CartStepLocator.Proceed);
    }

    async proceed() {
        await this.proceedButton.click();
    }
}
