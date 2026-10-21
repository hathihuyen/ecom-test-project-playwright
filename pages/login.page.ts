import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../config/routes";

export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    
    constructor(page: Page) {
        super(page);
        this.emailInput = page.getByTestId("email");
        this.passwordInput = page.getByTestId("password");
        this.loginButton = page.getByTestId("login-submit");
        this.errorMessage = page.getByTestId("login-error");
    }

    async goto() {
        await this.page.goto(ROUTES.login);
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /** Log in and fail with the site's own message if it rejects the login. */
    async loginAs(email: string, password: string, expectedName: string) {
        await this.login(email, password);
        await expect(this.header.userMenu.or(this.errorMessage)).toBeVisible();
        if (await this.errorMessage.isVisible()) {
            throw new Error(`Login failed for ${email}: ${await this.errorMessage.innerText()}`);
        }
        await expect(this.header.userMenu).toContainText(expectedName);
    }
}