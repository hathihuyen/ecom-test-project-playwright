import { test as base } from "@playwright/test";
import { LoginPage } from "@pages/login.page";
import { RegistrationPage } from "@pages/registration.page";
import { ProductListPage } from "@pages/product-list.page";
import { ProductDetailPage } from "@pages/product-detail.page";
import { ToolshopApi } from "@api/toolshop.api";
import { env } from "@config/env";

type Fixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
    productListPage: ProductListPage;
    productDetailPage: ProductDetailPage;
    api: ToolshopApi;
    /** Push ids of users a test creates; they are deleted after the test. */
    cleanupUsers: string[];
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
    registrationPage: async ({ page }, use) => { await use(new RegistrationPage(page)); },
    productListPage: async ({ page }, use) => { await use(new ProductListPage(page)); },
    productDetailPage: async ({ page }, use) => { await use(new ProductDetailPage(page)); },
    api: async ({ request }, use) => { await use(new ToolshopApi(request)); },
    cleanupUsers: async ({ api }, use) => {
        const ids: string[] = [];
        await use(ids);
        if (ids.length === 0) return;
        const adminToken = await api.login(env.adminEmail, env.adminPassword);
        for (const id of ids) await api.deleteUser(id, adminToken);
    },
});

export { expect } from "@playwright/test";

/**
 * No longer need an adminAuthPage fiture. Put test.use({ storageState: AUTH_FILES.admin });
 * at the top of any admin spec. The normal page, and every page-object fixture,
 * will then be logged in as admin.
 * One fixture file is enough at this size. When it grows past about 150 lines, split
 * it into pages.fixture.ts and api.fixture.ts and combine them with mergeTests.
 */