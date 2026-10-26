import { test as base } from "@playwright/test";
import { LoginPage } from "@pages/login.page";
import { RegistrationPage } from "@pages/registration.page";
import { ProductListPage } from "@pages/product-list.page";
import { ProductDetailPage } from "@pages/product-detail.page";
import { ToolshopApi } from "@api/toolshop.api";
import { ProductsClient } from "@api/clients/products.client";
import { CartsClient } from "@api/clients/carts.client";
import { UsersClient } from "@api/clients/users.client";
import { env } from "@config/env";
import { createUser } from "@data/factory";
import { User } from "@models/user";
import { CheckoutPage } from "@pages/checkout/checkout.page";
import { InvoiceDetailPage, InvoiceListPage } from "@pages/invoices.page";

type Fixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
    productListPage: ProductListPage;
    productDetailPage: ProductDetailPage;
    api: ToolshopApi;
    /** Push ids of users a test creates; they are deleted after the test. */
    cleanupUsers: string[];
    /** A brand-new customer registered through the API; deleted after the test. */
    registeredUser: User;
    checkoutPage: CheckoutPage;
    invoiceListPage: InvoiceListPage;
    invoiceDetailPage: InvoiceDetailPage;
    /** For API testing */
    productsApi: ProductsClient;
    cartsApi: CartsClient;
    usersApi: UsersClient;
    /** Bearer token of `registeredUser`. */
    customerToken: string;
    /** Bearer token of the admin account. */
    adminToken: string;
    /** Id of a new, empty cart; deleted after the test. */
    cartId: string;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    registrationPage: async ({ page }, use) => {
        await use(new RegistrationPage(page));
    },
    productListPage: async ({ page }, use) => {
        await use(new ProductListPage(page));
    },
    productDetailPage: async ({ page }, use) => {
        await use(new ProductDetailPage(page));
    },
    api: async ({ request }, use) => {
        await use(new ToolshopApi(request));
    },
    cleanupUsers: async ({ api }, use) => {
        const ids: string[] = [];
        await use(ids);
        if (ids.length === 0) return;
        try {
            const adminToken = await api.login(env.adminEmail, env.adminPassword);
            for (const id of ids) await api.deleteUser(id, adminToken);
        } catch (error) {
            // Cleanup is best-effort: the demo DB may be resetting, which removes the user anyway
            console.warn(`Cleanup: could not delete test users ${ids.join(", ")}: ${(error as Error).message}`);
        }
    },
    registeredUser: async ({ api, cleanupUsers }, use) => {
        const user = createUser();
        cleanupUsers.push(await api.registerUser(user));
        await use(user);
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    invoiceListPage: async ({ page }, use) => {
        await use(new InvoiceListPage(page));
    },
    invoiceDetailPage: async ({ page }, use) => {
        await use(new InvoiceDetailPage(page));
    },
    productsApi: async ({ request }, use) => {
        await use(new ProductsClient(request));
    },
    cartsApi: async ({ request }, use) => {
        await use(new CartsClient(request));
    },
    usersApi: async ({ request }, use) => {
        await use(new UsersClient(request));
    },
    customerToken: async ({ api, registeredUser }, use) => {
        await use(await api.login(registeredUser.email, registeredUser.password));
    },
    adminToken: async ({ api }, use) => {
        await use(await api.login(env.adminEmail, env.adminPassword));
    },
    cartId: async ({ cartsApi }, use) => {
        const { id } = await (await cartsApi.create()).json();
        await use(id);
        await cartsApi.delete(id); // best-effort: a test may already have deleted it
    },
});

export { expect, expectResponse } from "./matchers";

/**
 * No longer need an adminAuthPage fixture. Put test.use({ storageState: AUTH_FILES.admin });
 * at the top of any admin spec. The normal page, and every page-object fixture,
 * will then be logged in as admin.
 * One fixture file is enough at this size. When it grows past about 150 lines, split
 * it into pages.fixture.ts and api.fixture.ts and combine them with mergeTests.
 */
