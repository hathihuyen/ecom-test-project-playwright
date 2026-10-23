import fs from "fs";
import { test as setup } from "@fixtures";
import { createUser } from "@data/factory";
import { AUTH_FILES, ADMIN_DISPLAY_NAME } from "@config/auth";
import { env } from "@config/env";

/**
 * The customer is now a new account created each run. Other people's failed login
 * can't lock it, the cart always starts empty, and do not need CUSTOMER_1_* secrets.
 */
setup("authenticate customer", async ({ api, loginPage, page }) => {
    // 1. Create a brand-new customer through the API (servives demo-site resets and lockouts)
    const customer = createUser();
    const userId = await api.registerUser(customer);

    // 2. Login through the UI and save the session
    await loginPage.goto();
    await loginPage.loginAs(customer.email, customer.password, `${customer.firstName} ${customer.lastName}`);
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.customer1 });
    fs.writeFileSync(AUTH_FILES.customer1User, JSON.stringify({ id: userId }));
});

setup("authenticate admin", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAs(env.adminEmail, env.adminPassword, ADMIN_DISPLAY_NAME);
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.admin });
});