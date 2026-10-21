import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { AUTH_FILES } from "../config/auth";
import { createUser } from "../data/factory";

setup("Create Customer 1 Authentication", async ({ page, request }) => {
    // 1. Create a brand-new customer through the API (servicves demo-site resets and lockouts)
    const customer = createUser();
    const response = await request.post("https://api.practicesoftwaretesting.com/users/register", {
        data: {
            first_name: customer.firstName,
            last_name: customer.lastName,
            dob: customer.dob,
            phone: customer.phone,
            email: customer.email,
            password: customer.password,
            address: {
                street: customer.streetAddress,
                house_number: customer.houseNumber,
                city: customer.city,
                state: customer.state,
                country: "US",
                postal_code: customer.zip,
            },
        },
    });
    expect(response.status(), `Register failed: ${await response.text()}`).toBe(201);
    
    // 2. Login through the UI and save the session
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(customer.email, customer.password, `${customer.firstName} ${customer.lastName}`);
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.customer1 });
});

setup("Create Admin Authentication", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!, "John Doe");
    // Save storage state into the file.
    await page.context().storageState({ path: AUTH_FILES.admin });
});