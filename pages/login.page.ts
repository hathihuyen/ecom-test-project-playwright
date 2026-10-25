import { Locator, Page, Request, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { ApiPath, ROUTES } from "@config/routes";

/** `data-test` ids of the login page. The only place these strings may appear. */
export enum LoginLocator {
    EmailInput = "email",
    PasswordInput = "password",
    SubmitButton = "login-submit",
    LoginError = "login-error",
    EmailError = "email-error",
    PasswordError = "password-error",
}

/** Form fields that can show a validation error. */
export enum LoginField {
    Email = "email",
    Password = "password",
}

/** How the form is submitted. */
export enum SubmitMethod {
    Click = "click",
    EnterKey = "enter",
}

const FIELD_ERROR: Record<LoginField, LoginLocator> = {
    [LoginField.Email]: LoginLocator.EmailError,
    [LoginField.Password]: LoginLocator.PasswordError,
};

const isLoginCall = (request: Request) =>
    request.method() === "POST" && new URL(request.url()).pathname === ApiPath.Login;

export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.emailInput = page.getByTestId(LoginLocator.EmailInput);
        this.passwordInput = page.getByTestId(LoginLocator.PasswordInput);
        this.submitButton = page.getByTestId(LoginLocator.SubmitButton);
        this.errorMessage = page.getByTestId(LoginLocator.LoginError);
    }

    async goto() {
        await this.page.goto(ROUTES.login);
    }

    fieldError(field: LoginField): Locator {
        return this.page.getByTestId(FIELD_ERROR[field]);
    }

    async login(email: string, password: string, via: SubmitMethod = SubmitMethod.Click) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        if (via === SubmitMethod.EnterKey) {
            await this.passwordInput.press("Enter");
        } else {
            await this.submitButton.click();
        }
    }

    /** Submit the form and return the HTTP status of the login API call. */
    async loginAndGetStatus(email: string, password: string, via: SubmitMethod = SubmitMethod.Click): Promise<number> {
        const response = this.page.waitForResponse((r) => isLoginCall(r.request()));
        await this.login(email, password, via);
        return (await response).status();
    }

    /** Start counting login API calls; call the returned function to read the count. */
    trackLoginRequests(): () => number {
        let count = 0;
        this.page.on("request", (request) => {
            if (isLoginCall(request)) count++;
        });
        return () => count;
    }

    /** Log in and fail with the site's own message if it rejects the login. */
    async loginAs(email: string, password: string, expectedName: string) {
        await this.login(email, password);
        await expect(this.header.userMenu.or(this.errorMessage)).toBeVisible();
        if (await this.errorMessage.isVisible()) {
            throw new Error(`Login failed for ${email}: ${await this.errorMessage.innerText()}`);
        }
        await expect(this.header.userMenu).toContainText(expectedName);
    }
}

// import { Locator, Page, expect } from "@playwright/test";
// import { BasePage } from "./base.page";
// import { ROUTES } from "@config/routes";

// export class LoginPage extends BasePage {
//     readonly emailInput: Locator;
//     readonly passwordInput: Locator;
//     readonly loginButton: Locator;
//     readonly errorMessage: Locator;

//     constructor(page: Page) {
//         super(page);
//         this.emailInput = page.getByTestId("email");
//         this.passwordInput = page.getByTestId("password");
//         this.loginButton = page.getByTestId("login-submit");
//         this.errorMessage = page.getByTestId("login-error");
//     }

//     async goto() {
//         await this.page.goto(ROUTES.login);
//     }

//     async login(email: string, password: string) {
//         await this.emailInput.fill(email);
//         await this.passwordInput.fill(password);
//         await this.loginButton.click();
//     }

//     /** Log in and fail with the site's own message if it rejects the login. */
//     async loginAs(email: string, password: string, expectedName: string) {
//         await this.login(email, password);
//         await expect(this.header.userMenu.or(this.errorMessage)).toBeVisible();
//         if (await this.errorMessage.isVisible()) {
//             throw new Error(`Login failed for ${email}: ${await this.errorMessage.innerText()}`);
//         }
//         await expect(this.header.userMenu).toContainText(expectedName);
//     }
// }
