import { Locator, Page } from "@playwright/test";

/**
 * Use composition for the nav bar instead of inheritance. Move the nav locators out of BasePage
 * into a HeaderComponent and expose it as this.header.
 * The nav bar becomes a component that pages have, instead of a parent class they are.
 */
export type Category = "hand-tools" | "power-tools" | "other" | "special-tools" | "rentals";

export class HeaderComponent {
    readonly userMenu: Locator;
    readonly home: Locator;
    readonly categories: Locator;
    readonly contact: Locator;
    readonly signIn: Locator;
    readonly languageSelect: Locator;
    readonly cart: Locator;
    readonly cartQuantity: Locator;

    constructor(private readonly page: Page) {
        this.userMenu = page.getByTestId("nav-menu");
        this.home = page.getByTestId("nav-home");
        this.categories = page.getByTestId("nav-categories");
        this.contact = page.getByTestId("nav-contact");
        this.signIn = page.getByTestId("nav-sign-in");
        this.languageSelect = page.getByTestId("language-select");
        this.cart = page.getByTestId("nav-cart");
        this.cartQuantity = page.getByTestId("cart-quantity");
    }

    async openCategory(category: Category) {
        await this.categories.click();
        await this.page.getByTestId(`nav-${category}`).click();
    }
}
