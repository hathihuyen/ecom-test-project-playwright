import { Locator, Page, Response } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../config/routes";
import { User } from "../types/user";

export type RegistrationField =
    | "first-name" | "last-name" | "dob" | "country" | "postal_code" | "house_number"
    | "street" | "city" | "state" | "phone" | "email" | "password";

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

    // async fillPersonalInfo(firstname: string, lastname: string, dob: string) {
    //     await this.firstNameInput.fill(firstname);
    //     await this.lastNameInput.fill(lastname);
    //     await this.dobInput.fill(dob);
    // }

    // async fillAddressInfo(
    //     houseNumber: string,
    //     street: string, 
    //     postalCode: string, 
    //     city: string,
    //     state: string, 
    //     country: string
    // ) {
    //     await this.houseNumberInput.fill(houseNumber);
    //     await this.streetInput.fill(street);
    //     await this.postalCodeInput.fill(postalCode);
    //     await this.cityInput.fill(city);
    //     await this.stateInput.fill(state);
    //     await this.countryDropdown.selectOption({ label: country});
    // }

    // async fillContactInfo(phone: string, email: string) {
    //     await this.phoneInput.fill(phone);
    //     await this.emailInput.fill(email);
    // }

    // async fillPassword(password: string) {
    //     await this.passwordInput.fill(password);
    // }

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

    /** Fill and submit the form; returns the API response so the test can assert on it. */
    async register(user: User): Promise<Response> {
        const responsePromise = this.page.waitForResponse(
            (r) => r.url().includes("/users/register") && r.request().method() === "POST"
        );
        await this.fillForm(user);
        await this.submit();
        return responsePromise;
    }

    fieldError(field: RegistrationField): Locator {
        return this.page.getByTestId(`${field}-error`);
    }

    // Complete registration method that accepts a user object
    // async registerUser(user: User) {
    //     await this.fillPersonalInfo(user.firstName, user.lastName, user.dob);
    //     await this.fillAddressInfo(
    //         user.houseNumber, 
    //         user.streetAddress, 
    //         user.zip, 
    //         user.city, 
    //         user.state, 
    //         user.country
    //     );
    //     await this.fillContactInfo(user.phone || "", user.email);
    //     await this.fillPassword(user.password);
    //     await this.submit();
    // }
}