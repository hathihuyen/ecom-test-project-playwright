import { test, expect } from "@fixtures";
import { createUsers } from "@data/factory";
import { RegistrationPage } from "@pages/registration.page";

test.describe("Concurrent registration", { tag: "@stress"}, () => {
    test("several users can register at the same time", async ({ browser, cleanupUsers }) => {
        // Generate 3 users for simulation. Adjust as needed.
        const users = createUsers(3);

        await Promise.all(users.map((user) => test.step(`register ${user.email}`, async () => {
            // passing an explicit empty storageState is deliberate. Contexts you create yourself
            // pick up the project's user settings, which include the customer login
            const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
            try {
                const page = await context.newPage();
                const registrationPage = new RegistrationPage(page);
                await registrationPage.goto();
                const result = await registrationPage.register(user);

                // Expect success
                expect(result.status).toBe(201);
                cleanupUsers.push(result.userId!);
            } finally {
                await context.close();
            }
        })));
    });
});