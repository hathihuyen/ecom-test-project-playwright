import { test, expect } from "@playwright/test";
import { createUsers } from "../data/factory";
import { RegistrationPage } from "../pages/registration.page";

test.describe("Load test", () => {
    test("bulk user registration", async ({ browser }) => {
        // Generate 3 users for simulation. Adjust as needed.
        const users = createUsers(3);

        const registrations = users.map(async (user) => {
            let context;
            try {
                context = await browser.newContext();
                const page = await context.newPage();
                const registrationPage = new RegistrationPage(page);
                await registrationPage.goto();
                await registrationPage.fillPersonalInfo(
                    user.firstName, 
                    user.lastName, 
                    user.dob
                );
                await registrationPage.fillAddressInfo(
                    user.houseNumber, 
                    user.streetAddress, 
                    user.zip, 
                    user.city, 
                    user.state, 
                    user.country
                );
                await registrationPage.fillContactInfo(user.phone, user.email);
                await registrationPage.fillPassword(user.password);
                await registrationPage.submitRegistration();

                console.log(
                    `Registering ${user.firstName} ${user.lastName} concurrently...`
                );

                // Expect success
                await expect(page).toHaveURL(/auth\/login/);
            } finally {
                await context.close();
            }
        });

        await Promise.all(registrations);
    });
});