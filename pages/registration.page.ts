import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../config/routes";
import { User } from "../types/user";

export type RegistrationField =
    | "first-name" | "last-name" | "dob" | "country" | "postal_code" | "house_number"
    | "street" | "city" | "state" | "phone" | "email" | "password";

export type RegistrationResult = {
    status: number;
    /** Id of the created user (only on success) */
    userId?: string;
};

export class RegistrationPage extends BasePage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly dobInput: Locator;
    readonly countryDropdown: Locator;
    readonly postalCodeInput: Locator;
    readonly houseNumberInput: Locator;
    readonly streetInput: Locator;
    readonly cityInput: Locator;
    readonly stateInput: Locator;
    readonly phoneInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.getByTestId("first-name");
        this.lastNameInput = page.getByTestId("last-name");
        this.dobInput = page.getByTestId("dob");
        this.countryDropdown = page.getByTestId("country");
        this.postalCodeInput = page.getByTestId("postal_code");
        this.houseNumberInput = page.getByTestId("house_number");
        this.streetInput = page.getByTestId("street");
        this.cityInput = page.getByTestId("city");
        this.stateInput = page.getByTestId("state");
        this.phoneInput = page.getByTestId("phone");
        this.emailInput = page.getByTestId("email");
        this.passwordInput = page.getByTestId("password");
        this.submitButton = page.getByTestId("register-submit");
    }

    async goto() {
        await this.page.goto(ROUTES.register);
    }

    /** Fill only the fields present in `user` (lets negative tests leave fields empty). */
    async fillForm(user: Partial<User>) {
        const fields: [Locator, string | undefined][] = [
            [this.firstNameInput, user.firstName],
            [this.lastNameInput, user.lastName],
            [this.dobInput, user.dob],
            [this.houseNumberInput, user.houseNumber],
            [this.streetInput, user.streetAddress],
            [this.postalCodeInput, user.zip],
            [this.cityInput, user.city],
            [this.stateInput, user.state],
            [this.phoneInput, user.phone],
            [this.emailInput, user.email],
            [this.passwordInput, user.password],
        ];
        for (const [input, value] of fields) {
            if (value !== undefined) await input.fill(value);
        }
        if (user.country) await this.countryDropdown.selectOption(user.country);
    }

    async submit() {
        await this.submitButton.click();
    }

    /** 
     * Fill and submit the form; returns the API status and the new user's id.
     * The response is captured with route.fetch() because the app redirects to /auth/login
     * straight away, and the browser drops response bodies of the page it navigates away from.
     */
    async register(user: User): Promise<RegistrationResult> {
        let resolveResult!: (result: RegistrationResult) => void;
        const result = new Promise<RegistrationResult>((resolve) => (resolveResult = resolve));

        /**
         * Instead of just watching the response, register() intercepts the request
         * with page.route. Playwright then makes the request itself with route.fetch(), so Playwright
         * holds the body regardless of what the page does. It reads the body, then passes
         * the response on to the page unchanged with route.fulfill().
         */
        await this.page.route("**/users/register", async (route) => {
            const response = await route.fetch();
            const body = await response.json().catch(() => ({}));
            await route.fulfill({ response });
            resolveResult({ status: response.status(), userId: body.id });
        }, { times: 1 });

        await this.fillForm(user);
        await this.submit();
        return result;
    }

    fieldError(field: RegistrationField): Locator {
        return this.page.getByTestId(`${field}-error`);
    }
}