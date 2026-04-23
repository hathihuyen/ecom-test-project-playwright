import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

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
    readonly registerButton: Locator;

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
        this.registerButton = page.getByTestId("register-submit");
    }

    async goto() {
        await this.page.goto("/auth/register");
    }

    async fillPersonalInfo(firstname: string, lastname: string, dob: string) {
        await this.firstNameInput.fill(firstname);
        await this.lastNameInput.fill(lastname);
        await this.dobInput.fill(dob);
    }

    async fillAddressInfo(
        houseNumber: string,
        street: string, 
        postalCode: string, 
        city: string,
        state: string, 
        country: string
    ) {
        await this.houseNumberInput.fill(houseNumber);
        await this.streetInput.fill(street);
        await this.postalCodeInput.fill(postalCode);
        await this.cityInput.fill(city);
        await this.stateInput.fill(state);
        await this.countryDropdown.selectOption({ label: country});
    }

    async fillContactInfo(phone: string, email: string) {
        await this.phoneInput.fill(phone);
        await this.emailInput.fill(email);
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async submitRegistration() {
        await this.registerButton.click();
    }

    // Complete registration method that accepts a user object
    async registerUser(user: {
        firstName: string;
        lastName: string;
        dob: string;
        houseNumber: string;
        street: string;
        zipcode: string;
        city: string;
        state: string;
        country: string;
        phone?: string;
        email: string;
        password: string;
    }) {
        await this.fillPersonalInfo(user.firstName, user.lastName, user.dob);
        await this.fillAddressInfo(user.houseNumber, user.street, user.zipcode, user.city, user.state, user.country);
        await this.fillContactInfo(user.phone || "", user.email);
        await this.fillPassword(user.password);
        await this.submitRegistration();
    }
}