import { test, expect } from "@fixtures";
import { createUser, createInvalidUser } from "@data/factory";

/**
 * Registration flows. Every test starts logged out.
 */
test.describe("Registration", () => {
    // Start every test logged out (overrides the project's customer storageState)
    test.use({ storageState: { cookies: [], origins: [] } });

    /**
     * Verify that a new user can register successfully and is redirected
     * to the login page afterward
     */
    test(
        "Successful user registration and lands in login page",
        { tag: ["@smoke", "@regression"] },
        async ({ registrationPage, page, cleanupUsers }) => {
            const user = createUser();
            await registrationPage.goto();

            await expect(registrationPage.header.signIn).toBeVisible();
            // proves we're logged out

            const result = await registrationPage.register(user);
            expect(result.status).toBe(201);
            cleanupUsers.push(result.userId!);

            await expect(page).toHaveURL(/auth\/login/);
        },
    );

    /**
     * Invalid user and verify the error handling
     */
    test("show validation errors for invalid data", { tag: "@regression" }, async ({ registrationPage }) => {
        await registrationPage.goto();
        await registrationPage.fillForm(createInvalidUser());
        await registrationPage.submit();

        await expect(registrationPage.fieldError("first-name")).toContainText("First name is required");
        await expect(registrationPage.fieldError("dob")).toContainText("Please enter a valid date");
        await expect(registrationPage.fieldError("password")).toContainText(
            "Password must be minimal 6 characters long",
        );
    });
});
