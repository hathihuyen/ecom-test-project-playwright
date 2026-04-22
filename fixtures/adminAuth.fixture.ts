import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/*
The fixture starts by extending the base test framework with a custom adminAuthPage fixture.
The fixture performs the login process using environment variables for credentials, saves the
authentication state to a JSON file (
adminStorageState.json
), and then provides each test with a fresh, pre-authenticated page context. 
This pattern centralizes the login operations across tests, much like our setup project, 
and ensures proper isolation by giving each test its own session. This approach is very 
useful when you have a short-lived authentication, and you want to create a new 
authentication every time the fixture is used
*/

// Simple fixture that provides an authenticated page
export const test = base.extend<{ adminAuthPage: Page}>({
    adminAuthPage: async ({ browser }, use) => {
        const storageStatePath = ".auth/adminStorageState.json";

        const setupContext = await browser.newContext();
        const setupPage = await setupContext.newPage();
        const loginPage = new LoginPage(setupPage);
        await loginPage.goto();
        await loginPage.login(
            process.env.ADMIN_EMAIL!,
            process.env.ADMIN_PASSWORD!
        );
        await expect(loginPage.navMenu).toContainText("John Doe");

        await setupContext.storageState({ path: storageStatePath });
        await setupContext.close();

        // Create new context with saved auth state
        const context = await browser.newContext({
            storageState: storageStatePath,
        });

        const page = await context.newPage();
        await use(page);
        await context.close();
    },
});

export { expect} from "@playwright/test";