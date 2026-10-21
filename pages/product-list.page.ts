import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../config/routes";

export class ProductListPage extends BasePage {
    readonly productCards: Locator;

    constructor(page: Page) {
        super(page);
        this.productCards = page.getByRole("link").filter({ has: page.getByTestId("product-name") });
    }

    async goto() {
        await this.page.goto(ROUTES.home)
    }

    productCard(name: string): Locator {
        return this.productCards.filter({ has: this.page.getByText(name, { exact: true }) });
    }

    async openProduct(name: string) {
        await this.productCard(name).click();
    }
}