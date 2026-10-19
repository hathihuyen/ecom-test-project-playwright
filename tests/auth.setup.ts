import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { AUTH_FILES } from "../config/auth";

setup("Create Customer 1 Authentication", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.CUSTOMER_1_EMAIL!, process.env.CUSTOMER_1_PASSWORD!);
    // Verify login was successful
    await expect(loginPage.navMenu).toContainText("Huyen Test");
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.customer1 });
});

// setup('Create Customer 1 Authentication', async ( { page, context }) => {
//     const email = process.env.CUSTOMER_1_EMAIL || "";
//     const password = process.env.CUSTOMER_1_PASSWORD || "";
//     const customer1AuthFile = ".auth/customer1StorageState.json";
//     const loginPage = new LoginPage(page);
//     await loginPage.gotoHome();
//     await loginPage.navMenuSignIn.click();
//     await loginPage.login(email, password);

//     // Verify login was successful
//     await expect(loginPage.navMenu).toContainText("Jane Doe");
//     await expect(loginPage.navMenu).toContainText("Sign Out");
//     // Save storage state into the file.
//     await context.storageState({ path: customer1AuthFile });
// });

setup("Create Admin Authentication", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    // Verify login was successful
    await expect(loginPage.navMenu).toContainText("John Doe");
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.admin });
});