import { test, expect } from "@playwright/test";
import { createUser, createInvalidUser, createDOB } from "../data/factory";
import { RegistrationPage } from "../pages/registration.page";

/**
 * We group our tests with test.describe(). Before each test runs, we generate two types of user data:
 * 1. A valid user for testing successfull registration
 * 2. An invalid user to test error handling
 * 
 * Setting the storage state to undefined ensures each test runs in a logged-out browser context.
 */
test.describe("Group tests before each test runs", async () => {
    let user: any;
    let invalidUser: any;

    test.use({ storageState: undefined });
    test.beforeEach(async () => {
        invalidUser = createInvalidUser();
        user = createUser();
    });
    
    /**
     * Verify that a new user can register successfully and is redirected
     * to the login page afterward
     */
    test("Successful user registration and lands in login page", async ({ page }) => {
        const registrationPage = new RegistrationPage(page);

        await registrationPage.goto();
        await registrationPage.clearStorage(page);

        await registrationPage.firstNameInput.fill(user.firstName);
        await registrationPage.lastNameInput.fill(user.lastName);
        await registrationPage.dobInput.fill(user.dob);
        await registrationPage.houseNumberInput.fill(user.houseNumber);
        await registrationPage.streetInput.fill(user.streetAddress);
        await registrationPage.postalCodeInput.fill(user.zip);
        await registrationPage.cityInput.fill(user.city);
        await registrationPage.stateInput.fill(user.state);
        await registrationPage.countryDropdown.selectOption({ label: user.country });
        await registrationPage.phoneInput.fill(user.phone);
        await registrationPage.emailInput.fill(user.email);
        await registrationPage.passwordInput.fill(user.password);

        const responsePromise = page.waitForResponse( (response) => 
            response.url().includes("/users/register") && response.status() === 201
        );

        await registrationPage.submitRegistration();
        await responsePromise;

        await expect(page).toHaveURL(/auth\/login/);
    });

    /*
    Invalid user and verify the error handling
    */
    test("Negative registration with invalid data", async ({ page }) => {
        const registrationPage = new RegistrationPage(page);
        await registrationPage.goto();

        await registrationPage.clearStorage(page);

        await registrationPage.firstNameInput.fill(invalidUser.firstName);
        await registrationPage.dobInput.fill(invalidUser.dob);
        await registrationPage.passwordInput.fill(invalidUser.password);

        await registrationPage.submitRegistration();

        await expect(page.getByText("First name is required")).toBeVisible();
        await expect(page.getByText("Please enter a valid date")).toBeVisible();
        await expect(
        page.getByText("Password must be minimal 6 characters long.")
        ).toBeVisible();
    });
});