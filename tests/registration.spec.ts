import { test, expect } from "@playwright/test";
import { createUser, createInvalidUser } from "../data/factory";
import { RegistrationPage } from "../pages/registration.page";
import { HeaderComponent } from "../components/header.component";

/**
 * We group our tests with test.describe(). Before each test runs, we generate two types of user data:
 * 1. A valid user for testing successfull registration
 * 2. An invalid user to test error handling
 * 
 * Setting the storage state to undefined ensures each test runs in a logged-out browser context.
 */
test.describe("Registration", () => {
    // Start every test logged out (overrides the project's customer storageState)
    test.use({ storageState: { cookies: [], origins: []} });
    
    /**
     * Verify that a new user can register successfully and is redirected
     * to the login page afterward
     */
    test("Successful user registration and lands in login page", async ({ page }) => {
        const user = createUser();
        const registrationPage = new RegistrationPage(page);
        const headerComponent = new HeaderComponent(page);

        await registrationPage.goto();
        
        await expect(headerComponent.signIn).toBeVisible();
        // proves we're logged out

        const responsePromise = page.waitForResponse( (response) => 
            response.url().includes("/users/register") && response.status() === 201
        );

        await registrationPage.register(user);
        await responsePromise;

        await expect(page).toHaveURL(/auth\/login/);
    });

    /*
    Invalid user and verify the error handling
    */
    test("Negative registration with invalid data", async ({ page }) => {
        const invalidUser = createInvalidUser();
        const registrationPage = new RegistrationPage(page);
        await registrationPage.goto();

        // await registrationPage.clearStorage(page);

        await registrationPage.firstNameInput.fill(invalidUser.firstName);
        await registrationPage.dobInput.fill(invalidUser.dob);
        await registrationPage.passwordInput.fill(invalidUser.password);

        await registrationPage.submit();

        await expect(page.getByText("First name is required")).toBeVisible();
        await expect(page.getByText("Please enter a valid date")).toBeVisible();
        await expect(
            page.getByText("Password must be minimal 6 characters long.")
        ).toBeVisible();
    });
});