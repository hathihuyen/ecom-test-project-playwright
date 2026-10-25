import { test, expect } from "@fixtures";
import {
    ACCEPTED_VARIANT_CASES,
    INVALID_INPUT_CASES,
    MAX_FAILED_LOGIN_ATTEMPTS,
    REJECTED_CREDENTIAL_CASES,
} from "@data/login.data";
import { LoginMessage } from "@data/messages";

test.describe("Login", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.describe("form validation", { tag: ["@regression", "@negative"] }, () => {
        for (const data of INVALID_INPUT_CASES) {
            test(`shows field errors for ${data.title}`, async ({ loginPage }) => {
                await loginPage.goto();
                const loginCalls = loginPage.trackLoginRequests();

                await loginPage.login(data.email, data.password);

                for (const { field, message } of data.errors) {
                    await expect(loginPage.fieldError(field)).toHaveText(message);
                }
                expect(loginCalls(), "the form must not call the API").toBe(0);
            });
        }
    });

    test.describe("rejected credentials", { tag: ["@regression", "@negative"] }, () => {
        for (const data of REJECTED_CREDENTIAL_CASES) {
            test(`rejects ${data.title}`, async ({ loginPage, registeredUser }) => {
                await loginPage.goto();

                const status = await loginPage.loginAndGetStatus(
                    data.email(registeredUser),
                    data.password(registeredUser),
                );

                expect(status).toBe(401);
                await expect(loginPage.errorMessage).toHaveText(LoginMessage.InvalidCredentials);
                await expect(loginPage.header.signIn).toBeVisible();
            });
        }
    });

    test.describe("accepted edge cases", { tag: ["@regression", "@edge"] }, () => {
        for (const data of ACCEPTED_VARIANT_CASES) {
            test(`logs in with ${data.title}`, async ({ loginPage, registeredUser, page }) => {
                await loginPage.goto();

                const status = await loginPage.loginAndGetStatus(
                    data.email(registeredUser),
                    data.password(registeredUser),
                    data.submitWith,
                );

                expect(status).toBe(200);
                await expect(page).toHaveURL(/\/account/);
                await expect(loginPage.header.userMenu).toContainText(
                    `${registeredUser.firstName} ${registeredUser.lastName}`,
                );
            });
        }
    });

    test(
        `locks the account after ${MAX_FAILED_LOGIN_ATTEMPTS} wrong passwords`,
        { tag: ["@regression", "@negative"] },
        async ({ loginPage, registeredUser }) => {
            await loginPage.goto();

            for (let attempt = 1; attempt <= MAX_FAILED_LOGIN_ATTEMPTS; attempt++) {
                await test.step(`wrong password, attempt ${attempt}`, async () => {
                    expect(await loginPage.loginAndGetStatus(registeredUser.email, "Wrong#Pass1")).toBe(401);
                });
            }

            await test.step("even the correct password is now refused", async () => {
                expect(await loginPage.loginAndGetStatus(registeredUser.email, registeredUser.password)).toBe(423);
                await expect(loginPage.errorMessage).toHaveText(LoginMessage.AccountLocked);
            });
        },
    );
});
